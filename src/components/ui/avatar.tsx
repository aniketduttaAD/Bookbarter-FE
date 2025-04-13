"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";
import { generateAvatarFallback } from "@/lib/utils";

const Avatar = React.forwardRef<
    React.ComponentRef<typeof AvatarPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
    <AvatarPrimitive.Root
        ref={ref}
        className={cn(
            "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
            className
        )}
        {...props}
    />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
    React.ComponentRef<typeof AvatarPrimitive.Image>,
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
    <AvatarPrimitive.Image
        ref={ref}
        className={cn("aspect-square h-full w-full", className)}
        {...props}
    />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
    React.ComponentRef<typeof AvatarPrimitive.Fallback>,
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, children, ...props }, ref) => (
    <AvatarPrimitive.Fallback
        ref={ref}
        className={cn(
            "flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-primary font-medium",
            className
        )}
        {...props}
    >
        {children}
    </AvatarPrimitive.Fallback>
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

interface UserAvatarProps {
    name: string;
    src?: string;
    className?: string;
    size?: "sm" | "md" | "lg";
}

const UserAvatar = React.forwardRef<
    React.ComponentRef<typeof Avatar>,
    UserAvatarProps
>(({ name, src, className, size = "md", ...props }, ref) => {
    const fallback = generateAvatarFallback(name);

    return (
        <Avatar
            ref={ref}
            className={cn({
                "h-8 w-8": size === "sm",
                "h-10 w-10": size === "md",
                "h-14 w-14": size === "lg",
            }, className)}
            {...props}
        >
            {src && <AvatarImage src={src} alt={name} />}
            <AvatarFallback>{fallback}</AvatarFallback>
        </Avatar>
    );
});
UserAvatar.displayName = "UserAvatar";

export { Avatar, AvatarImage, AvatarFallback, UserAvatar };