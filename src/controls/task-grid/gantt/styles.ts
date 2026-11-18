import { mergeStyleSets } from "@fluentui/react";

export const getTaskGanttStyles = () => mergeStyleSets({
    //the runtime's box sits between the split's pane and the chart
    runtime: {
        height: '100%',
    },
});
