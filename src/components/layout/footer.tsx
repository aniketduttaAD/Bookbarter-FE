import Link from "next/link";
import { Github } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t w-full px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row w-full max-w-screen-xl mx-auto py-6">
                <div className="flex flex-col items-center gap-4 md:items-start md:gap-2">
                    <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                        Built with 💚 for book lovers everywhere.
                    </p>
                    <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                        &copy; {new Date().getFullYear()} BookBarter. All rights reserved.
                    </p>
                </div>
                <div className="flex gap-4 items-center">
                    <Link
                        href="/terms"
                        className="text-sm text-muted-foreground hover:text-foreground"
                    >
                        Terms
                    </Link>
                    <Link
                        href="/privacy"
                        className="text-sm text-muted-foreground hover:text-foreground"
                    >
                        Privacy
                    </Link>
                    <Link
                        href="/faq"
                        className="text-sm text-muted-foreground hover:text-foreground"
                    >
                        FAQ
                    </Link>
                    <Link
                        href="https://github.com"
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-muted-foreground hover:text-foreground flex items-center"
                    >
                        <Github className="h-4 w-4" />
                        <span className="sr-only">GitHub</span>
                    </Link>
                </div>
            </div>
        </footer>
    );
}
