"use client";

import { useState, useEffect } from "react";
import { X, Filter } from "lucide-react";
import { useBookStore } from "@/store/book-store";
import {
    bookGenreLabels,
    bookConditionLabels,
    bookStatusLabels,
} from "@/schemas/book-schema";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BookGenre, BookCondition, BookStatus } from "@/types";
import { Input } from "../ui/input";

export function BookFilters() {
    const { filters, setFilters, resetFilters, fetchBooks } = useBookStore();
    const [isOpen, setIsOpen] = useState(false);
    const [activeFiltersCount, setActiveFiltersCount] = useState(0);

    useEffect(() => {
        const count = Object.values(filters).filter(
            (value) => value !== undefined && value !== ""
        ).length;
        setActiveFiltersCount(count);
    }, [filters]);

    useEffect(() => {
        fetchBooks();
    }, [filters, fetchBooks]);

    const handleFilterChange = (
        key: keyof typeof filters,
        value: string | undefined
    ) => {
        setFilters({ [key]: value });
    };

    const handleResetFilters = () => {
        resetFilters();
        setIsOpen(false);
    };

    return (
        <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center"
                >
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                    {activeFiltersCount > 0 && (
                        <Badge variant="secondary" className="ml-2">
                            {activeFiltersCount}
                        </Badge>
                    )}
                </Button>
                {activeFiltersCount > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleResetFilters}
                        className="text-muted-foreground"
                    >
                        Clear all
                    </Button>
                )}
            </div>

            {activeFiltersCount > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {filters.genre && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                            <span>Genre: {bookGenreLabels[filters.genre as BookGenre]}</span>
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => handleFilterChange("genre", undefined)}
                            />
                        </Badge>
                    )}
                    {filters.condition && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                            <span>
                                Condition: {bookConditionLabels[filters.condition as BookCondition]}
                            </span>
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => handleFilterChange("condition", undefined)}
                            />
                        </Badge>
                    )}
                    {filters.status && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                            <span>Status: {bookStatusLabels[filters.status as BookStatus]}</span>
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => handleFilterChange("status", undefined)}
                            />
                        </Badge>
                    )}
                    {filters.location && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                            <span>Location: {filters.location}</span>
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => handleFilterChange("location", undefined)}
                            />
                        </Badge>
                    )}
                    {filters.search && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                            <span>Search: {filters.search}</span>
                            <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => handleFilterChange("search", undefined)}
                            />
                        </Badge>
                    )}
                </div>
            )}

            {isOpen && (
                <div className="bg-card border rounded-md p-4 mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label htmlFor="genre-filter" className="text-sm font-medium">
                            Genre
                        </label>
                        <Select
                            value={filters.genre || ""}
                            onValueChange={(value) =>
                                handleFilterChange("genre", value === "" ? undefined : value)
                            }
                        >
                            <SelectTrigger id="genre-filter" className="mt-1">
                                <SelectValue placeholder="All genres" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All genres</SelectItem>
                                {Object.entries(bookGenreLabels).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label htmlFor="condition-filter" className="text-sm font-medium">
                            Condition
                        </label>
                        <Select
                            value={filters.condition || ""}
                            onValueChange={(value) =>
                                handleFilterChange("condition", value === "" ? undefined : value)
                            }
                        >
                            <SelectTrigger id="condition-filter" className="mt-1">
                                <SelectValue placeholder="All conditions" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All conditions</SelectItem>
                                {Object.entries(bookConditionLabels).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label htmlFor="status-filter" className="text-sm font-medium">
                            Status
                        </label>
                        <Select
                            value={filters.status || ""}
                            onValueChange={(value) =>
                                handleFilterChange("status", value === "" ? undefined : value)
                            }
                        >
                            <SelectTrigger id="status-filter" className="mt-1">
                                <SelectValue placeholder="All statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All statuses</SelectItem>
                                {Object.entries(bookStatusLabels).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label htmlFor="location-filter" className="text-sm font-medium">
                            Location
                        </label>
                        <Input
                            name="Enter location"
                            id="location-filter"
                            placeholder="Enter city or area"
                            value={filters.location || ""}
                            onChange={(e) =>
                                handleFilterChange("location", e.target.value === "" ? undefined : e.target.value)
                            }
                            className="mt-1"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
