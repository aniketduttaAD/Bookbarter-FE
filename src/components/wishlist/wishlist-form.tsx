"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { ZodError } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormItem, FormLabel, FormControl, FormMessage, zodIssueToErrors } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { wishlistService } from "@/lib/wishlist-service";
import { wishlistItemSchema } from "@/schemas/wishlist-schema";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

export function WishlistForm({ onItemAdded }: { onItemAdded: () => void }) {
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setErrors({});
            const data = { title, author };
            wishlistItemSchema.parse(data);
            setIsSubmitting(true);
            await wishlistService.addWishlistItem(data);
            setTitle("");
            setAuthor("");
            onItemAdded();

            toast.success("Book added to your wishlist!");
        } catch (error) {
            if (error instanceof ZodError) {
                setErrors(zodIssueToErrors(error.issues));
            } else {
                console.error("Error adding wishlist item:", error);
                toast.error("Failed to add to wishlist. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Add to Your Wishlist</CardTitle>
                </CardHeader>
                <Form errors={errors} onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <FormItem>
                            <FormLabel required>Book Title</FormLabel>
                            <FormControl>
                                <Input
                                    name="Search book"
                                    placeholder="Enter the title of the book you're looking for"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    disabled={isSubmitting}
                                />
                            </FormControl>
                            <FormMessage name="title" />
                        </FormItem>

                        <FormItem>
                            <FormLabel>Author (Optional)</FormLabel>
                            <FormControl>
                                <Input
                                    name="Search author"
                                    placeholder="Enter the author's name if known"
                                    value={author}
                                    onChange={(e) => setAuthor(e.target.value)}
                                    disabled={isSubmitting}
                                />
                            </FormControl>
                            <FormMessage name="author" />
                        </FormItem>
                    </CardContent>

                    <CardFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            <Plus className="mr-2 h-4 w-4" />
                            {isSubmitting ? "Adding..." : "Add to Wishlist"}
                        </Button>
                    </CardFooter>
                </Form>
            </Card>
        </motion.div>
    );
}