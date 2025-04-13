"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { formatDate } from "@/lib/utils";
import { WishlistItem } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { BookOpen, Calendar, X, AlertCircle } from "lucide-react";
import { wishlistService } from "@/lib/wishlist-service";
import { motion, AnimatePresence } from "framer-motion";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from "next/link";

interface WishlistListProps {
    items: WishlistItem[];
    onItemRemoved: () => void;
    className?: string;
}

export function WishlistList({ items, onItemRemoved, className }: WishlistListProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        try {
            setDeletingId(id);
            await wishlistService.removeWishlistItem(id);
            onItemRemoved();
            toast.success("Item removed from wishlist");
        } catch (error) {
            console.error("Error removing wishlist item:", error);
            toast.error("Failed to remove item. Please try again.");
        } finally {
            setDeletingId(null);
        }
    };

    if (items.length === 0) {
        return (
            <EmptyState
                type="wishlist"
                title="Your wishlist is empty"
                description="Add books you're looking for to get notified when they become available."
                className={className}
            />
        );
    }

    return (
        <div className={className}>
            <h3 className="text-xl font-bold mb-4">Your Wishlist</h3>

            <AnimatePresence>
                <div className="space-y-3">
                    {items.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            transition={{ duration: 0.3 }}
                            layout
                        >
                            <Card className="relative group">
                                <CardContent className="p-4">
                                    <div className="flex justify-between">
                                        <div>
                                            <div className="flex items-center mb-1">
                                                <BookOpen className="h-4 w-4 text-primary mr-2" />
                                                <h4 className="font-medium">{item.title}</h4>
                                            </div>

                                            {item.author && (
                                                <p className="text-sm text-muted-foreground ml-6">
                                                    by {item.author}
                                                </p>
                                            )}

                                            <div className="flex items-center mt-2 text-xs text-muted-foreground">
                                                <Calendar className="h-3 w-3 mr-1" />
                                                <span>Added on {formatDate(item.createdAt)}</span>
                                            </div>
                                        </div>

                                        <div>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2"
                                                        aria-label="Remove from wishlist"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Remove from wishlist?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to remove &quot;{item.title}&quot; from your wishlist?
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(item.id)}
                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                        >
                                                            {deletingId === item.id ? "Removing..." : "Remove"}
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>

                                    {item.matchCount > 0 && (
                                        <div className="mt-3 p-2 bg-green-500/10 text-green-600 rounded-md flex items-center text-sm">
                                            <AlertCircle className="h-4 w-4 mr-2" />
                                            <span>
                                                {item.matchCount} {item.matchCount === 1 ? "match" : "matches"} found!
                                                <Link href="/books" className="underline font-medium">View books</Link>
                                            </span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </AnimatePresence>
        </div>
    );
}