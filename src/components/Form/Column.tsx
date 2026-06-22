import * as React from "react";

export interface IFormColumnProps {
    width?: React.CSSProperties["width"];
    columnIndex?: number;
    className?: string;
    children?: React.ReactNode;
}

export const Column: React.FC<IFormColumnProps> = ({ width, columnIndex, className, children }) => {
    return (
        <div
            data-id={columnIndex === undefined ? "tab-column" : `tab-column-${columnIndex}`}
            className={className}
            style={width ? { width } : undefined}
        >
            {children}
        </div>
    );
};
