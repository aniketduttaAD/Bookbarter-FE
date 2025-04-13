import api from "./api";
import { toast } from "react-hot-toast";
import { Book, Rating, WishlistItem } from "@/types";
import { useAuthStore } from "@/store/auth-store";

const getAuthHeaders = () => {
    if (typeof window !== 'undefined') {
        const token = useAuthStore.getState().token;
        return token ? { Authorization: `Bearer ${token}` } : {};
    }
    return {};
};

type StorageKey =
    | "user"
    | "books"
    | "ratings"
    | "wishlist"
    | "threads"
    | "messages"
    | "offline-actions";

interface OfflineAction<T = unknown> {
    id: string;
    timestamp: number;
    action: string;
    endpoint: string;
    data: T;
    status: "pending" | "processing" | "completed" | "failed";
    error?: string;
}

type ApiConfig = {
    headers?: Record<string, string>;
    params?: Record<string, string | number | boolean>;
    [key: string]: unknown;
};

type JsonObject = Record<string, unknown> | FormData;

type ApiWrapper = {
    get: <T>(url: string, fallbackData?: T) => Promise<T>;
    post: <T>(url: string, data: JsonObject, config?: ApiConfig) => Promise<T>;
    patch: <T>(url: string, data: JsonObject, config?: ApiConfig) => Promise<T>;
    delete: (url: string) => Promise<void>;
    sync: () => Promise<void>;
};

let db: IDBDatabase | null = null;
const DB_NAME = "p2p-book-exchange";
const DB_VERSION = 1;

export const initOfflineStorage = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (typeof window === "undefined") {
            reject("IndexedDB not available (server-side)");
            return;
        }

        if (!window.indexedDB) {
            console.warn("IndexedDB not supported, falling back to localStorage");
            resolve();
            return;
        }

        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error("IndexedDB error:", event);
            reject("Failed to open IndexedDB");
        };

        request.onsuccess = (event) => {
            db = (event.target as IDBOpenDBRequest).result;
            resolve();
        };

        request.onupgradeneeded = (event) => {
            const database = (event.target as IDBOpenDBRequest).result;

            if (!database.objectStoreNames.contains("books")) {
                database.createObjectStore("books", { keyPath: "id" });
            }
            if (!database.objectStoreNames.contains("ratings")) {
                database.createObjectStore("ratings", { keyPath: "id" });
            }
            if (!database.objectStoreNames.contains("wishlist")) {
                database.createObjectStore("wishlist", { keyPath: "id" });
            }
            if (!database.objectStoreNames.contains("threads")) {
                database.createObjectStore("threads", { keyPath: "id" });
            }
            if (!database.objectStoreNames.contains("messages")) {
                database.createObjectStore("messages", { keyPath: "id" });
            }
            if (!database.objectStoreNames.contains("offline-actions")) {
                database.createObjectStore("offline-actions", { keyPath: "id" });
            }
            if (!database.objectStoreNames.contains("user")) {
                database.createObjectStore("user", { keyPath: "id" });
            }
        };
    });
};

interface WithId {
    id: string;
}

const hasId = <T>(item: T): item is T & WithId => {
    return (
        typeof item === "object" &&
        item !== null &&
        "id" in item &&
        typeof (item as unknown as WithId).id === "string"
    );
};

const storeInLocalStorage = <T>(
    key: StorageKey,
    data: T | T[],
    replace = false
): void => {
    try {
        if (Array.isArray(data)) {
            if (replace) {
                localStorage.setItem(key, JSON.stringify(data));
            } else {
                const existing: unknown[] = JSON.parse(
                    localStorage.getItem(key) || "[]"
                );

                const merged = [...existing];
                for (const item of data) {
                    if (hasId(item)) {
                        const index = merged.findIndex((i) => hasId(i) && i.id === item.id);
                        if (index >= 0) {
                            merged[index] = item;
                        } else {
                            merged.push(item);
                        }
                    } else {
                        merged.push(item);
                    }
                }

                localStorage.setItem(key, JSON.stringify(merged));
            }
        } else {
            if (hasId(data)) {
                const existing: unknown = JSON.parse(localStorage.getItem(key) || "[]");

                if (Array.isArray(existing)) {
                    const index = existing.findIndex((i) => hasId(i) && i.id === data.id);
                    if (index >= 0) {
                        existing[index] = data;
                    } else {
                        existing.push(data);
                    }
                    localStorage.setItem(key, JSON.stringify(existing));
                } else {
                    localStorage.setItem(key, JSON.stringify(data));
                }
            } else {
                localStorage.setItem(key, JSON.stringify(data));
            }
        }
    } catch (error) {
        console.error("localStorage store error:", error);
    }
};

const retrieveFromLocalStorage = <T>(
    key: StorageKey,
    id?: string
): T | T[] | null => {
    try {
        const data = localStorage.getItem(key);
        if (!data) return null;

        const parsed: unknown = JSON.parse(data);

        if (id) {
            if (Array.isArray(parsed)) {
                return (
                    (parsed.find((item) => hasId(item) && item.id === id) as T) || null
                );
            }
            if (hasId(parsed) && parsed.id === id) {
                return parsed as T;
            }
            return null;
        }

        return parsed as T | T[];
    } catch (error) {
        console.error("localStorage retrieve error:", error);
        return null;
    }
};

