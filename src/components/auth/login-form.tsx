"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { ZodError } from "zod";
import axios from "axios";
import { loginSchema, type LoginFormData } from "@/schemas/auth-schema";
import { useAuthStore } from "@/store/auth-store";
import { authService } from "@/lib/auth-service";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Form,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
    zodIssueToErrors,
} from "@/components/ui/form";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "../ui/input";

export function LoginForm() {
    const router = useRouter();
    const { login, user } = useAuthStore();

    const [formData, setFormData] = useState<LoginFormData>({
        email: "",
        password: "",
        rememberMe: false,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            loginSchema.parse(formData);
            setErrors({});
            setIsSubmitting(true);
            const response = await authService.login(formData);
            login(response.user, response.token);

            toast.success("Logged in successfully!");
            router.push(
                user?.role === "seeker"
                    ? "/dashboard/seeker"
                    : "/dashboard/owner"
            );
        } catch (error) {
            if (error instanceof ZodError) {
                setErrors(zodIssueToErrors(error.issues));
            } else if (axios.isAxiosError(error)) {
                const errorMessage =
                    error.response?.data?.message || "Invalid email or password";
                toast.error(errorMessage);
            } else {
                toast.error("Something went wrong. Please try again.");
                console.error("Login error:", error);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
                <CardDescription className="text-center">
                    Enter your credentials to access your account
                </CardDescription>
            </CardHeader>

            <CardContent>
                <Form errors={errors} onSubmit={handleSubmit}>
                    <FormItem>
                        <FormLabel required>Email</FormLabel>
                        <FormControl>
                            <Input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="name@example.com"
                                autoComplete="email"
                                disabled={isSubmitting}
                            />
                        </FormControl>
                        <FormMessage name="email" />
                    </FormItem>

                    <FormItem>
                        <FormControl>
                            <FormLabel required>Password</FormLabel>
                            <Input
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                autoComplete="current-password"
                                disabled={isSubmitting}
                            />
                        </FormControl>
                        <FormMessage name="password" />
                    </FormItem>
                    <div className="flex items-center justify-between">
                        <Link
                            href="/forgot-password"
                            className="text-sm font-medium text-primary hover:underline"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    <div className="flex items-center space-x-2 mt-4">
                        <Checkbox
                            id="rememberMe"
                            name="rememberMe"
                            checked={formData.rememberMe ?? false}
                            onCheckedChange={(checked) => {
                                setFormData((prev) => ({
                                    ...prev,
                                    rememberMe: checked === true,
                                }));
                            }}
                            disabled={isSubmitting}
                        />
                        <label
                            htmlFor="rememberMe"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Remember me
                        </label>
                    </div>

                    <Button type="submit" className="w-full mt-6" disabled={isSubmitting}>
                        {isSubmitting ? "Signing in..." : "Sign In"}
                    </Button>
                </Form>
            </CardContent>

            <CardFooter className="flex justify-center border-t p-4">
                <p className="text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link
                        href="/signup"
                        className="text-primary hover:underline font-medium"
                    >
                        Create account
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}
