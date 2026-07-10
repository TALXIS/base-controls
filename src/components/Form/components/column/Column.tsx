import * as React from "react";
import { useColumnsContext } from "../columns";
import { ColumnContext } from "./context";

export interface IFormColumnProps {
    width?: React.CSSProperties["width"];
    children?: React.ReactNode;
}

export const Column: React.FC<IFormColumnProps> = ({
    width,
    children,
}) => {
    useColumnsContext();

    return (
        <ColumnContext.Provider value={{ width }}>
            <div data-id="tab-column">
                {children}
            </div>
        </ColumnContext.Provider>
    );
};
