import * as React from "react";
import { RowContext } from "./context";
import { useRowsContext } from "../rows";
import { getRowStyles } from "./styles";
import { useSectionContext } from "../..";
import { ReactGridLayout } from "react-grid-layout";

export interface IFormRowProps {
    height?: string;
    children?: React.ReactNode;
}

export const Row: React.FC<IFormRowProps> = ({ height, children }) => {
    useRowsContext();
    const section = useSectionContext();
    const styles = getRowStyles(height, section.columns);

    return (
        <div className={styles.row}>
            <RowContext.Provider value={{ height }}>
                {children}
            </RowContext.Provider>
        </div>
    );
};
