import * as React from "react";
import { useColumnsContext } from "../columns";
import { ColumnContext } from "./context";

export interface IFormColumnProps {
    width?: React.CSSProperties["width"];
    children?: React.ReactNode;
}

export const Column = (props: IFormColumnProps) => {
    useColumnsContext();
    const { children } = props;

    return (
        <ColumnContext.Provider value={props}>
            <div data-id="tab-column">
                {children}
            </div>
        </ColumnContext.Provider>
    );
};
