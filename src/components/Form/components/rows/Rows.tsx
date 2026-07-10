import * as React from "react";
import { RowsContext } from "./context";
import { getRowsStyles } from "./styles";
import { useSectionContext } from "../section";

export interface IFormRowsProps {
    children?: React.ReactNode;
}

export const Rows = ({ children }: IFormRowsProps) => {
    const section = useSectionContext();

    const rowChildren = React.Children.toArray(children).filter(React.isValidElement);

    if (rowChildren.length === 0) {
        return null;
    }

    const cols = Math.max(section.columns ?? 1, 1);
    const styles = getRowsStyles(cols);

    return (
        <RowsContext.Provider value={true}>
            <div data-id="form-rows" className={styles.rows}>
                {rowChildren}
            </div>
        </RowsContext.Provider>
    );
};
