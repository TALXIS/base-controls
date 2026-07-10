import * as React from "react";
import { useColumnsContext } from "./ColumnsContext";
import { SectionsContext } from "./SectionsContext";

export interface IFormColumnProps {
    width?: React.CSSProperties["width"];
    columnIndex?: number;
    className?: string;
    style?: React.CSSProperties;
    applyWidthStyle?: boolean;
    children?: React.ReactNode;
}

export const Column: React.FC<IFormColumnProps> = ({
    width,
    columnIndex,
    className,
    style,
    applyWidthStyle = true,
    children,
}) => {
    useColumnsContext();

    return (
        <SectionsContext.Provider value={true}>
            <div
                data-id={columnIndex === undefined ? "tab-column" : `tab-column-${columnIndex}`}
                className={className}
                style={applyWidthStyle && width ? { ...style, width } : style}
            >
                {children}
            </div>
        </SectionsContext.Provider>
    );
};
