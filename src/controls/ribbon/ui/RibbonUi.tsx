import { useEffect, useMemo, useRef } from "react";
import { ICommandBar, ICommandBarItemProps } from "@fluentui/react";
import { useResizeObserver } from "@legacy";
import { getClassNames } from "@utils";
import { IRibbonUiComponents, RibbonUiComponents } from "./components";
import { getRibbonUiStyles } from "./styles";

export interface IRibbonUiProps {
    items: ICommandBarItemProps[];
    /** Which side the commands are drawn against; defaults to `'start'`. */
    align?: 'start' | 'end';
    className?: string;
    components?: Partial<IRibbonUiComponents>;
}

/** The commands as a command bar, fitted to the width it is given. */
export const RibbonUi = (props: IRibbonUiProps) => {
    const components = { ...RibbonUiComponents, ...props.components };
    const styles = useMemo(() => getRibbonUiStyles(props.align ?? 'start'), [props.align]);
    const commandBarRef = useRef<ICommandBar>(null);
    //the command bar only re-fits on window resizes, not when its box changes size
    const observe = useResizeObserver(() => commandBarRef.current?.remeasure());

    //the first fit is measured before the row it sits in has settled
    useEffect(() => {
        const frame = requestAnimationFrame(() => commandBarRef.current?.remeasure());
        return () => cancelAnimationFrame(frame);
    }, []);

    return <div ref={element => element && observe(element)} className={getClassNames([styles.ribbon, props.className])}>
        {components.onRenderCommandBar({
            items: props.items,
            componentRef: commandBarRef,
            styles: { root: styles.commandBar, primarySet: styles.commands },
        })}
    </div>;
};
