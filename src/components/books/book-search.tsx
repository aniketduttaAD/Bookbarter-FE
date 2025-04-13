"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useBookStore } from "@/store/book-store";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";

export function BookSearch() {
    const { filters, setFilters } = useBookStore();
    const [searchValue, setSearchValue] = useState(filters.search || "");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setFilters({ search: searchValue });
    };

    return (
        <form onSubmit={handleSearch} className="relative mb-6">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    name="Search title, author and description"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search by title, author or description..."
                    className="pl-9 pr-24"
                />
                <Button
                    type="submit"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2"
                >
                    Search
                </Button>
            </div>
        </form>
    );
}