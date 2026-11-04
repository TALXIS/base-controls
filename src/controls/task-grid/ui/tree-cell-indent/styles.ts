import { mergeStyleSets } from "@fluentui/react";
import { LEVEL_INDENT } from "../../constants";

//lines a task without children up with its siblings
const TOGGLE_WIDTH = 28;

export const getTaskGridUiTreeCellIndentStyles = (level: number, hasToggle: boolean) => mergeStyleSets({
    indent: {
        flex: '0 0 auto',
        order: 0,
        width: level * LEVEL_INDENT + (hasToggle ? 0 : TOGGLE_WIDTH),
    },
});
