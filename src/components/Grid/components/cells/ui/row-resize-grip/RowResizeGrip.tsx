import React, { useMemo, useRef } from "react";
import { getRowResizeGripStyles } from "./styles";

export interface IRowResizeGripProps {
    /** What the row is worth now, and what a drag starts from. */
    height?: number;
    /** The drag is over, at the height it reached. */
    onResizeEnd: (height: number) => void;
    children?: React.ReactNode;
}

const MIN_HEIGHT = 0;

/** What a row is dragged taller by: wrap it around what a cell draws. */
export const RowResizeGrip = (props: IRowResizeGripProps) => {
    const { height, onResizeEnd, children } = props;
    const rootRef = useRef<HTMLDivElement>(null);
    const heightRef = useRef<number>();
    const styles = useMemo(() => getRowResizeGripStyles(), []);

    //AG Grid measures the cell and works the row out from that, so the drag grows what the cell draws
    //rather than telling anyone about it. What it settles on goes out once, on drop
    const onResize = (nextHeight: number) => {
        heightRef.current = nextHeight;
        rootRef.current!.style.minHeight = `${nextHeight}px`;
    };

    const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        //the same press reads as the start of a cell range to the grid, and as text selection to the browser
        event.preventDefault();
        event.stopPropagation();
        const grip = event.currentTarget;
        const startY = event.clientY;
        const startHeight = height ?? rootRef.current!.offsetHeight;

        const onPointerMove = (moveEvent: PointerEvent) => {
            onResize(Math.max(startHeight + moveEvent.clientY - startY, MIN_HEIGHT));
        };
        const onPointerUp = () => {
            grip.removeEventListener('pointermove', onPointerMove);
            grip.removeEventListener('pointerup', onPointerUp);
            grip.removeEventListener('pointercancel', onPointerUp);
            if (heightRef.current !== undefined) {
                onResizeEnd(heightRef.current);
            }
        };
        //captured, so a drag that leaves the cell - which any drag past the row's edge does - keeps coming
        grip.setPointerCapture(event.pointerId);
        grip.addEventListener('pointermove', onPointerMove);
        grip.addEventListener('pointerup', onPointerUp);
        grip.addEventListener('pointercancel', onPointerUp);
    };

    return <div ref={rootRef} className={styles.gripRoot} style={height !== undefined ? { minHeight: height } : undefined}>
        {children}
        <div className={styles.grip} onPointerDown={onPointerDown} />
    </div>;
};
