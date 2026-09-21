import React, { useMemo, useRef } from "react";
import { getRowResizeGripStyles } from "./styles";

export interface ICellUiResizeGripProps {
    /** What the row is worth now, which is what a drag starts from. */
    height?: number;
    /** The height the drag has reached, as it reaches it. */
    onResize: (height: number) => void;
    children?: React.ReactNode;
}

//a row dragged to nothing takes its own grip off the screen with it
const MIN_HEIGHT = 20;

/** What a row is dragged taller by: wrap it around what a cell draws. */
export const CellUiResizeGrip = (props: ICellUiResizeGripProps) => {
    const { height, onResize, children } = props;
    const rootRef = useRef<HTMLDivElement>(null);
    const styles = useMemo(() => getRowResizeGripStyles(), []);

    const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        //the same press reads as the start of a cell range to the grid
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
        };
        //captured, so a drag that leaves the cell
        grip.setPointerCapture(event.pointerId);
        grip.addEventListener('pointermove', onPointerMove);
        grip.addEventListener('pointerup', onPointerUp);
        grip.addEventListener('pointercancel', onPointerUp);
    };

    return <div ref={rootRef} className={styles.gripRoot}>
        {children}
        <div className={styles.grip} onPointerDown={onPointerDown} />
    </div>;
};
