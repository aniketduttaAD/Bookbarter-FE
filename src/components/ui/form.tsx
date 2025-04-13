import * as React from "react";
import { cn } from "@/lib/utils";
import { ZodIssue } from "zod";
import { Label } from "./label";

interface FormContextValue {
    errors: Record<string, string>;
}

const FormContext = React.createContext<FormContextValue>({
    errors: {},
});

interface FormProviderProps {
    errors: Record<string, string>;
    children: React.ReactNode;
}

export function FormProvider({ errors, children }: FormProviderProps) {
    return (
        <FormContext.Provider value={{ errors }}>
            {children}
        </FormContext.Provider>
    );
}

export function useFormContext() {
    return React.useContext(FormContext);
}

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
    errors?: Record<string, string>;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function Form({
    children,
    className,
    errors = {},
    onSubmit,
    ...props
}: FormProps) {
    return (
        <FormProvider errors={errors}>
            <form
                className={cn("space-y-6", className)}
                onSubmit={onSubmit}
                {...props}
            >
                {children}
            </form>
        </FormProvider>
    );
}

interface FormItemProps {
    children: React.ReactNode;
    className?: string;
}

export function FormItem({ children, className }: FormItemProps) {
    return <div className={cn("space-y-2", className)}>{children}</div>;
}

interface FormLabelProps extends React.ComponentPropsWithoutRef<typeof Label> {
    required?: boolean;
    children: React.ReactNode;
}

export function FormLabel({ className, children, required, ...props }: FormLabelProps) {
    return (
        <Label className={cn(className)} {...props}>
            {children}
            {required && <span className="text-destructive ml-1">*</span>}
        </Label>
    );
}

interface FormControlProps {
    children: React.ReactNode;
    className?: string;
}

export function FormControl({ children, className }: FormControlProps) {
    return <div className={cn("mt-1", className)}>{children}</div>;
}

interface FormMessageProps {
    name: string;
    className?: string;
}

export function FormMessage({ name, className }: FormMessageProps) {
    const { errors } = useFormContext();
    const error = errors[name];

    if (!error) return null;

    return (
        <p className={cn("text-sm text-destructive mt-1", className)}>
            {error}
        </p>
    );
}

export function zodIssueToErrors(issues: ZodIssue[]): Record<string, string> {
    return issues.reduce((acc, issue) => {
        const path = issue.path.join(".");
        acc[path] = issue.message;
        return acc;
    }, {} as Record<string, string>);
}