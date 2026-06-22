import * as React from "react";

export interface IFormRowProps {
    className?: string;
    id?: string;
    children?: React.ReactNode;
}

export const Row: React.FC<IFormRowProps> = ({ className, id, children }) => {
    return (
        <div data-id={id ?? "form-row"} className={className}>
            {children}
        </div>
    );
};
