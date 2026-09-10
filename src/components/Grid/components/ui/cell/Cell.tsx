import React, { useMemo, useRef } from "react";
import { useTheme } from "@fluentui/react";
import { RowResizeGrip } from "./row-resize-grip";
import { getCellStyles } from "./styles";

export interface ICellUiProps {
    /** How the content sits. Left, unless told otherwise. */
    alignment?: 'left' | 'center' | 'right';
    resizeOptions?: ICellResizeOptions;
    children?: React.ReactNode;
}

/** Whether the cell offers a grip, where it starts from, and what to do once one has been dragged. */
export interface ICellResizeOptions {
    resizable: boolean;
    /** The height the row was already dragged to. Content taller than it still wins. */
    height?: number;
    /** The drag ended, at the height it reached. */
    onResizeEnd: (height: number) => void;
}

/** The element a cell's content is drawn in. */
export const Cell = (props: ICellUiProps) => {
    const { alignment = 'left', resizeOptions, children } = props;
    const cellRef = useRef<HTMLDivElement>(null);
    const heightRef = useRef<number>();
    //whatever the adapter provided, or the grid's own where the cell had nothing of its own to say
    const theme = useTheme();
    const styles = useMemo(() => getCellStyles(theme, alignment), [theme, alignment]);

    const onResize = (height: number) => {
        heightRef.current = height;
        //AG Grid measures the cell and works the row out from that, so the drag grows the content
        cellRef.current!.style.minHeight = `${height}px`;
    };

    return <div ref={cellRef} className={styles.cellRoot} style={resizeOptions?.height !== undefined ? { minHeight: resizeOptions.height } : undefined}>
        <div className={styles.contentRoot}>{children}</div>
        {resizeOptions?.resizable && <RowResizeGrip
            getHeight={() => resizeOptions.height ?? cellRef.current!.offsetHeight}
            onResize={onResize}
            onResizeEnd={() => resizeOptions.onResizeEnd(heightRef.current!)} />}
    </div>;
};
