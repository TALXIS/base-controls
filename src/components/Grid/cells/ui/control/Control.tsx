import React, { useMemo } from "react";
import { getControlStyles } from "./styles";

export interface IControlUiProps {
    children?: React.ReactNode;
}

/**
 * What a cell's control sits in.
 *
 * The grid sets `--ag-cell-horizontal-padding: 0`, so a cell has no inset of its own and whatever draws in
 * one has to bring it.
 */
export const Control = (props: IControlUiProps) => {
    const styles = useMemo(() => getControlStyles(), []);
    return <div className={styles.controlRoot}>{props.children}</div>;
};
