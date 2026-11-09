import { useTheme } from "@theme";
import type { GanttStatic } from "dhtmlx-gantt";
import { useGantt, useGanttModule } from "../../../../context";
import type { IMarker } from "../../Markers";
import { MarkerUiChip, MarkerUiColumn, MarkerUiLine, MarkerUiScale, MarkerUiTrack } from "../../ui";
import { MarkerContext } from "./context";

export interface IMarkerProps {
    marker: IMarker;
    chart: GanttStatic;
    /** Where the marker's date is on the timeline. */
    left: number;
    /** The room up to the next marker; none for the last one. */
    maxChipWidth?: number;
}

/** One marker: its line down the timeline and its chip on the scale. */
export const Marker = (props: IMarkerProps) => {
    const { marker, chart, left } = props;
    const gantt = useGantt();
    const components = useGanttModule('markers').getComponents();
    const theme = useTheme();
    const date = marker.date.toDate();
    const scaleHeight = chart.config.scale_height;
    const color = marker.color ?? theme.palette.themePrimary;
    const title = `${marker.text} · ${gantt.getTaskRuntime().getProvider().getFormatting().formatDateShort(date)}`;

    return <MarkerContext.Provider value={{ marker, left }}>
        <MarkerUiColumn left={left} components={components.column}>
            <MarkerUiTrack scaleHeight={scaleHeight} components={components.track}>
                <MarkerUiLine color={color} lineStyle={marker.lineStyle} components={components.line} />
            </MarkerUiTrack>
            <MarkerUiScale scaleHeight={scaleHeight} components={components.scale}>
                <MarkerUiChip text={marker.text} title={title} color={color} maxWidth={props.maxChipWidth} components={components.chip} />
            </MarkerUiScale>
        </MarkerUiColumn>
    </MarkerContext.Provider>;
};
