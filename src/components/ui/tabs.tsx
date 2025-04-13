import React, { useState } from "react";

interface TabsProps {
    defaultValue: string;
    value: string;
    onValueChange: (value: string) => void;
    children: React.ReactNode;
    className?: string;
}

interface TabsListProps {
    children: React.ReactNode;
    className?: string;
}

interface TabsTriggerProps {
    value: string;
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
}

interface TabsContentProps {
    value: string;
    children: React.ReactNode;
    className?: string;
}

const TabsContext = React.createContext<{
    value: string;
    onValueChange: (value: string) => void;
}>({
    value: "",
    onValueChange: () => { },
});

export const Tabs: React.FC<TabsProps> = ({
    defaultValue,
    value,
    onValueChange,
    children,
    className = "",
}) => {
    const [internalValue, setInternalValue] = useState<string>(defaultValue);
    const finalValue = value ?? internalValue;

    const handleValueChange = (newValue: string) => {
        if (onValueChange) {
            onValueChange(newValue);
        } else {
            setInternalValue(newValue);
        }
    };

    return (
        <TabsContext.Provider
            value={{
                value: finalValue,
                onValueChange: handleValueChange,
            }}
        >
            <div className={`w-full ${className}`}>{children}</div>
        </TabsContext.Provider>
    );
};

export const TabsList: React.FC<TabsListProps> = ({
    children,
    className = "",
}) => {
    return (
        <div
            className={`flex items-center space-x-2 rounded-lg border bg-muted p-1 ${className}`}
            role="tablist"
        >
            {children}
        </div>
    );
};

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
    value,
    children,
    className = "",
    disabled = false,
}) => {
    const { value: selectedValue, onValueChange } = React.useContext(TabsContext);
    const isSelected = selectedValue === value;

    return (
        <button
            role="tab"
            aria-selected={isSelected}
            data-state={isSelected ? "active" : "inactive"}
            disabled={disabled}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${isSelected
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                } ${className}`}
            onClick={() => onValueChange(value)}
        >
            {children}
        </button>
    );
};

export const TabsContent: React.FC<TabsContentProps> = ({
    value,
    children,
    className = "",
}) => {
    const { value: selectedValue } = React.useContext(TabsContext);
    const isSelected = selectedValue === value;

    if (!isSelected) return null;

    return (
        <div
            role="tabpanel"
            data-state={isSelected ? "active" : "inactive"}
            className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}
        >
            {children}
        </div>
    );
};
