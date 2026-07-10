import * as React from "react";

export interface IFormColumnProps {
    width?: React.CSSProperties["width"];
    columnIndex?: number;
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
}

export const Column: React.FC<IFormColumnProps> = ({ width, columnIndex, className, style, children }) => {
    return (
        <div
            data-id={columnIndex === undefined ? "tab-column" : `tab-column-${columnIndex}`}
            className={className}
            style={width ? { ...style, width } : style}
        >
            {children}
        </div>
    );
};
