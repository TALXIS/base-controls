import * as React from "react";
import { RowContext } from "./context";
import { getRowStyles } from "./styles";
import { useSectionContext } from "../section";

export interface IFormRowProps {
    height?: string;
    rowspan?: number;
    children?: React.ReactNode;
}

export const Row = (props: IFormRowProps) => {
    const { rowspan, children } = props;
    const section = useSectionContext();
    const numOfCells = section?.columns;
    const styles = getRowStyles({rowspan, height: props.height, numOfCells});
    return (
        <div className={styles.row} data-id="form-row">
            <RowContext.Provider value={props}>
                {children}
            </RowContext.Provider>
        </div>
    );
};
