import * as React from "react";
import { useColumnsContext } from "../columns";
import { ColumnContext } from "./context";
import { getColumnsStyles } from "./styles";

export interface IFormColumnProps {
    width: string;
    minWidth?: string;
    children?: React.ReactNode;
}

export const Column = (props: IFormColumnProps) => {
    useColumnsContext("Column");
    const {children, width, minWidth} = props;
    const childrenArray = React.Children.toArray(children).filter(child => React.isValidElement(child));
    const styles = React.useMemo(() => getColumnsStyles(width, minWidth), [width, minWidth]);
    return <div className={styles.column}>{childrenArray}</div>
}
