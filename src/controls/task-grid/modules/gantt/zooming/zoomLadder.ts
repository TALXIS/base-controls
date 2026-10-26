import type { GanttStatic, ZoomLevel } from "dhtmlx-gantt";
import { countColumnsInRange, getFinestScale, getUnitDays } from "./zoomScales";

/** One position on the zoom ladder. */
export interface IGanttZoomStop {
    levelIndex: number;
    columnWidth: number;
    pixelsPerDay: number;
}

const FIT_VIEWPORT_MARGIN = 0.1;

/** Every zoom position, most zoomed out first. */
export const getZoomStops = (levels: ZoomLevel[], columnWidths: number[]): IGanttZoomStop[] => {
    const stops: IGanttZoomStop[] = [];
    let coarsestSoFar = 0;
    levels.forEach((level, levelIndex) => {
        const scale = getFinestScale(level);
        if (!scale) {
            return;
        }
        const unitDays = getUnitDays(scale);
        for (const columnWidth of columnWidths) {
            const pixelsPerDay = columnWidth / unitDays;
            //overlapping levels would otherwise zoom out on the way in
            if (pixelsPerDay < coarsestSoFar) {
                continue;
            }
            stops.push({ levelIndex, columnWidth, pixelsPerDay });
            coarsestSoFar = pixelsPerDay;
        }
    });
    return stops;
};

export const clampStopIndex = (stopIndex: number, stopCount: number): number => {
    return Math.max(0, Math.min(stopCount - 1, Math.round(stopIndex)));
};

/** The stop nearest to a level and column width. */
export const findStopIndex = (stops: IGanttZoomStop[], levelIndex: number, columnWidth: number): number => {
    let bestIndex = 0;
    let bestLevelDistance = Number.POSITIVE_INFINITY;
    let bestWidthDistance = Number.POSITIVE_INFINITY;
    stops.forEach((stop, index) => {
        const levelDistance = Math.abs(stop.levelIndex - levelIndex);
        const widthDistance = Math.abs(stop.columnWidth - columnWidth);
        if (levelDistance < bestLevelDistance || (levelDistance === bestLevelDistance && widthDistance < bestWidthDistance)) {
            bestLevelDistance = levelDistance;
            bestWidthDistance = widthDistance;
            bestIndex = index;
        }
    });
    return bestIndex;
};

/** The stop a saved zoom means, matched by its scale since the usable levels differ per view. */
export const findStopIndexForScale = (stops: IGanttZoomStop[], levels: ZoomLevel[], zoom: { unit: string; step: number; columnWidth: number }): number | undefined => {
    const levelIndex = levels.findIndex(level => {
        const scale = getFinestScale(level);
        return scale?.unit === zoom.unit && scale.step === zoom.step;
    });
    return levelIndex < 0 ? undefined : findStopIndex(stops, levelIndex, zoom.columnWidth);
};

/** The most zoomed-in stop at which the range fits the viewport. */
export const findFitStopIndex = (gantt: GanttStatic, stops: IGanttZoomStop[], levels: ZoomLevel[], range: { startDate: Date; endDate: Date }, viewportWidth: number): number => {
    const usableWidth = viewportWidth * (1 - FIT_VIEWPORT_MARGIN);
    for (let stopIndex = stops.length - 1; stopIndex >= 0; stopIndex--) {
        const { levelIndex, columnWidth } = stops[stopIndex];
        const scale = getFinestScale(levels[levelIndex]);
        if (scale && countColumnsInRange(gantt, range.startDate, range.endDate, scale) * columnWidth <= usableWidth) {
            return stopIndex;
        }
    }
    return 0;
};
