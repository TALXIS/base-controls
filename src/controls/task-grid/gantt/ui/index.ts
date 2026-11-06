import { GanttUiChart } from './chart/GanttUiChart';
import { GanttUiOverlay } from './overlay/GanttUiOverlay';
import { GanttUiSkeleton } from './skeleton/GanttUiSkeleton';
import { GanttUiSkeletonShimmer } from './skeleton-shimmer/GanttUiSkeletonShimmer';
import { GanttUiZoomSlider } from './zoom-slider/GanttUiZoomSlider';
import { GridGanttUiSplit } from './grid-gantt-split/GridGanttUiSplit';
import { TooltipUiCallout, TooltipUiDateRange, TooltipUiFieldRow, TooltipUiFieldRows, TooltipUiHeader, TooltipUiProgress } from './tooltip';

/** The Gantt's parts as plain UI, with no runtime behind them. */
export interface IGanttUi {
    /** The area the chart is drawn into. */
    Chart: typeof GanttUiChart;
    /** A translucent cover that blocks the chart beneath it. */
    Overlay: typeof GanttUiOverlay;
    /** What stands in for the Gantt while it loads. */
    Skeleton: typeof GanttUiSkeleton;
    /** A shimmering placeholder shaped like a time scale over rows of bars. */
    SkeletonShimmer: typeof GanttUiSkeletonShimmer;
    /** The zoom slider. */
    ZoomSlider: typeof GanttUiZoomSlider;
    /** The grid's and the Gantt's panes side by side, resizable between them. */
    Split: typeof GridGanttUiSplit;
    /** The callout a tooltip is drawn in. */
    TooltipCallout: typeof TooltipUiCallout;
    /** A tooltip's title, with the status beside it. */
    TooltipHeader: typeof TooltipUiHeader;
    /** A tooltip's field rows, one under another. */
    TooltipFieldRows: typeof TooltipUiFieldRows;
    /** One field: its icon, its label and its value. */
    TooltipFieldRow: typeof TooltipUiFieldRow;
    /** When something runs, with how long it runs after it. */
    TooltipDateRange: typeof TooltipUiDateRange;
    /** A bar filled to the progress, with the progress after it. */
    TooltipProgress: typeof TooltipUiProgress;
}

/** Every part of the Gantt as plain UI, with no runtime behind it. */
export const GanttUi: IGanttUi = {
    Chart: GanttUiChart,
    Overlay: GanttUiOverlay,
    Skeleton: GanttUiSkeleton,
    SkeletonShimmer: GanttUiSkeletonShimmer,
    ZoomSlider: GanttUiZoomSlider,
    Split: GridGanttUiSplit,
    TooltipCallout: TooltipUiCallout,
    TooltipHeader: TooltipUiHeader,
    TooltipFieldRows: TooltipUiFieldRows,
    TooltipFieldRow: TooltipUiFieldRow,
    TooltipDateRange: TooltipUiDateRange,
    TooltipProgress: TooltipUiProgress,
};
