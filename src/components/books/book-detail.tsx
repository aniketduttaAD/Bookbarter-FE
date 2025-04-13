"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/auth-store";
import { useBookStore } from "@/store/book-store";
import { bookService } from "@/lib/book-service";
import { formatDate } from "@/lib/utils";
import { BookCondition, BookStatus, Rating } from "@/types";
import {
    bookConditionLabels,
    bookStatusLabels,
    bookGenreLabels,
} from "@/schemas/book-schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { UserAvatar } from "@/components/ui/avatar";
import { BookDetailSkeleton } from "./book-detail-skeleton";
import { BookStatusToggle } from "./book-status-toggle";
import { ErrorAlert } from "@/components/ui/error-alert";
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
import { TooltipProvider } from "@/components/ui/tooltip";
import {
    BookOpen,
    MapPin,
    CalendarDays,
    MessageSquare,
    Trash2,
    Edit,
    Share2,
    Heart,
} from "lucide-react";
import { motion } from "framer-motion";
import { RatingForm } from "@/components/ratings/rating-form";
import { RatingList } from "@/components/ratings/rating-list";
import { ratingService } from "@/lib/rating-service";
import { wishlistService } from "@/lib/wishlist-service";
import { messageService } from "@/lib/message-service";
import { LiveViewingIndicator } from "@/components/ui/live-viewing-indicator";

interface BookDetailProps {
    bookId: string;
}

