import { useMemo } from 'react';
import { useTheme } from '@fluentui/react';
import { useTaskDataProvider } from '@components/TaskGrid/context';
import { Grid } from '@components/TaskGrid/components/grid';
import type { IDatasetControlProps } from '@components/DatasetControl/interfaces';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { getGanttViewStyles } from './styles';
import { GanttTimeline } from '../gantt-timeline';
import { useGanttViewState } from '../context';

const DEFAULT_GANTT_WIDTH_PERCENTAGE = 70;
const MIN_GRID_WIDTH_PERCENTAGE = 0;
const MIN_FLAT_LIST_GRID_WIDTH_PERCENTAGE = 0;

/**
 * What the grid's control component is handed. The Gantt renders the grid itself, so it passes these
 * straight on to it.
 */
export type IGanttViewProps = Parameters<IDatasetControlProps['onGetControlComponent']>[0];

/**
 * The Gantt view: the task grid on the left, the timeline on the right, resizable between them.
 *
 * Rendered in place of the plain grid whenever the module is registered. The panel widths live on the
 * current view through the module's provider, so a remount opens the way the user left it.
 */
export const GanttView = (props: IGanttViewProps) => {
    const viewState = useGanttViewState();
    const provider = useTaskDataProvider();
    const theme = useTheme();
    const styles = useMemo(() => getGanttViewStyles(theme), [theme]);

    const isFlatList = provider.isFlatListEnabled();
    const minGridWidthPercentage = isFlatList ? MIN_FLAT_LIST_GRID_WIDTH_PERCENTAGE : MIN_GRID_WIDTH_PERCENTAGE;
    const ganttWidthPercentage = viewState.getGanttWidth() ?? DEFAULT_GANTT_WIDTH_PERCENTAGE;
    const gridWidthPercentage = 100 - ganttWidthPercentage;

    const onLayout = (layout: number[]) => {
        viewState.setGanttWidth(layout[1]);
    };

    return (
        <div className={styles.root}>
            <PanelGroup direction="horizontal" onLayout={onLayout}>
                <Panel defaultSize={gridWidthPercentage} minSize={minGridWidthPercentage}>
                    <Grid {...props} />
                </Panel>
                <PanelResizeHandle className={styles.resizeHandle} />
                <Panel defaultSize={ganttWidthPercentage}>
                    <GanttTimeline />
                </Panel>
            </PanelGroup>
        </div>
    );
};
