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
    useRowsContext();
    const section = useSectionContext();
    const { height, children } = props;
    const styles = getRowStyles(height, section.columns);

    return (
        <div className={styles.row}>
            <RowContext.Provider value={props}>
                {children}
            </RowContext.Provider>
        </div>
    );
};
