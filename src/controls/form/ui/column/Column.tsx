import * as React from "react";
import { getFormUiColumnStyles } from "./styles";
import { ColumnContext } from "./context";
import { Layout } from "../layout";
import { useTabContext } from "../tab";

export interface IFormUiColumnProps {
    id?: string;
    //this is because of form builder => TODO: solve more cleanly
    dataId?: string;
    colspan?: number;
    children?: React.ReactNode;
    style?: React.CSSProperties;
}

export const FormUiColumn = (props: IFormUiColumnProps) => {
    const { children, colspan } = props;
    const { columnsPerRow = 1 } = { ...useTabContext() };
    const styles = React.useMemo(() => getFormUiColumnStyles(), []);
    const layoutStyle = Layout.getColumnStyles(colspan, columnsPerRow);

    return <div className={styles.column} data-id={props.dataId ?? (props.id ? `column-${props.id}` : undefined)} style={{ ...layoutStyle, ...props.style }}>
        <ColumnContext.Provider value={props}>
            {children}
        </ColumnContext.Provider>
    </div>;
};