export function BookDetail({ bookId }: BookDetailProps) {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const showWishlistButton = isAuthenticated && user && user.role === "seeker";
    const { selectedBook, fetchBook, setSelectedBook, isLoading, error } =
        useBookStore();
    const [isDeleting, setIsDeleting] = useState(false);
    const [ratings, setRatings] = useState<Rating[]>([]);
    const [userHasRated, setUserHasRated] = useState(false);
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [loadingRatings, setLoadingRatings] = useState(false);
    const [loadingWishlist, setLoadingWishlist] = useState(false);

    useEffect(() => {
        fetchBook(bookId);
        return () => {
            setSelectedBook(null);
        };
    }, [bookId, fetchBook, setSelectedBook]);

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            toast.success("Link copied to clipboard!");
        } catch {
            toast.error("Failed to copy. Try again.");
        }
    };

    useEffect(() => {
        if (selectedBook) {
            const fetchRatings = async () => {
                try {
                    setLoadingRatings(true);
                    const bookRatings = await ratingService.getBookRatings(
                        selectedBook.id
                    );
                    setRatings(bookRatings);
                    if (isAuthenticated && user) {
                        try {
                            const userRating = await ratingService.getUserRatingForBook(
                                selectedBook.id
                            );
                            setUserHasRated(!!userRating);
                        } catch (error) {
                            console.error("Error checking user rating:", error);
                        }
                    }
                } catch (error) {
                    console.error("Error fetching ratings:", error);
                } finally {
                    setLoadingRatings(false);
                }
            };

            const checkWishlist = async () => {
                if (isAuthenticated && user && user.role === "seeker") {
                    try {
                        setLoadingWishlist(true);
                        const inWishlist = await wishlistService.isBookInWishlist(
                            selectedBook.id
                        );
                        setIsInWishlist(inWishlist);
                    } catch (error) {
                        console.error("Error checking wishlist:", error);
                    } finally {
                        setLoadingWishlist(false);
                    }
                } else {
                    setIsInWishlist(false);
                }
            };

            fetchRatings();
            checkWishlist();
        }
    }, [selectedBook, isAuthenticated, user]);

    const isOwner = user && selectedBook && user.id === selectedBook.ownerId;

    const handleStatusChange = (newStatus: BookStatus) => {
        if (selectedBook) {
            setSelectedBook({
                ...selectedBook,
                status: newStatus,
            });
        }
    };

    const handleDelete = async () => {
        if (!selectedBook) return;
        try {
            setIsDeleting(true);
            await bookService.deleteBook(selectedBook.id);
            toast.success("Book deleted successfully");
            router.push("/dashboard/owner");
        } catch (error) {
            toast.error("Failed to delete book");
            console.error("Delete error:", error);
        } finally {
            setIsDeleting(false);
        }
    };
    const handleContactOwner = async () => {
        if (!isAuthenticated) {
            toast.error("Please log in to contact the book owner");
            router.push("/login");
            return;
        }
        if (!selectedBook) return;
        try {
            const thread = await messageService.getOrCreateThreadForBook(
                selectedBook.ownerId,
                selectedBook.id
            );
            router.push(`/messages?thread=${thread.id}`);
        } catch (error) {
            console.error("Error starting conversation:", error);
            toast.error("Failed to start conversation. Please try again.");
        }
    };

    const handleRatingSubmit = async () => {
        if (!selectedBook) return;
        const bookRatings = await ratingService.getBookRatings(selectedBook.id);
        setRatings(bookRatings);
        setUserHasRated(true);
    };

    const toggleWishlist = async () => {
        if (!isAuthenticated) {
            toast.error("Please log in to add to wishlist");
            router.push("/login");
            return;
        }
        if (!selectedBook) return;
        try {
            setLoadingWishlist(true);
            if (isInWishlist) {
                toast.success("Removed from wishlist");
                setIsInWishlist(false);
            } else {
                await wishlistService.addBookToWishlist(selectedBook.id);
                toast.success("Added to wishlist");
                setIsInWishlist(true);
            }
        } catch (error) {
            console.error("Error toggling wishlist:", error);
            toast.error("Failed to update wishlist");
        } finally {
            setLoadingWishlist(false);
        }
    };

    if (isLoading) {
        return <BookDetailSkeleton />;
    }

    if (error) {
        return <ErrorAlert message={error} />;
    }

    if (!selectedBook) {
        return (
            <ErrorAlert
                title='Not Found'
                message="The book you're looking for doesn't exist or has been removed."
            />
        );
    }

    const statusColor = {
        available: "bg-green-500",
        reserved: "bg-yellow-500",
        exchanged: "bg-gray-500",
    }[selectedBook.status];

    const defaultImage = "/images/book-placeholder.jpg";

    return (
        <TooltipProvider>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mt-10'>
                <div className='md:col-span-1'>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className='relative aspect-[2/3] w-full bg-muted rounded-lg overflow-hidden group'>
                            {selectedBook.imageUrl ? (
                                <Image
                                    src={selectedBook.imageUrl}
                                    alt={selectedBook.title}
                                    fill
                                    sizes='(max-width: 768px) 100vw, 33vw'
                                    className='object-cover transition-transform group-hover:scale-105 duration-300'
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = defaultImage;
                                    }}
                                />
                            ) : (
                                <div className='flex items-center justify-center h-full bg-muted text-muted-foreground'>
                                    <BookOpen className='h-24 w-24' />
                                </div>
                            )}

                            <LiveViewingIndicator
                                bookId={selectedBook.id}
                                className='absolute bottom-2 left-2'
                            />
                        </div>
                    </motion.div>

                    {!isOwner && (
                        <motion.div
                            className='flex flex-wrap gap-3 mt-4 md:hidden'
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Button
                                onClick={handleContactOwner}
                                disabled={selectedBook.status !== "available"}
                                className='flex-1'
                            >
                                <MessageSquare className='mr-2 h-4 w-4' />
                                Contact Owner
                            </Button>

                            {showWishlistButton && (
                                <Button
                                    variant='outline'
                                    onClick={toggleWishlist}
                                    disabled={loadingWishlist}
                                >
                                    <Heart
                                        className={`mr-2 h-4 w-4 ${isInWishlist ? "fill-current" : ""}`}
                                    />
                                    {isInWishlist ? "In Wishlist" : "Add to Wishlist"}
                                </Button>
                            )}
                        </motion.div>
                    )}
                </div>

                <div className='md:col-span-2 space-y-6'>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div>
                            <div className='flex flex-wrap gap-2 items-center mb-2'>
                                <Badge className={`${statusColor} hover:${statusColor}`}>
                                    {bookStatusLabels[selectedBook.status]}
                                </Badge>
                                <Badge variant='outline'>
                                    {
                                        bookGenreLabels[
                                        selectedBook.genre as keyof typeof bookGenreLabels
                                        ]
                                    }
                                </Badge>
                                <Badge variant='outline'>
                                    {bookConditionLabels[selectedBook.condition as BookCondition]}
                                </Badge>
                            </div>

                            <h1 className='text-3xl font-bold'>{selectedBook.title}</h1>
                            <p className='text-lg text-muted-foreground mt-1'>
                                by {selectedBook.author}
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div>
                            <h2 className='text-lg font-semibold mb-2'>Description</h2>
                            <p className='text-muted-foreground'>
                                {selectedBook.description}
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                            <Card className='p-4 flex items-center gap-3 hover:shadow-md transition-shadow'>
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                >
                                    <MapPin className='h-5 w-5 text-primary' />
                                </motion.div>
                                <div>
                                    <p className='text-sm font-medium'>Location</p>
                                    <p className='text-sm text-muted-foreground'>
                                        {selectedBook.location}
                                    </p>
                                </div>
                            </Card>

                            <Card className='p-4 flex items-center gap-3 hover:shadow-md transition-shadow'>
                                <motion.div
                                    whileHover={{ rotate: 360 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <CalendarDays className='h-5 w-5 text-primary' />
                                </motion.div>
                                <div>
                                    <p className='text-sm font-medium'>Listed On</p>
                                    <p className='text-sm text-muted-foreground'>
                                        {formatDate(selectedBook.createdAt)}
                                    </p>
                                </div>
                            </Card>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card className='p-4 hover:shadow-md transition-shadow'>
                            <div className='flex items-center gap-4'>
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                >
                                    <UserAvatar name={selectedBook.ownerName} size='lg' />
                                </motion.div>
                                <div>
                                    <p className='font-medium'>
                                        Shared by {selectedBook.ownerName}
                                    </p>
                                    <p className='text-sm text-muted-foreground mt-1'>
                                        {selectedBook.contactPreference}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        {isOwner ? (
                            <div className='flex flex-wrap gap-3'>
                                <BookStatusToggle
                                    bookId={selectedBook.id}
                                    currentStatus={selectedBook.status}
                                    onStatusChange={handleStatusChange}
                                />

                                <Button
                                    variant='outline'
                                    onClick={() => router.push(`/books/${selectedBook.id}/edit`)}
                                >
                                    <Edit className='mr-2 h-4 w-4' />
                                    Edit
                                </Button>

                                <Button variant="outline" onClick={handleShare}>
                                    <Share2 className="mr-2 h-4 w-4" />
                                    Share
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant='destructive'>
                                            <Trash2 className='mr-2 h-4 w-4' />
                                            Delete
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently
                                                delete your book listing from our servers.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={handleDelete}
                                                className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                                            >
                                                {isDeleting ? "Deleting..." : "Delete"}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        ) : (
                            <div className='hidden md:flex flex-wrap gap-3'>
                                <Button
                                    onClick={handleContactOwner}
                                    disabled={selectedBook.status !== "available"}
                                >
                                    <MessageSquare className='mr-2 h-4 w-4' />
                                    Contact Owner
                                </Button>

                                <Button
                                    variant='outline'
                                    onClick={toggleWishlist}
                                    disabled={loadingWishlist}
                                >
                                    <Heart
                                        className={`mr-2 h-4 w-4 ${isInWishlist ? "fill-current" : ""
                                            }`}
                                    />
                                    {isInWishlist ? "In Wishlist" : "Add to Wishlist"}
                                </Button>

                            </div>
                        )}

                    </motion.div>
                </div>

                <div className='col-span-1 md:col-span-3 mt-8 pt-8 border-t'>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        {loadingRatings ? (
                            <div className='flex justify-center py-8'>
                                <div className='animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full'></div>
                            </div>
                        ) : (
                            <>
                                <RatingList ratings={ratings} className='mb-8' />

                                {isAuthenticated && (
                                    <RatingForm
                                        bookId={selectedBook.id}
                                        ownerId={selectedBook.ownerId}
                                        onRatingSubmit={handleRatingSubmit}
                                    />
                                )}

                                {userHasRated && showWishlistButton && (
                                    <Card className='bg-muted/50 border-dashed'>
                                        <CardContent className='p-4 text-center text-sm text-muted-foreground'>
                                            You&apos;ve already rated this book. Thank you for your
                                            feedback!
                                        </CardContent>
                                    </Card>
                                )}
                            </>
                        )}
                    </motion.div>
                </div>
            </div>
        </TooltipProvider>
    );
}
