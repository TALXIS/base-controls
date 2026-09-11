import React, { useMemo } from "react";
import { useTheme } from "@fluentui/react";
import { IAlignment } from "@utils";
import { getCellStyles } from "./styles";

export interface ICellUiProps {
    /** How the content sits. Left, unless told otherwise. */
    alignment?: IAlignment;
    children?: React.ReactNode;
}

/** The element a cell's content is drawn in. */
export const Cell = (props: ICellUiProps) => {
    const { alignment = 'left', children } = props;
    //whatever the adapter provided, or the grid's own where the cell had nothing of its own to say
    const theme = useTheme();
    const styles = useMemo(() => getCellStyles(theme, alignment), [theme, alignment]);

    return <div className={styles.cellRoot}>
        <div className={styles.contentRoot}>{children}</div>
    </div>;
};
