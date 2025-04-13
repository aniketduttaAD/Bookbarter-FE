"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Book } from "@/types";
import { formatDate, truncateText } from "@/lib/utils";
import { BookOpen, MapPin, User, Calendar } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    bookConditionLabels,
    bookStatusLabels,
    bookGenreLabels,
} from "@/schemas/book-schema";
import { motion, AnimatePresence } from "framer-motion";

interface BookCardProps {
    book: Book;
}

export function BookCard({ book }: BookCardProps) {
    const [isFlipped, setIsFlipped] = useState(false);

    const statusColor = {
        available: "bg-green-500",
        reserved: "bg-yellow-500",
        exchanged: "bg-gray-500",
    }[book.status];

    const defaultImage = "main-image2.png";

    return (
        <TooltipProvider>
            <div
                className="relative h-[420px] perspective"
                onMouseEnter={() => setIsFlipped(true)}
                onMouseLeave={() => setIsFlipped(false)}
                onClick={() => setIsFlipped(!isFlipped)}
            >
                <AnimatePresence initial={false}>
                    {!isFlipped ? (
                        <motion.div
                            key="front"
                            className="absolute w-full h-full backface-hidden"
                            initial={{ rotateY: 180 }}
                            animate={{ rotateY: 0 }}
                            exit={{ rotateY: 180 }}
                            transition={{ duration: 0.6, ease: "easeInOut" }}
                        >
                            <Link href={`/books/${book.id}`}>
                                <Card className="h-full cursor-pointer transition-shadow hover:shadow-md overflow-hidden">
                                    <div className="relative h-56 w-full bg-muted">
                                        {book.imageUrl ? (
                                            <Image
                                                src={book.imageUrl}
                                                alt={book.title}
                                                fill
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                className="object-cover"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = defaultImage;
                                                }}
                                                priority
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full bg-muted text-muted-foreground">
                                                <BookOpen className="h-12 w-12" />
                                            </div>
                                        )}

                                        {/* Status indicator */}
                                        <div className="absolute top-2 right-2">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Badge
                                                        className={`${statusColor} hover:${statusColor}`}
                                                    >
                                                        {bookStatusLabels[book.status]}
                                                    </Badge>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{book.status === "available" ? "Available for exchange" :
                                                        book.status === "reserved" ? "Currently reserved" :
                                                            "Already exchanged"}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </div>

                                    <CardContent className="p-4">
                                        <h3 className="font-semibold text-lg line-clamp-1">{book.title}</h3>
                                        <p className="text-muted-foreground text-sm">by {book.author}</p>

                                        <div className="flex flex-wrap items-center gap-2 mt-2">
                                            <Badge variant="outline">
                                                {bookGenreLabels[book.genre as keyof typeof bookGenreLabels]}
                                            </Badge>
                                            <Badge variant="outline">
                                                {bookConditionLabels[book.condition as keyof typeof bookConditionLabels]}
                                            </Badge>
                                        </div>
                                    </CardContent>

                                    <CardFooter className="p-4 pt-0 flex justify-between text-xs text-muted-foreground">
                                        <div className="flex items-center">
                                            <MapPin className="h-3 w-3 mr-1" />
                                            <span>{book.location}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <User className="h-3 w-3 mr-1" />
                                            <span>{book.ownerName}</span>
                                        </div>
                                    </CardFooter>
                                </Card>
                            </Link>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="back"
                            className="absolute w-full h-full backface-hidden"
                            initial={{ rotateY: -180 }}
                            animate={{ rotateY: 0 }}
                            exit={{ rotateY: -180 }}
                            transition={{ duration: 0.6, ease: "easeInOut" }}
                        >
                            <Link href={`/books/${book.id}`}>
                                <Card className="h-full cursor-pointer transition-shadow hover:shadow-md overflow-hidden flex flex-col">
                                    <CardContent className="p-4 flex-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="font-semibold text-lg">{book.title}</h3>
                                            <Badge
                                                className={`${statusColor} hover:${statusColor}`}
                                            >
                                                {bookStatusLabels[book.status]}
                                            </Badge>
                                        </div>

                                        <p className="text-muted-foreground text-sm mb-2">by {book.author}</p>

                                        <div className="flex flex-wrap gap-2 mb-3">
                                            <Badge variant="outline">
                                                {bookGenreLabels[book.genre as keyof typeof bookGenreLabels]}
                                            </Badge>
                                            <Badge variant="outline">
                                                {bookConditionLabels[book.condition as keyof typeof bookConditionLabels]}
                                            </Badge>
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            <p className="text-sm text-muted-foreground line-clamp-5">
                                                {truncateText(book.description, 200)}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mt-auto">
                                            <div className="flex items-center text-xs">
                                                <MapPin className="h-3 w-3 mr-1" />
                                                <span>{book.location}</span>
                                            </div>
                                            <div className="flex items-center text-xs">
                                                <Calendar className="h-3 w-3 mr-1" />
                                                <span>{formatDate(book.createdAt)}</span>
                                            </div>
                                        </div>
                                    </CardContent>

                                    <CardFooter className="p-4 pt-2 border-t">
                                        <div className="flex items-center text-xs">
                                            <User className="h-3 w-3 mr-1" />
                                            <span>Shared by {book.ownerName}</span>
                                        </div>
                                    </CardFooter>
                                </Card>
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </TooltipProvider>
    );
}