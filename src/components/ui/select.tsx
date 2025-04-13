import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type SelectContextValue = {
    value: string;
    onValueChange: (value: string) => void;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    disabled?: boolean;
};

const SelectContext = React.createContext<SelectContextValue | undefined>(undefined);

const useSelectContext = () => {
    const context = React.useContext(SelectContext);
    if (!context) {
        throw new Error("Select components must be used within a Select component");
    }
    return context;
};

interface SelectProps {
    value: string;
    onValueChange: (value: string) => void;
    children: React.ReactNode;
    disabled?: boolean;
    defaultOpen?: boolean;
}

export function Select({
    value,
    onValueChange,
    children,
    disabled = false,
    defaultOpen = false,
}: SelectProps) {
    const [open, setOpen] = React.useState(defaultOpen);

    return (
        <SelectContext.Provider
            value={{ value, onValueChange, open, setOpen, disabled }}
        >
            <div className="relative w-full">{children}</div>
        </SelectContext.Provider>
    );
}

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    className?: string;
}

export function SelectTrigger({ children, className }: SelectTriggerProps) {
    const { open, setOpen, disabled } = useSelectContext();

    return (
        <button
            type="button"
            className={cn(
                "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            onClick={() => setOpen(!open)}
            disabled={disabled}
            aria-expanded={open}
        >
            {children}
            <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
    );
}

interface SelectValueProps {
    placeholder?: string;
    className?: string;
}

export function SelectValue({ placeholder, className }: SelectValueProps) {
    const { value } = useSelectContext();

    return (
        <span className={cn("block truncate", className)}>
            {value ? value : placeholder}
        </span>
    );
}

interface SelectContentProps {
    children: React.ReactNode;
    className?: string;
}

export function SelectContent({ children, className }: SelectContentProps) {
    const { open, setOpen } = useSelectContext();

    if (!open) return null;

    return (
        <>
            <div
                className="fixed inset-0 z-50"
                onClick={() => setOpen(false)}
            />
            <div
                className={cn(
                    "absolute z-50 mt-1 max-h-60 w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md",
                    className
                )}
            >
                <div className="p-1 overflow-y-auto">{children}</div>
            </div>
        </>
    );
}

interface SelectItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string;
    children: React.ReactNode;
    className?: string;
}

export function SelectItem({
    value,
    children,
    className,
    ...props
}: SelectItemProps) {
    const { value: selectedValue, onValueChange, setOpen } = useSelectContext();
    const isSelected = selectedValue === value;

    return (
        <button
            type="button"
            className={cn(
                "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                isSelected ? "bg-accent text-accent-foreground" : "",
                className
            )}
            onClick={() => {
                onValueChange(value);
                setOpen(false);
            }}
            role="option"
            aria-selected={isSelected}
            {...props}
        >
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                {isSelected && (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                )}
            </span>
            <span className="truncate">{children}</span>
        </button>
    );
}