import { useMemo } from "react";
import { CommandBar, ICommandBarProps } from "@fluentui/react";
import { getClassNames, IAlignment } from "@utils";
import { getCellCommandsStyles } from "./styles";

export interface ICellCommandsProps extends ICommandBarProps {
    /** Where the buttons sit in the width the bar takes. Left, unless told otherwise. */
    alignment?: IAlignment;
}

/** The commands a cell offers, drawn to fit the row it is in. Nothing where there are none to draw. */
export const Commands = (props: ICellCommandsProps) => {
    //`alignment` is ours rather than the command bar's, so it is taken out before the rest is spread on
    const { alignment = 'left', ...commandBarProps } = props;
    const styles = useMemo(() => getCellCommandsStyles(alignment), [alignment]);

    if (props.items.length === 0) {
        return null;
    }

    return <CommandBar
        {...commandBarProps}
        className={getClassNames([styles.commandsRoot, props.className])} />;
};
