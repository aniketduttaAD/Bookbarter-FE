"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { ZodError } from "zod";
import { signupSchema, type SignupFormData } from "@/schemas/auth-schema";
import { useAuthStore } from "@/store/auth-store";
import { authService } from "@/lib/auth-service";
import { Button } from "@/components/ui/button";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { Input } from "../ui/input";

export function SignupForm() {
    const router = useRouter();
    const { login, setLoading } = useAuthStore();
    const [formData, setFormData] = useState<SignupFormData>({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        mobile: "",
        role: "seeker",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleRoleChange = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            role: value as "owner" | "seeker",
        }));

        if (errors.role) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.role;
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            signupSchema.parse(formData);

            setErrors({});
            setIsSubmitting(true);
            setLoading(true);

            const response = await authService.signup(formData);

            login(response.user, response.token);

            toast.success("Account created successfully!");

            router.push(response.user.role === "owner" ? "/dashboard/owner" : "/dashboard/seeker");
        } catch (error) {
            if (error instanceof ZodError) {
                setErrors(zodIssueToErrors(error.issues));
            } else if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.message || "Failed to create account";
                toast.error(errorMessage);
            } else {
                toast.error("Something went wrong. Please try again.");
                console.error("Signup error:", error);
            }
        } finally {
            setIsSubmitting(false);
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl text-center">Create your account</CardTitle>
                <CardDescription className="text-center">
                    Enter your details to create a new account
                </CardDescription>
            </CardHeader>

            <CardContent>
                <Form errors={errors} onSubmit={handleSubmit}>
                    <FormItem>
                        <FormLabel required>Full Name</FormLabel>
                        <FormControl>
                            <Input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="John Doe"
                                autoComplete="name"
                                disabled={isSubmitting}
                            />
                        </FormControl>
                        <FormMessage name="name" />
                    </FormItem>

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
                        <FormLabel required>Mobile Number</FormLabel>
                        <FormControl>
                            <Input
                                name="mobile"
                                type="tel"
                                value={formData.mobile}
                                onChange={handleChange}
                                placeholder="10-digit mobile number"
                                autoComplete="tel"
                                disabled={isSubmitting}
                            />
                        </FormControl>
                        <FormMessage name="mobile" />
                    </FormItem>

                    <FormItem>
                        <FormLabel required>Password</FormLabel>
                        <FormControl>
                            <Input
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                autoComplete="new-password"
                                disabled={isSubmitting}
                            />
                        </FormControl>
                        <FormMessage name="password" />
                    </FormItem>

                    <FormItem>
                        <FormLabel required>Confirm Password</FormLabel>
                        <FormControl>
                            <Input
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                autoComplete="new-password"
                                disabled={isSubmitting}
                            />
                        </FormControl>
                        <FormMessage name="confirmPassword" />
                    </FormItem>

                    <FormItem>
                        <FormLabel required>I am a</FormLabel>
                        <FormControl>
                            <Select
                                value={formData.role}
                                onValueChange={handleRoleChange}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="owner">Book Owner</SelectItem>
                                    <SelectItem value="seeker">Book Seeker</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormControl>
                        <FormMessage name="role" />
                    </FormItem>

                    <Button
                        type="submit"
                        className="w-full mt-6"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Creating account..." : "Create Account"}
                    </Button>
                </Form>
            </CardContent>

            <CardFooter className="flex justify-center border-t p-4">
                <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        className="text-primary hover:underline font-medium"
                    >
                        Sign in
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}