export const storeData = async <T>(
    key: StorageKey,
    data: T | T[],
    replace = false
): Promise<void> => {
    if (db) {
        try {
            const tx = db.transaction(key, "readwrite");
            const store = tx.objectStore(key);

            if (Array.isArray(data)) {
                if (replace) {
                    const clearRequest = store.clear();
                    await new Promise<void>((resolve, reject) => {
                        clearRequest.onsuccess = () => resolve();
                        clearRequest.onerror = () => reject(clearRequest.error);
                    });
                }

                for (const item of data) {
                    if (!hasId(item)) {
                        console.warn(`Skipped item without valid id for store "${key}"`, item);
                        continue;
                    }
                    store.put(item);
                }
            } else {
                if (!hasId(data)) {
                    console.warn(`Skipped data without valid id for store "${key}"`, data);
                    return;
                }
                store.put(data);
            }

            await new Promise<void>((resolve, reject) => {
                tx.oncomplete = () => resolve();
                tx.onerror = () => reject(tx.error);
            });
        } catch (error) {
            console.error("IndexedDB store error:", error);
            storeInLocalStorage(key, data, replace);
        }
    } else {
        storeInLocalStorage(key, data, replace);
    }
};

export const retrieveData = async <T>(
    key: StorageKey,
    id?: string
): Promise<T | T[] | null> => {
    if (db) {
        try {
            const tx = db.transaction(key, "readonly");
            const store = tx.objectStore(key);

            if (id) {
                const request = store.get(id);
                return new Promise<T | null>((resolve, reject) => {
                    request.onsuccess = () => resolve(request.result as T | null);
                    request.onerror = () => reject(request.error);
                });
            } else {
                const request = store.getAll();
                return new Promise<T[]>((resolve, reject) => {
                    request.onsuccess = () => resolve(request.result as T[]);
                    request.onerror = () => reject(request.error);
                });
            }
        } catch (error) {
            console.error("IndexedDB retrieve error:", error);
            return retrieveFromLocalStorage<T>(key, id);
        }
    } else {
        return retrieveFromLocalStorage<T>(key, id);
    }
};

export const queueOfflineAction = async <T>(
    action: string,
    endpoint: string,
    data: T
): Promise<string> => {
    const id = Math.random().toString(36).substring(2, 15);
    const offlineAction: OfflineAction<T> = {
        id,
        timestamp: Date.now(),
        action,
        endpoint,
        data,
        status: "pending",
    };

    await storeData<OfflineAction<T>>("offline-actions", offlineAction);
    return id;
};

export const processOfflineActions = async (
    processAction: (action: OfflineAction<unknown>) => Promise<boolean>
): Promise<number> => {
    const actions = await retrieveData<OfflineAction<unknown>>("offline-actions");

    if (!actions || !Array.isArray(actions) || actions.length === 0) {
        return 0;
    }

    let processedCount = 0;

    const pendingActions = actions
        .filter((action) => "status" in action && action.status === "pending")
        .sort((a, b) =>
            "timestamp" in a && "timestamp" in b ? a.timestamp - b.timestamp : 0
        );

    for (const action of pendingActions) {
        action.status = "processing";
        await storeData<OfflineAction<unknown>>("offline-actions", action);

        try {
            const success = await processAction(action);

            if (success) {
                action.status = "completed";
                processedCount++;
            } else {
                action.status = "failed";
                action.error = "Action processing failed";
            }
        } catch (error) {
            action.status = "failed";
            action.error = error instanceof Error ? error.message : "Unknown error";
        }

        await storeData<OfflineAction<unknown>>("offline-actions", action);
    }

    return processedCount;
};

export const cleanupOfflineActions = async (
    statuses: Array<"completed" | "failed"> = ["completed"]
): Promise<number> => {
    const actions = await retrieveData<OfflineAction<unknown>>("offline-actions");

    if (!actions || !Array.isArray(actions) || actions.length === 0) {
        return 0;
    }

    const remainingActions = actions.filter(
        (action) =>
            !("status" in action) ||
            !statuses.includes(action.status as "completed" | "failed")
    );

    const removedCount = actions.length - remainingActions.length;

    if (removedCount > 0) {
        await storeData<OfflineAction<unknown>[]>(
            "offline-actions",
            remainingActions,
            true
        );
    }

    return removedCount;
};

function getStorageKeyFromUrl(url: string): StorageKey | null {
    if (url.includes("/books")) return "books";
    if (url.includes("/ratings")) return "ratings";
    if (url.includes("/wishlist")) return "wishlist";
    if (url.includes("/messages/threads") && !url.includes("/messages"))
        return "threads";
    if (url.includes("/messages")) return "messages";
    return null;
}

function extractIdFromUrl(url: string): string | null {
    const match = url.match(/\/([a-zA-Z0-9-]+)\/?$/);
    return match ? match[1] : null;
}

