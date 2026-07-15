import * as React from "react";
import { RowsContext } from "./context";
import { getRowsStyles } from "./styles";
import { useSectionContext } from "../..";

export interface IFormRowsProps {
    children?: React.ReactNode;
}

export const Rows = ({ children }: IFormRowsProps) => {
    const section = useSectionContext();
    const childrenArray = React.Children.toArray(children).filter(child => React.isValidElement(child));
    const numOfColumns = section?.columns;
    const numOfRows = childrenArray.length;
    const styles = React.useMemo(() => getRowsStyles({ numOfColumns, numOfRows }), [numOfColumns, numOfRows]);

    return (
        <RowsContext.Provider value={true}>
            <div data-id="form-rows" className={styles.rows}>
                {children}
            </div>
        </RowsContext.Provider>
    );
};
