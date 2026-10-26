import { GanttMarkerUiLayer } from './layer';
import { GanttMarkerUiColumn } from './column';
import { GanttMarkerUiTrack } from './track';
import { GanttMarkerUiScale } from './scale';
import { GanttMarkerUiLine } from './line';
import { GanttMarkerUiChip } from './chip';

export * from './layer';
export * from './column';
export * from './track';
export * from './scale';
export * from './line';
export * from './chip';

/** What draws the markers, and nothing that knows which marker. */
export interface IGanttMarkerUi {
    Layer: typeof GanttMarkerUiLayer;
    Column: typeof GanttMarkerUiColumn;
    Track: typeof GanttMarkerUiTrack;
    Scale: typeof GanttMarkerUiScale;
    Line: typeof GanttMarkerUiLine;
    Chip: typeof GanttMarkerUiChip;
}

export const GanttMarkerUi: IGanttMarkerUi = {
    Layer: GanttMarkerUiLayer,
    Column: GanttMarkerUiColumn,
    Track: GanttMarkerUiTrack,
    Scale: GanttMarkerUiScale,
    Line: GanttMarkerUiLine,
    Chip: GanttMarkerUiChip,
};
