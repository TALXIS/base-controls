import { useTheme } from "@fluentui/react";
import type { GanttStatic } from "dhtmlx-gantt";
import { useGantt, useGanttModule } from "../../../../../context";
import type { IGanttMarker } from "../../../GanttMarkers";
import { GanttMarkerUiChip, GanttMarkerUiColumn, GanttMarkerUiLine, GanttMarkerUiScale, GanttMarkerUiTrack } from "../../ui";
import { GanttMarkerContext } from "./context";

export interface IGanttMarkerProps {
    marker: IGanttMarker;
    chart: GanttStatic;
}

/** One marker: its line down the timeline and its chip on the scale. */
export const GanttMarker = (props: IGanttMarkerProps) => {
    const { marker, chart } = props;
    const gantt = useGantt();
    const components = useGanttModule('markers').getComponents();
    const theme = useTheme();
    const date = marker.date.toDate();
    const left = chart.posFromDate(date);
    const scaleHeight = chart.config.scale_height;
    const color = marker.color ?? theme.palette.themePrimary;
    const title = gantt.getTaskRuntime().getProvider().getFormatting().formatDateShort(date);

    return <GanttMarkerContext.Provider value={{ marker, left }}>
        <GanttMarkerUiColumn left={left} components={components.column}>
            <GanttMarkerUiTrack scaleHeight={scaleHeight} components={components.track}>
                <GanttMarkerUiLine color={color} components={components.line} />
            </GanttMarkerUiTrack>
            <GanttMarkerUiScale scaleHeight={scaleHeight} components={components.scale}>
                <GanttMarkerUiChip text={marker.text} title={title} color={color} components={components.chip} />
            </GanttMarkerUiScale>
        </GanttMarkerUiColumn>
    </GanttMarkerContext.Provider>;
};
