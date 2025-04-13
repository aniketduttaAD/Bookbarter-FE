import { SignupForm } from "@/components/auth/signup-form";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign Up",
    description: "Create a new account to share or find books",
};

export default function SignupPage() {
    return (
        <div className="flex h-screen items-center justify-center px-4">
            <SignupForm />
        </div>
    );
}