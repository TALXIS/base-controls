import React, { useMemo } from "react";
import { getRowResizeGripStyles } from "./styles";

export interface IRowResizeGripProps {
    /** What the cell is worth in pixels, read when a drag starts. */
    getHeight: () => number;
    /** Dragged to a new height, for every step of the drag. */
    onResize: (height: number) => void;
    /** The drag is over, at whatever height it reached. */
    onResizeEnd: () => void;
}

const MIN_HEIGHT = 0;

/** What a row is dragged taller by. */
export const RowResizeGrip = (props: IRowResizeGripProps) => {
    const styles = useMemo(() => getRowResizeGripStyles(), []);

    const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        //the same press reads as the start of a cell range to the grid, and as text selection to the browser
        event.preventDefault();
        event.stopPropagation();
        const grip = event.currentTarget;
        const startY = event.clientY;
        const startHeight = props.getHeight();

        const onPointerMove = (moveEvent: PointerEvent) => {
            props.onResize(Math.max(startHeight + moveEvent.clientY - startY, MIN_HEIGHT));
        };
        const onPointerUp = () => {
            grip.removeEventListener('pointermove', onPointerMove);
            grip.removeEventListener('pointerup', onPointerUp);
            grip.removeEventListener('pointercancel', onPointerUp);
            props.onResizeEnd();
        };
        //captured, so a drag that leaves the cell - which any drag past the row's edge does - keeps coming
        grip.setPointerCapture(event.pointerId);
        grip.addEventListener('pointermove', onPointerMove);
        grip.addEventListener('pointerup', onPointerUp);
        grip.addEventListener('pointercancel', onPointerUp);
    };

    return <div className={styles.gripRoot} onPointerDown={onPointerDown} />;
};
