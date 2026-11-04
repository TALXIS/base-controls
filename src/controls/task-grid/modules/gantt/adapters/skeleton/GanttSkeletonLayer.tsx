import { useEffect, useState } from "react";
import type { IGrid } from "../../../../../grid";
import { useGantt } from "../../context";
import { GanttUiSkeleton, IGanttUiSkeletonComponents } from "../../ui/skeleton";

export interface IGanttSkeletonLayerProps {
    components?: Partial<IGanttUiSkeletonComponents>;
}

/** Covers the chart with the skeleton until it is drawn. */
export const GanttSkeletonLayer = (props: IGanttSkeletonLayerProps) => {
    const gantt = useGantt();
    const [grid, setGrid] = useState<IGrid>();

    useEffect(() => gantt.getTaskRuntime().services.get('datasetControl').parts.observe('grid', grid => grid.services.observe('gridApi', () => {
        setGrid(grid);
        return () => setGrid(undefined);
    })), []);

    if (gantt.services.find('chart')) {
        return null;
    }
    return <GanttUiSkeleton components={props.components} rowHeight={grid?.services.get('settings').getDefaultRowHeight()} scaleHeight={grid?.services.get('viewport').getHeaderHeight() || undefined} />;
};
