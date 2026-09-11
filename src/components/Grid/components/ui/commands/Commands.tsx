import { useMemo } from "react";
import { CommandBar, concatStyleSets, ICommandBarProps } from "@fluentui/react";
import { getClassNames } from "@utils";
import { getCellCommandsStyles } from "./styles";

export interface ICellCommandsProps extends ICommandBarProps { }

/** The commands a cell offers, drawn to fit the row it is in. Nothing where there are none to draw. */
export const Commands = (props: ICellCommandsProps) => {
    const styles = useMemo(() => getCellCommandsStyles(), []);

    if (props.items.length === 0) {
        return null;
    }

    //the caller's last in both, so a column can still say otherwise
    return <CommandBar {...props} />;
};
