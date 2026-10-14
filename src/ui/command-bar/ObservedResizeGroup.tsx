import * as React from 'react';
import { IComponentAsProps, IResizeGroup, IResizeGroupProps, mergeStyles, ResizeGroup } from "@fluentui/react";
import { useResizeObserver } from "@legacy/hooks/useResizeObserver";
import { getCommandBarStyles } from "./styles";

//Fluent re-fits a command bar only when the window resizes, not when its own box does
export const ObservedResizeGroup = (props: IComponentAsProps<IResizeGroupProps>) => {
    const { defaultRender, componentRef, ...resizeGroupProps } = props;
    const styles = React.useMemo(() => getCommandBarStyles(), []);
    const resizeGroupRef = React.useRef<IResizeGroup | null>(null);
    const remeasure = () => resizeGroupRef.current?.remeasure();
    const observe = useResizeObserver(remeasure);

    //the first fit is measured before the row it sits in has settled
    React.useEffect(() => {
        const frame = requestAnimationFrame(remeasure);
        return () => cancelAnimationFrame(frame);
    }, []);

    const setResizeGroup = React.useCallback((resizeGroup: IResizeGroup | null) => {
        resizeGroupRef.current = resizeGroup;
        if (typeof componentRef === 'function') {
            componentRef(resizeGroup);
        }
        else if (componentRef) {
            (componentRef as React.MutableRefObject<IResizeGroup | null>).current = resizeGroup;
        }
    }, [componentRef]);

    const setRoot = React.useCallback((root: HTMLDivElement | null) => root && observe(root), []);

    return <ResizeGroup {...resizeGroupProps} className={mergeStyles(styles.resizeGroup, resizeGroupProps.className)} componentRef={setResizeGroup} ref={setRoot} />;
};
