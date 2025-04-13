import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { BookOpen, Star } from "lucide-react";

interface UserProfileCardProps extends React.HTMLAttributes<HTMLDivElement> {
    user: {
        name?: string;
        email?: string;
        avatar?: string;
        bio?: string;
        favoriteGenre?: string;
        role?: string
    };
    bookCount: number;
    ratingAverage: number;
    onEditClick?: () => void;
}

const roleLabels: Record<string, string> = {
    owner: "Book Owner & Sharer",
    seeker: "Book Seeker & Explorer",
};

const UserProfileCard = React.forwardRef<HTMLDivElement, UserProfileCardProps>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ({ user, bookCount, ratingAverage, onEditClick, className, ...props }, ref) => (
        <Card
            ref={ref}
            className={cn("w-full max-w-md sm:max-w-lg md:max-w-xl", className)}
            {...props}
        >
            <CardHeader className="flex flex-col sm:flex-row items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center overflow-hidden relative">
                    {user.avatar ? (
                        <Image
                            src={user.avatar}
                            alt={`${user.name}'s avatar`}
                            fill
                            sizes="80px"
                            className="object-cover"
                        />
                    ) : (
                        <span className="text-2xl font-bold">
                            {user.name?.charAt(0) || "U"}
                        </span>
                    )}
                </div>

                <div className="flex-1 min-w-0 text-center sm:text-left">
                    <CardTitle className="text-lg sm:text-xl truncate">
                        {user.name || "User"}
                    </CardTitle>
                    {user.role && (
                        <p className="text-xs text-muted-foreground truncate">
                            {roleLabels[user.role] || user.role}
                        </p>
                    )}
                    <CardDescription className="text-sm truncate">
                        {user.email || ""}
                    </CardDescription>
                </div>
            </CardHeader>

            <CardContent>
                <div className="flex flex-col space-y-3">
                    {user.bio && <p className="text-sm sm:text-base">{user.bio}</p>}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                        <div className="flex items-center gap-3">
                            <BookOpen className="h-5 w-5 text-muted-foreground shrink-0" />
                            <div>
                                <p className="text-sm font-medium">{bookCount}</p>
                                <p className="text-xs text-muted-foreground">Books Read</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Star className="h-5 w-5 text-muted-foreground shrink-0" />
                            <div>
                                <p className="text-sm font-medium">
                                    {ratingAverage.toFixed(1)}
                                </p>
                                <p className="text-xs text-muted-foreground">Avg Rating</p>
                            </div>
                        </div>
                    </div>

                    {user.favoriteGenre && (
                        <div className="mt-2">
                            <p className="text-xs text-muted-foreground">Favorite Genre</p>
                            <p className="text-sm sm:text-base">{user.favoriteGenre}</p>
                        </div>
                    )}
                </div>
            </CardContent>


        </Card>
    )
);

UserProfileCard.displayName = "UserProfileCard";

export { UserProfileCard };
