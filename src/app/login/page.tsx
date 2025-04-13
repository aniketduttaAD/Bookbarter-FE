import { LoginForm } from "@/components/auth/login-form";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login - BookBarter",
    description: "Sign in to your BookBarter account",
};

export default function LoginPage() {
    return (
        <div className="flex h-screen items-center justify-center px-4">
            <LoginForm />
        </div>
    );
}