import { useMemo, useRef } from "react";
import { concatStyleSets, ICommandBar, ICommandBarProps } from "@fluentui/react";
import { useResizeObserver } from "@legacy";
import { CommandBar } from "@ui";
import { getClassNames, IAlignment } from "@utils";
import { getCellCommandsStyles } from "./styles";

export interface ICellUiCommandsProps extends ICommandBarProps {
    /** Where the buttons sit in the width the bar takes. */
    alignment?: IAlignment;
}

/** The commands a cell offers, drawn to fit the row it is in. */
export const CellUiCommands = (props: ICellUiCommandsProps) => {
    const { alignment = 'left', className, items, overflowItems, ...commandBarProps } = props;
    const styles = useMemo(() => getCellCommandsStyles(alignment), [alignment]);
    const commandBarRef = useRef<ICommandBar>(null);
    const observe = useResizeObserver(() => commandBarRef.current?.remeasure());

    if (items.length === 0 && !overflowItems?.length) {
        return null;
    }

    return <div ref={element => element && observe(element)} className={getClassNames([styles.commandsRoot, className])}>
        <CommandBar
            {...commandBarProps}
            items={items}
            overflowItems={overflowItems}
            componentRef={commandBarRef}
            className={styles.commandBar}
            styles={concatStyleSets(styles.commandBarStyles, props.styles)} />
    </div>;
};
