"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { ZodError } from "zod";
import { useDropzone } from "react-dropzone";
import { UploadCloud, X } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { bookService } from "@/lib/book-service";
import {
    createBookSchema,
    CreateBookData,
    bookGenreLabels,
    bookConditionLabels,
} from "@/schemas/book-schema";
import {
    Form,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
    zodIssueToErrors,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { Textarea } from "../ui/textarea";

interface BookFormProps {
    initialData?: Partial<CreateBookData>;
    isEditing?: boolean;
    bookId?: string;
}

export function BookForm({ initialData, isEditing = false, bookId }: BookFormProps) {
    const router = useRouter();
    const { user } = useAuthStore();

    const [formData, setFormData] = useState<CreateBookData>({
        title: initialData?.title || "",
        author: initialData?.author || "",
        genre: initialData?.genre || "fiction",
        description: initialData?.description || "",
        condition: initialData?.condition || "good",
        location: initialData?.location || "",
        contactPreference: initialData?.contactPreference || "",
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            "image/*": [".jpeg", ".jpg", ".png", ".webp"],
        },
        maxSize: 5 * 1024 * 1024,
        onDrop: (acceptedFiles) => {
            if (acceptedFiles.length > 0) {
                const file = acceptedFiles[0];
                setImageFile(file);
                setImagePreview(URL.createObjectURL(file));
            }
        },
        onDropRejected: (fileRejections) => {
            const message = fileRejections[0]?.errors[0]?.message || "File upload failed";
            toast.error(message);
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSelectChange = (field: keyof CreateBookData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const removeImage = () => {
        setImageFile(null);
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
            setImagePreview(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            createBookSchema.parse(formData);
            setErrors({});
            setIsSubmitting(true);

            if (isEditing && bookId) {
                await bookService.updateBook(bookId, formData, imageFile || undefined);
                toast.success("Book updated successfully!");
            } else {
                await bookService.createBook(formData, imageFile || undefined);
                toast.success("Book added successfully!");
            }

            router.push(user?.role === "owner" ? "/dashboard/owner" : "/books");
        } catch (error) {
            if (error instanceof ZodError) {
                setErrors(zodIssueToErrors(error.issues));
            } else {
                toast.error("Something went wrong. Please try again.");
                console.error("Book form error:", error);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>{isEditing ? "Edit Book" : "Add New Book"}</CardTitle>
                <CardDescription>
                    {isEditing ? "Update the details of your book listing." : "Fill in the details about the book you want to share."}
                </CardDescription>
            </CardHeader>

            <Form errors={errors} onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                    <FormItem>
                        <FormLabel required>Book Title</FormLabel>
                        <FormControl>
                            <Input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Enter the title of the book"
                                disabled={isSubmitting}
                            />
                        </FormControl>
                        <FormMessage name="title" />
                    </FormItem>

                    <FormItem>
                        <FormLabel required>Author</FormLabel>
                        <FormControl>
                            <Input
                                name="author"
                                value={formData.author}
                                onChange={handleChange}
                                placeholder="Enter the author's name"
                                disabled={isSubmitting}
                            />
                        </FormControl>
                        <FormMessage name="author" />
                    </FormItem>

                    <FormItem>
                        <FormLabel required>Genre</FormLabel>
                        <FormControl>
                            <Select
                                value={formData.genre}
                                onValueChange={(value) => handleSelectChange("genre", value)}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select genre" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(bookGenreLabels).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormControl>
                        <FormMessage name="genre" />
                    </FormItem>

                    <FormItem>
                        <FormLabel required>Description</FormLabel>
                        <FormControl>
                            <Textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Provide a brief description of the book"
                                rows={4}
                                disabled={isSubmitting}
                            />
                        </FormControl>
                        <FormMessage name="description" />
                    </FormItem>

                    <FormItem>
                        <FormLabel required>Condition</FormLabel>
                        <FormControl>
                            <Select
                                value={formData.condition}
                                onValueChange={(value) => handleSelectChange("condition", value)}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select condition" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(bookConditionLabels).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormControl>
                        <FormMessage name="condition" />
                    </FormItem>

                    <FormItem>
                        <FormLabel required>Location</FormLabel>
                        <FormControl>
                            <Input
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="Your city or area"
                                disabled={isSubmitting}
                            />
                        </FormControl>
                        <FormMessage name="location" />
                    </FormItem>

                    <FormItem>
                        <FormLabel required>Contact Preference</FormLabel>
                        <FormControl>
                            <Input
                                name="contactPreference"
                                value={formData.contactPreference}
                                onChange={handleChange}
                                placeholder="How would you like to be contacted?"
                                disabled={isSubmitting}
                            />
                        </FormControl>
                        <FormMessage name="contactPreference" />
                    </FormItem>

                    <FormItem>
                        <FormLabel>Book Cover Image</FormLabel>
                        <FormControl>
                            <div className="mt-1 space-y-2">
                                {imagePreview ? (
                                    <div className="relative w-40 h-56 bg-muted rounded-md overflow-hidden group">
                                        <Image
                                            src={imagePreview}
                                            alt="Book cover preview"
                                            fill
                                            className="object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        {...getRootProps()}
                                        className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
                                            }`}
                                    >
                                        <input {...getInputProps()} />
                                        <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            {isDragActive ? "Drop the image here..." : "Drag & drop an image here, or click to select"}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            PNG, JPG or WEBP up to 5MB
                                        </p>
                                    </div>
                                )}
                            </div>
                        </FormControl>
                        <FormMessage name="image" />
                    </FormItem>
                </CardContent>

                <CardFooter className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : isEditing ? "Update Book" : "Add Book"}
                    </Button>
                </CardFooter>
            </Form>
        </Card>
    );
}
