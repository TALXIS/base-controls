import React, { useMemo, useRef } from "react";
import { getClassNames } from "@utils";
import { CellUiResizeGripComponents, ICellUiResizeGripComponents } from "./components";
import { getCellUiResizeGripStyles } from "./styles";

export interface ICellUiResizeGripProps {
    /** The row's height a drag starts from. */
    height?: number;
    /** The height the drag has reached, as it reaches it. */
    onResize: (height: number) => void;
    /** Put on the container, alongside its own class. */
    className?: string;
    children?: React.ReactNode;
    components?: Partial<ICellUiResizeGripComponents>;
}

//a row dragged to nothing takes its own grip off the screen with it
const MIN_HEIGHT = 20;

/** What a row is dragged taller by: wrap it around what a cell draws. */
export const CellUiResizeGrip = (props: ICellUiResizeGripProps) => {
    const { height, onResize, children } = props;
    const rootRef = useRef<HTMLDivElement>(null);
    const components = { ...CellUiResizeGripComponents, ...props.components };
    const styles = useMemo(() => getCellUiResizeGripStyles(), []);

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
        //captured so a drag that leaves the cell keeps resizing
        grip.setPointerCapture(event.pointerId);
        grip.addEventListener('pointermove', onPointerMove);
        grip.addEventListener('pointerup', onPointerUp);
        grip.addEventListener('pointercancel', onPointerUp);
    };

    return components.onRenderContainer({
        ref: rootRef,
        className: getClassNames([styles.gripRoot, props.className]),
        children: <>
            {children}
            {components.onRenderGrip({ className: styles.grip, onPointerDown: onPointerDown })}
        </>,
    });
};
