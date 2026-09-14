import { useMemo, useRef } from "react";
import { CommandBar, concatStyleSets, ICommandBar, ICommandBarProps } from "@fluentui/react";
import { useResizeObserver } from "@legacy";
import { getClassNames, IAlignment } from "@utils";
import { getCellCommandsStyles } from "./styles";

export interface ICellCommandsProps extends ICommandBarProps {
    /** Where the buttons sit in the width the bar takes. Left, unless told otherwise. */
    alignment?: IAlignment;
}

/** The commands a cell offers, drawn to fit the row it is in. Nothing where there are none to draw. */
export const Commands = (props: ICellCommandsProps) => {
    const { alignment = 'left', className, ...commandBarProps } = props;
    const styles = useMemo(() => getCellCommandsStyles(alignment), [alignment]);
    const commandBarRef = useRef<ICommandBar>(null);
    const observe = useResizeObserver(() => commandBarRef.current?.remeasure());

    if (props.items.length === 0) {
        return null;
    }

    return <div ref={element => element && observe(element)} className={getClassNames([styles.commandsRoot, className])}>
        <CommandBar
            {...commandBarProps}
            componentRef={commandBarRef}
            className={styles.commandBar}
            styles={concatStyleSets(styles.commandBarStyles, props.styles)} />
    </div>;
};
