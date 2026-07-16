import * as React from "react";
import { getColumnsStyles } from "./styles";
import { useColumnsContext } from "../columns";
import { ColumnContext } from "./context";

export interface IColumnProps {
    colspan?: number;
    children?: React.ReactNode;
}

export const Column = (props: IColumnProps) => {
    const { children, colspan } = props;
    const { columnsPerRow = 1 } = useColumnsContext("Column");
    const styles = React.useMemo(() => getColumnsStyles({ columnsPerRow, colspan }), [columnsPerRow, colspan]);
    
    return <div className={styles.column}>
        <ColumnContext.Provider value={props}>
            {children}
        </ColumnContext.Provider>
    </div>
}
