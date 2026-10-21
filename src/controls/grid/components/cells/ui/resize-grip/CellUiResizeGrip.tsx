import React, { useEffect, useMemo, useRef } from "react";
import { getClassNames } from "@utils";
import { useLatest } from "@hooks";
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
    const { children } = props;
    const propsRef = useLatest(props);
    const rootRef = useRef<HTMLDivElement>(null);
    const gripRef = useRef<HTMLDivElement>(null);
    const components = { ...CellUiResizeGripComponents, ...props.components };
    const styles = useMemo(() => getCellUiResizeGripStyles(), []);

    const onPointerDown = (event: PointerEvent) => {
        //the same press reads as a cell range or a row drag to the grid
        event.preventDefault();
        event.stopPropagation();
        const grip = event.currentTarget as HTMLDivElement;
        const startY = event.clientY;
        const startHeight = propsRef.current.height ?? rootRef.current!.offsetHeight;

        const onPointerMove = (moveEvent: PointerEvent) => {
            propsRef.current.onResize(Math.max(startHeight + moveEvent.clientY - startY, MIN_HEIGHT));
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

    //React would hear the press after the row AG Grid drags by
    useEffect(() => {
        const grip = gripRef.current;
        grip?.addEventListener('pointerdown', onPointerDown);
        return () => grip?.removeEventListener('pointerdown', onPointerDown);
    }, []);

    return components.onRenderContainer({
        ref: rootRef,
        className: getClassNames([styles.gripRoot, props.className]),
        children: <>
            {children}
            {components.onRenderGrip({ ref: gripRef, className: styles.grip })}
        </>,
    });
};
