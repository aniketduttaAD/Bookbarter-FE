"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { BookStatus } from "@/types";
import { bookService } from "@/lib/book-service";
import { bookStatusLabels } from "@/schemas/book-schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChevronDown, Check } from "lucide-react";
import { motion } from "framer-motion";

interface BookStatusToggleProps {
    bookId: string;
    currentStatus: BookStatus;
    onStatusChange: (newStatus: BookStatus) => void;
}

export function BookStatusToggle({
    bookId,
    currentStatus,
    onStatusChange,
}: BookStatusToggleProps) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<BookStatus | null>(null);
    const [isAlertOpen, setIsAlertOpen] = useState(false);

    const statusColor = {
        available: "bg-green-500 hover:bg-green-600",
        reserved: "bg-yellow-500 hover:bg-yellow-600",
        exchanged: "bg-gray-500 hover:bg-gray-600",
    };

    const statusMessages = {
        available: {
            title: "Mark as Available",
            description: "This will mark the book as available for exchange. It will appear in search results for all users.",
        },
        reserved: {
            title: "Mark as Reserved",
            description: "This will mark the book as reserved. It will still appear in search results but will be shown as currently reserved.",
        },
        exchanged: {
            title: "Mark as Exchanged",
            description: "This will mark the book as exchanged and no longer available. Are you sure you want to proceed?",
        },
    };

    const updateStatus = async (status: BookStatus) => {
        try {
            setIsUpdating(true);
            await bookService.updateBookStatus(bookId, status);
            onStatusChange(status);
            toast.success(`Book marked as ${bookStatusLabels[status]}`);
        } catch (error) {
            toast.error("Failed to update book status");
            console.error("Status update error:", error);
        } finally {
            setIsUpdating(false);
            setPendingStatus(null);
        }
    };

    const handleExchangedClick = (e: React.MouseEvent) => {
        // Prevent the dropdown menu from closing
        e.preventDefault();
        e.stopPropagation();

        // Set the pending status and open the alert dialog
        setPendingStatus("exchanged");
        setIsAlertOpen(true);
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-[200px] justify-between"
                        disabled={isUpdating}
                    >
                        <div className="flex items-center space-x-2">
                            <Badge className={statusColor[currentStatus]}>
                                {bookStatusLabels[currentStatus]}
                            </Badge>
                            {isUpdating && (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                                />
                            )}
                        </div>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-[200px]">
                    {Object.entries(bookStatusLabels).map(([value, label]) => {
                        const status = value as BookStatus;
                        const isCurrent = status === currentStatus;

                        if (status === "exchanged") {
                            return (
                                <DropdownMenuItem
                                    key={status}
                                    className={
                                        isCurrent
                                            ? "bg-muted cursor-default"
                                            : "cursor-pointer"
                                    }
                                    disabled={isCurrent}
                                    onClick={handleExchangedClick}
                                    onSelect={(e) => {
                                        // Prevent the default select behavior
                                        e.preventDefault();
                                    }}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        {label}
                                        {isCurrent && <Check className="h-4 w-4" />}
                                    </div>
                                </DropdownMenuItem>
                            );
                        }

                        return (
                            <DropdownMenuItem
                                key={status}
                                className={
                                    isCurrent
                                        ? "bg-muted cursor-default"
                                        : "cursor-pointer"
                                }
                                disabled={isCurrent}
                                onClick={() => updateStatus(status)}
                            >
                                <div className="flex items-center justify-between w-full">
                                    {label}
                                    {isCurrent && <Check className="h-4 w-4" />}
                                </div>
                            </DropdownMenuItem>
                        );
                    })}
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {statusMessages.exchanged.title}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {statusMessages.exchanged.description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsAlertOpen(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                setIsAlertOpen(false);
                                if (pendingStatus) {
                                    updateStatus(pendingStatus);
                                }
                            }}
                        >
                            Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}