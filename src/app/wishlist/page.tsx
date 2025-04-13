"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { WishlistForm } from "@/components/wishlist/wishlist-form";
import { WishlistList } from "@/components/wishlist/wishlist-list";
import { WishlistItem } from "@/types";
import { wishlistService } from "@/lib/wishlist-service";
import { motion } from "framer-motion";

export default function WishlistPage() {
    const { isAuthenticated, isSeeker } = useAuthStore();
    const router = useRouter();
    const [items, setItems] = useState<WishlistItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated || !isSeeker) {
            router.push("/login");
            return;
        }
        fetchWishlist();
    }, [isAuthenticated, isSeeker, router]);

    const fetchWishlist = async () => {
        try {
            setIsLoading(true);
            const wishlistItems = await wishlistService.getWishlist();
            setItems(wishlistItems);
        } catch (error) {
            console.error("Error fetching wishlist:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container>
            <PageHeader
                title="Your Wishlist"
                description="Keep track of books you're looking for"
                className="mb-8"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <motion.div
                    className="md:col-span-1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <WishlistForm onItemAdded={fetchWishlist} />
                </motion.div>

                <motion.div
                    className="md:col-span-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {isLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                        </div>
                    ) : (
                        <WishlistList
                            items={items}
                            onItemRemoved={fetchWishlist}
                            className="min-h-[400px]"
                        />
                    )}
                </motion.div>
            </div>
        </Container>
    );
}
