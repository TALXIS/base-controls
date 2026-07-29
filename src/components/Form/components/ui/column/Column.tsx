import * as React from "react";
import { getColumnStyles } from "./styles";
import { ColumnContext } from "./context";
import { Layout } from "../../../layout";
import { useTabContext } from "../tab";

export interface IColumnProps {
    colspan?: number;
    children?: React.ReactNode;
    style?: React.CSSProperties;
}

export const Column = (props: IColumnProps) => {
    const { children, colspan } = props;
    const { columnsPerRow = 1 } = { ...useTabContext() };
    const styles = React.useMemo(() => getColumnStyles(), []);
    const layoutStyle = Layout.getColumnStyles(colspan, columnsPerRow);

    return <div className={styles.column} style={{ ...layoutStyle, ...props.style }}>
        <ColumnContext.Provider value={props}>
            {children}
        </ColumnContext.Provider>
    </div>;
};
