import { mergeStyleSets } from "@fluentui/react";
import { INDENT_STEP_WIDTH } from "../constants";

export const getTreeCellStyles = (indentSteps: number) => mergeStyleSets({
    indent: {
        order: 0,
        flex: '0 0 auto',
        width: indentSteps * INDENT_STEP_WIDTH,
    },
});
