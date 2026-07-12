import * as React from "react";
import { RowsContext } from "./context";
import { getRowsStyles } from "./styles";
import { useSectionContext } from "../section";

export interface IFormRowsProps {
    children?: React.ReactNode;
}

export const Rows = ({ children }: IFormRowsProps) => {
    useSectionContext();
    const styles = React.useMemo(() => getRowsStyles(), []);

    return (
        <RowsContext.Provider value={true}>
            <div data-id="form-rows" className={styles.rows}>
                {children}
            </div>
        </RowsContext.Provider>
    );
};
