import * as React from "react";
import { getColumnsStyles } from "./styles";
import { useColumnsContext } from "../columns";
import { ColumnContext } from "./context";
import { Layout } from "../../layout";

export interface IColumnProps {
    colspan?: number;
    children?: React.ReactNode;
}

export const Column = (props: IColumnProps) => {
    const { children, colspan } = props;
    const { columnsPerRow = 1 } = useColumnsContext("Column");
    const styles = React.useMemo(() => getColumnsStyles(), []);
    const layoutStyle = Layout.getColumnStyles(colspan, columnsPerRow);
    
    return <div className={styles.column} style={layoutStyle}>
        <ColumnContext.Provider value={props}>
            {children}
        </ColumnContext.Provider>
    </div>
}
