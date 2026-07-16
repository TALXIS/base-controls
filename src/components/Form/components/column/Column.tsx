import * as React from "react";
import { getColumnsStyles } from "./styles";
import { ColumnsContext } from "../columns";
import { ColumnContext } from "./context";

export interface IColumnProps {
    colspan?: number;
    children?: React.ReactNode;
}

export const Column = (props: IColumnProps) => {
    const { children, colspan } = props;
    const styles = React.useMemo(() => getColumnsStyles(colspan), [colspan]);
    const columnsContext = React.useContext(ColumnsContext);
    console.log(columnsContext);
    
    return <div className={styles.column}>
        <ColumnContext.Provider value={props}>
            {children}
        </ColumnContext.Provider>
    </div>
}
