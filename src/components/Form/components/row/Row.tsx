import * as React from "react";
import { RowContext } from "./context";
import { useRowsContext } from "../rows";
import { getRowStyles } from "./styles";
import { useSectionContext } from "../..";

export interface IFormRowProps {
    height?: string;
    children?: React.ReactNode;
}

export const Row = (props: IFormRowProps) => {
    const rowsContext = useRowsContext();
    const sectionContext = useSectionContext();
    
    if (!rowsContext) {
        throw new Error("[Form] Row must be rendered inside Rows.");
    }
    if(!sectionContext) {
        throw new Error("[Form] Row must be rendered inside a Section.");
    }
    const { height, children } = props;
    const styles = getRowStyles(height, sectionContext.columns);

    return (
        <div className={styles.row}>
            <RowContext.Provider value={props}>
                {children}
            </RowContext.Provider>
        </div>
    );
};