export const offlineApi: ApiWrapper = {
    get: async <T>(url: string, fallbackData?: T): Promise<T> => {
        try {
            const headers = getAuthHeaders();
            const response = await api.get<T>(url, { headers });
            const storageKey = getStorageKeyFromUrl(url);
            if (storageKey) {
                await storeData(storageKey, response.data);
            }
            return response.data;
        } catch (error) {
            if (!navigator.onLine) {
                const storageKey = getStorageKeyFromUrl(url);
                if (storageKey) {
                    const cachedData = await retrieveData<T>(storageKey);
                    if (cachedData) {
                        toast.success("Using cached data while offline");
                        return cachedData as T;
                    }
                }
                if (fallbackData !== undefined) {
                    toast.success("Using default data while offline");
                    return fallbackData;
                }
                toast.error("No cached data available offline");
            }
            throw error;
        }
    },

    post: async <T>(
        url: string,
        data: JsonObject,
        config?: ApiConfig
    ): Promise<T> => {
        if (!navigator.onLine) {
            const actionId = await queueOfflineAction("POST", url, data);
            toast.success("Action queued for when you're online");

            if (url.includes("/books") && "title" in data) {
                const optimisticBook: Partial<Book> = {
                    ...(data as Partial<Book>),
                    id: `temp-${actionId}`,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    status: "available",
                };
                return optimisticBook as T;
            }

            if (url.includes("/ratings") && "rating" in data) {
                const optimisticRating: Partial<Rating> = {
                    ...(data as Partial<Rating>),
                    id: `temp-${actionId}`,
                    createdAt: new Date().toISOString(),
                };
                return optimisticRating as T;
            }

            if (url.includes("/wishlist") && "title" in data) {
                const optimisticWishlist: Partial<WishlistItem> = {
                    ...(data as Partial<WishlistItem>),
                    id: `temp-${actionId}`,
                    createdAt: new Date().toISOString(),
                    matchCount: 0,
                };
                return optimisticWishlist as T;
            }

            throw new Error("Offline: Action queued, but cannot proceed now");
        }

        const headers = getAuthHeaders();
        const mergedConfig = { ...config, headers: { ...config?.headers, ...headers } };
        const response = await api.post<T>(url, data, mergedConfig);
        return response.data;
    },

    patch: async <T>(
        url: string,
        data: JsonObject,
        config?: ApiConfig
    ): Promise<T> => {
        if (!navigator.onLine) {
            await queueOfflineAction("PATCH", url, data);
            toast.success("Update queued for when you're online");

            const id = extractIdFromUrl(url);
            if (id) {
                const storageKey = getStorageKeyFromUrl(url);
                if (storageKey) {
                    const cachedData = await retrieveData<T>(storageKey, id);
                    if (
                        cachedData &&
                        typeof cachedData === "object" &&
                        cachedData !== null
                    ) {
                        const updatedData = {
                            ...(cachedData as Record<string, unknown>),
                            ...data,
                            updatedAt: new Date().toISOString(),
                        };
                        await storeData(storageKey, updatedData);
                        return updatedData as T;
                    }
                    if (cachedData) {
                        return cachedData;
                    }
                }
            }

            throw new Error("Offline: Update queued, but cannot proceed now");
        }

        const headers = getAuthHeaders();
        const mergedConfig = { ...config, headers: { ...config?.headers, ...headers } };
        const response = await api.patch<T>(url, data, mergedConfig);
        return response.data;
    },

    delete: async (url: string): Promise<void> => {
        if (!navigator.onLine) {
            await queueOfflineAction("DELETE", url, null);
            toast.success("Deletion queued for when you're online");

            const id = extractIdFromUrl(url);
            if (id) {
                const storageKey = getStorageKeyFromUrl(url);
                if (storageKey) {
                    const allData = await retrieveData<unknown[]>(storageKey);
                    if (Array.isArray(allData)) {
                        const filteredData = allData.filter(
                            (item) =>
                                !(
                                    typeof item === "object" &&
                                    item !== null &&
                                    "id" in item &&
                                    typeof (item as { id: string }).id === "string" &&
                                    (item as { id: string }).id === id
                                )
                        );
                        await storeData(storageKey, filteredData, true);
                    }
                }
            }
            return;
        }

        const headers = getAuthHeaders();
        await api.delete(url, { headers });
    },

    sync: async (): Promise<void> => {
        if (!navigator.onLine) {
            toast.error("Cannot sync while offline");
            return;
        }

        const headers = getAuthHeaders();

        const processedCount = await processOfflineActions(async (action) => {
            try {
                if (action.action === "POST") {
                    await api.post(action.endpoint, action.data as JsonObject, { headers });
                } else if (action.action === "PATCH") {
                    await api.patch(action.endpoint, action.data as JsonObject, { headers });
                } else if (action.action === "DELETE") {
                    await api.delete(action.endpoint, { headers });
                }
                return true;
            } catch {
                return false;
            }
        });

        if (processedCount > 0) {
            toast.success(`Synchronized ${processedCount} offline actions`);
            await cleanupOfflineActions(["completed"]);
        }
    },
};