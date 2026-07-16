import * as React from "react";
import { getColumnsStyles } from "./styles";
import { ColumnContext } from "./context";

export interface IColumnProps {
    width: string;
    minWidth?: string;
    children?: React.ReactNode;
}

export const Column = (props: IColumnProps) => {
    const { children, width, minWidth } = props;
    const styles = React.useMemo(() => getColumnsStyles(width, minWidth), [width, minWidth]);
    
    return <div className={styles.column}>
        <ColumnContext.Provider value={props}>
            {children}
        </ColumnContext.Provider>
    </div>
}
