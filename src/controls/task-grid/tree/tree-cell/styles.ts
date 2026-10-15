import { mergeStyleSets } from "@fluentui/react";
import { LEVEL_INDENT } from "../constants";

//as wide as the chevron, so a task without children lines up with its siblings
const TOGGLE_WIDTH = 28;

export const getTreeCellStyles = (level: number, hasToggle: boolean) => mergeStyleSets({
    indent: {
        flex: '0 0 auto',
        order: 0,
        width: level * LEVEL_INDENT + (hasToggle ? 0 : TOGGLE_WIDTH),
    },
});
