import React, { forwardRef, InputHTMLAttributes } from "react";

type CheckedState = boolean | "indeterminate";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "checked" | "onChange"> {
    id: string;
    name: string;
    checked: boolean;
    onCheckedChange: (checked: CheckedState) => void;
    disabled?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className = "", id, name, checked, onCheckedChange, disabled, ...props }, ref) => {
        return (
            <div className="relative flex items-center">
                <input
                    type="checkbox"
                    id={id}
                    name={name}
                    checked={checked}
                    onChange={(e) => onCheckedChange(e.target.checked)}
                    disabled={disabled}
                    className="peer absolute h-4 w-4 opacity-0"
                    ref={ref}
                    {...props}
                />
                <div
                    className={`flex h-4 w-4 items-center justify-center rounded border border-primary shadow peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 ${checked ? "bg-primary text-primary-foreground" : "bg-background"
                        } ${className}`}
                    aria-hidden="true"
                >
                    {checked && (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="9"
                            height="9"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-background"
                        >
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    )}
                </div>
            </div>
        );
    }
);

Checkbox.displayName = "Checkbox";