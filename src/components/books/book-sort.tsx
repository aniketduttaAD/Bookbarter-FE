"use client";

import { useBookStore } from "@/store/book-store";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ArrowUpDown,
    ArrowDownAZ,
    ArrowUpAZ,
    CalendarDays,
    Calendar
} from "lucide-react";

export function BookSort() {
    const { sortOptions, setSortOptions, fetchBooks } = useBookStore();

    const handleSortChange = (option: string) => {
        const [sortBy, sortOrder] = option.split("-") as [
            "createdAt" | "title" | "author",
            "asc" | "desc"
        ];

        setSortOptions({ sortBy, sortOrder });
        fetchBooks();
    };

    const sortValue = `${sortOptions.sortBy}-${sortOptions.sortOrder}`;

    const sortIcons = {
        "createdAt-desc": <CalendarDays className="mr-2 h-4 w-4" />,
        "createdAt-asc": <Calendar className="mr-2 h-4 w-4" />,
        "title-asc": <ArrowUpAZ className="mr-2 h-4 w-4" />,
        "title-desc": <ArrowDownAZ className="mr-2 h-4 w-4" />,
        "author-asc": <ArrowUpAZ className="mr-2 h-4 w-4" />,
        "author-desc": <ArrowDownAZ className="mr-2 h-4 w-4" />,
    };

    return (
        <div className="flex items-center mb-6">
            <div className="flex items-center mr-2">
                <ArrowUpDown className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Sort by:</span>
            </div>
            <Select
                value={sortValue}
                onValueChange={handleSortChange}
            >
                <SelectTrigger className="max-w-[200px]">
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="createdAt-desc" className="flex items-center">
                        {sortIcons["createdAt-desc"]}
                        Newest first
                    </SelectItem>
                    <SelectItem value="createdAt-asc" className="flex items-center">
                        {sortIcons["createdAt-asc"]}
                        Oldest first
                    </SelectItem>
                    <SelectItem value="title-asc" className="flex items-center">
                        {sortIcons["title-asc"]}
                        Title (A-Z)
                    </SelectItem>
                    <SelectItem value="title-desc" className="flex items-center">
                        {sortIcons["title-desc"]}
                        Title (Z-A)
                    </SelectItem>
                    <SelectItem value="author-asc" className="flex items-center">
                        {sortIcons["author-asc"]}
                        Author (A-Z)
                    </SelectItem>
                    <SelectItem value="author-desc" className="flex items-center">
                        {sortIcons["author-desc"]}
                        Author (Z-A)
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}