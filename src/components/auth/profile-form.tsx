"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { ZodError } from "zod";
import axios from "axios";
import { z } from "zod";
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
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "../ui/input";
import { useRouter } from "next/navigation";

const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    mobile: z.string().regex(/^\d{10}$/, "Mobile number must be 10 digits"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileForm() {
    const { user, updateUser } = useAuthStore();
    const [formData, setFormData] = useState<ProfileFormData>({
        name: user?.name || "",
        email: user?.email || "",
        mobile: user?.mobile || "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                mobile: user.mobile,
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            profileSchema.parse(formData);
            setErrors({});
            setIsSubmitting(true);
            const updatedUser = await authService.updateProfile(formData);
            updateUser(updatedUser);
            toast.success("Profile updated successfully!");
            const role = updatedUser.role?.toLowerCase();
            if (role === "owner" || role === "seeker") {
                router.push(`/dashboard/${role}`);
            } else {
                router.push("/");
            }
        } catch (error) {
            if (error instanceof ZodError) {
                setErrors(zodIssueToErrors(error.issues));
            } else if (axios.isAxiosError(error)) {
                const errorMessage = error.response?.data?.message || "Failed to update profile";
                toast.error(errorMessage);
            } else {
                toast.error("Something went wrong. Please try again.");
                console.error("Profile update error:", error);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) {
        return <div>Loading profile...</div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>
                    Update your personal information
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
                                disabled={isSubmitting}
                            />
                        </FormControl>
                        <FormMessage name="mobile" />
                    </FormItem>

                    <Button
                        type="submit"
                        className="mt-6"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Saving changes..." : "Save changes"}
                    </Button>
                </Form>
            </CardContent>
        </Card>
    );
}