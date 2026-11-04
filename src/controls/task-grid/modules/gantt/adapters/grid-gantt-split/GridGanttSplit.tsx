import { ReactNode, useEffect, useMemo } from "react";
import { useControlStateStore } from "../../../../../dataset-control/adapters/root";
import { useTaskRuntime } from "../../../../adapters/root/context";
import { GridGanttSplitSync } from "../../split";
import { GridGanttUiSplit, IGridGanttUiSplitComponents } from "../../ui/grid-gantt-split";

const DEFAULT_GANTT_SIZE = 60;

export interface IGridGanttSplitProps {
    /** The grid first, then the Gantt. */
    children: [ReactNode, ReactNode];
    /** Where the Gantt's share of the width is kept per view, read once at mount. */
    stateKey?: string;
    /** The Gantt's share of the width, in percent, until the user resizes it. */
    defaultGanttSize?: number;
    components?: Partial<IGridGanttUiSplitComponents>;
}

/** The grid and the Gantt side by side, resizable between them. */
export const GridGanttSplit = (props: IGridGanttSplitProps) => {
    const taskRuntime = useTaskRuntime();
    const state = useControlStateStore(props.stateKey);
    const splitSync = useMemo(() => new GridGanttSplitSync({ taskRuntime, state }), []);
    useEffect(() => () => splitSync.destroy(), []);

    return <GridGanttUiSplit
        grid={props.children[0]}
        gantt={props.children[1]}
        ganttSize={splitSync.getGanttSize(props.defaultGanttSize ?? DEFAULT_GANTT_SIZE)}
        onGanttSizeChanged={size => splitSync.setGanttSize(size)}
        components={props.components} />;
};
