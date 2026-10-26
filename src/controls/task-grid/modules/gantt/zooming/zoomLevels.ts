import type { GanttStatic, ZoomLevel } from "dhtmlx-gantt";

const NARROWEST_COLUMN_WIDTH = 60;
const WIDEST_COLUMN_WIDTH = 120;
const COLUMN_WIDTH_COUNT = 11;

/** The column widths each level steps through, spaced by a constant ratio. */
export const getColumnWidths = (): number[] => {
    return Array.from({ length: COLUMN_WIDTH_COUNT }, (_unused, index) =>
        Math.round(NARROWEST_COLUMN_WIDTH * Math.pow(WIDEST_COLUMN_WIDTH / NARROWEST_COLUMN_WIDTH, index / (COLUMN_WIDTH_COUNT - 1))));
};

//no `min_column_width` on a level: applying one would replace the width the zoom just set
/** The zoom levels, coarsest first. */
export const getZoomLevels = (gantt: GanttStatic, locale: string): ZoomLevel[] => {
    const shortMonth = (date: Date) => new Intl.DateTimeFormat(locale, { month: 'short' }).format(date);
    const format = (pattern: string) => gantt.date.date_to_str(pattern) as (date: Date) => string;
    const span = (days: number, startPattern: string, endPattern: string) => (date: Date) =>
        `${format(startPattern)(date)} – ${format(endPattern)(gantt.date.add(date, days, 'day'))}`;
    const dayHeader = { unit: 'day', step: 1, format: '%D %d/%m %Y' };

    return [
        { name: 'year-quarter', scales: [{ unit: 'year', step: 1, format: '%Y' }, { unit: 'quarter', step: 1, format: (date: Date) => `Q${Math.floor(date.getMonth() / 3) + 1}` }] },
        { name: 'year-2month', scales: [{ unit: 'year', step: 1, format: '%Y' }, { unit: 'month', step: 2, format: (date: Date) => `${shortMonth(date)} – ${shortMonth(gantt.date.add(date, 1, 'month'))}` }] },
        { name: 'year-month', scales: [{ unit: 'year', step: 1, format: '%Y' }, { unit: 'month', step: 1, format: shortMonth }] },
        { name: '8week-2week', scales: [{ unit: 'week', step: 8, format: span(55, '%d %M', '%d %M %Y') }, { unit: 'week', step: 2, format: span(13, '%j.%n', '%j.%n') }] },
        { name: '4week-week', scales: [{ unit: 'week', step: 4, format: span(27, '%d %M', '%d %M %Y') }, { unit: 'week', step: 1, format: span(6, '%d', '%d') }] },
        { name: '4week-4day', scales: [{ unit: 'week', step: 4, format: span(27, '%d %M', '%d %M %Y') }, { unit: 'day', step: 4, format: span(3, '%j', '%j') }] },
        { name: '2week-2day', scales: [{ unit: 'day', step: 14, format: span(13, '%d %M', '%d %M %Y') }, { unit: 'day', step: 2, format: span(1, '%j', '%j') }] },
        { name: 'week-day', scales: [{ unit: 'week', step: 1, format: span(6, '%d %M', '%d %M %Y') }, { unit: 'day', step: 1, format: '%d %M' }] },
        { name: 'day-12h', scales: [dayHeader, { unit: 'hour', step: 12, format: '%H:%i' }] },
        { name: 'day-6h', scales: [dayHeader, { unit: 'hour', step: 6, format: '%H:%i' }] },
        { name: 'day-3h', scales: [dayHeader, { unit: 'hour', step: 3, format: '%H:%i' }] },
        { name: 'day-2h', scales: [dayHeader, { unit: 'hour', step: 2, format: '%H:%i' }] },
        { name: 'day-hour', scales: [dayHeader, { unit: 'hour', step: 1, format: '%H:%i' }] },
    ];
};
