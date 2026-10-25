import { ReactNode, useEffect, useMemo } from "react";
import { useTheme } from "@fluentui/react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useControlStateStore } from "@controls/dataset-control/components/adapters/root";
import { useTaskRuntime } from "../../../../dataset-control/context";
import { GridGanttSplitSync } from "./GridGanttSplitSync";
import { getGridGanttSplitStyles } from "./styles";

const GANTT_SIZE_STATE_KEY = 'ganttSize';
const DEFAULT_GANTT_SIZE = 60;

export interface IGridGanttSplitProps {
    /** The grid first, then the Gantt. */
    children: [ReactNode, ReactNode];
    /** Where the Gantt's share of the width is kept per view; read once, at mount. */
    stateKey?: string;
    /** The Gantt's share of the width, in percent, until the user resizes it. */
    defaultGanttSize?: number;
}

/** The grid and the Gantt side by side, resizable between them. */
export const GridGanttSplit = (props: IGridGanttSplitProps) => {
    const taskRuntime = useTaskRuntime();
    const state = useControlStateStore(props.stateKey);
    const theme = useTheme();
    const styles = useMemo(() => getGridGanttSplitStyles(theme), [theme]);
    const splitSync = useMemo(() => new GridGanttSplitSync(taskRuntime), []);
    useEffect(() => () => splitSync.destroy(), []);
    const ganttSize = state.get<number>(GANTT_SIZE_STATE_KEY) ?? props.defaultGanttSize ?? DEFAULT_GANTT_SIZE;

    return <PanelGroup direction="horizontal" className={styles.root} onLayout={sizes => state.set(GANTT_SIZE_STATE_KEY, sizes[1])}>
        <Panel defaultSize={100 - ganttSize} minSize={0} className={styles.grid}>{props.children[0]}</Panel>
        <PanelResizeHandle className={styles.handle} />
        <Panel defaultSize={ganttSize} minSize={0}>{props.children[1]}</Panel>
    </PanelGroup>;
};
