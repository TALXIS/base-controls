import { ZoomConfig } from "gantt-trial";
import { GANTT_TASK_CONTAINER_CLASS } from "../classNames";
export class ZoomingConfig {
    public static readonly scrollZoomMinColumnWidth = 60;
    public static readonly scrollZoomMaxColumnWidth = 120;
    private static readonly _columnWidthCount = 11;

    /**
     * Every column width a level steps through, narrowest first. What the zoom ladder is built from.
     *
     * Spaced by ratio rather than by pixels: a zoom step is a ratio, so a fixed number of pixels is a
     * tenth of a step at the narrow end of a level and a twentieth at the wide end. Every step here is
     * the same 7%.
     */
    public static getColumnWidths(): number[] {
        const { scrollZoomMinColumnWidth: narrowest, scrollZoomMaxColumnWidth: widest, _columnWidthCount: count } = ZoomingConfig;
        return Array.from({ length: count }, (_unused, index) =>
            Math.round(narrowest * Math.pow(widest / narrowest, index / (count - 1))));
    }

    /**
     * Everything the chart's zoom extension is told, levels first: coarsest at index 0, finest last.
     *
     * Two things must stay out of it. `startDate`/`endDate` arm the extension's own range restoration,
     * which would put the range back on every zoom step and fight the timeline's budget. And no level may
     * carry `min_column_width`: applying a level mixes it into the chart's config, so a level's own width
     * would silently replace the one the zoom just set.
     */
    public static getScrollZoomConfig(gantt: any, locale: string): ZoomConfig {
        const shortMonth = (date: Date) =>
            new Intl.DateTimeFormat(locale, { month: "short" }).format(date);
        const longMonth = (date: Date) =>
            new Intl.DateTimeFormat(locale, { month: "long" }).format(date);
        const fmt = (pattern: string) => gantt.date.date_to_str(pattern);

        return {
            minColumnWidth: ZoomingConfig.scrollZoomMinColumnWidth,
            maxColumnWidth: ZoomingConfig.scrollZoomMaxColumnWidth,
            levels: [
                // L0: year | quarter (91 d) — most zoomed out
                // boundary → L1: 120/91 px/d → 60/30 px/d = 1.52×
                {
                    name: "year-quarter",
                    scales: [
                        { unit: "year", step: 1, format: "%Y" },
                        {
                            unit: "quarter",
                            step: 1,
                            format: (date: Date) =>
                                `Q${Math.floor(date.getMonth() / 3) + 1}`,
                        },
                    ],
                },
                // L1: year | 2 month (61 d) — halves the step down from quarters, which is 3× on its own
                {
                    name: "year-2month",
                    scales: [
                        { unit: "year", step: 1, format: "%Y" },
                        {
                            unit: "month",
                            step: 2,
                            format: (date: Date) =>
                                `${shortMonth(date)} – ${shortMonth(gantt.date.add(date, 1, "month"))}`,
                        },
                    ],
                },
                // L2: year | month (30 d)
                // boundary → L3: 120/30 → 60/14 = 1.07×
                {
                    name: "year-month",
                    scales: [
                        { unit: "year", step: 1, format: "%Y" },
                        { unit: "month", step: 1, format: shortMonth },
                    ],
                },
                // L2: 8-week top | 2-week sub — 4 sub-cols, always aligned
                {
                    name: "8week-2week",
                    scales: [
                        {
                            unit: "week",
                            step: 8,
                            format: (date: Date) => {
                                const end = gantt.date.add(date, 55, "day");
                                    return `${fmt("%d %M")(date)} – ${fmt("%d %M %Y")(end)}`;
                            },
                        },
                        {
                            unit: "week",
                            step: 2,
                            format: (date: Date) => {
                                const end = gantt.date.add(date, 13, "day");
                                    return `${fmt("%j.%n")(date)}-${fmt("%j.%n")(end)}`;
                            },
                        },
                    ],
                },
                // L3: 4-week top | 1-week sub — 4 sub-cols, always aligned
                {
                    name: "4week-week",
                    scales: [
                        {
                            unit: "week",
                            step: 4,
                            format: (date: Date) => {
                                const end = gantt.date.add(date, 27, "day");
                                return `${fmt("%d %M")(date)} – ${fmt("%d %M %Y")(end)}`;
                            },
                        },
                        {
                            unit: "week",
                            step: 1,
                            format: (date: Date) => {
                                const end = gantt.date.add(date, 6, "day");
                                return `${fmt("%d")(date)}–${fmt("%d")(end)}`;
                            },
                        },
                    ],
                },
                // 4-week top | 4-day sub — 7 sub-cols, always aligned (28÷4=7); halves the step down from
                // weeks, which is 3.5× on its own
                {
                    name: "4week-4day",
                    scales: [
                        {
                            unit: "week",
                            step: 4,
                            format: (date: Date) => {
                                const end = gantt.date.add(date, 27, "day");
                                return `${fmt("%d %M")(date)} – ${fmt("%d %M %Y")(end)}`;
                            },
                        },
                        {
                            unit: "day",
                            step: 4,
                            format: (date: Date) => {
                                const end = gantt.date.add(date, 3, "day");
                                return `${fmt("%j")(date)}-${fmt("%j")(end)}`;
                            },
                        },
                    ],
                },
                // 2-week top | 2-day sub — 7 sub-cols, always aligned (14÷2=7)
                {
                    name: "2week-2day",
                    scales: [
                        {
                            unit: "day",
                            step: 14,
                            format: (date: Date) => {
                                const end = gantt.date.add(date, 13, "day");
                                return `${fmt("%d %M")(date)} – ${fmt("%d %M %Y")(end)}`;
                            },
                        },
                        {
                            unit: "day",
                            step: 2,
                            format: (date: Date) => {
                                const end = gantt.date.add(date, 1, "day");
                                return `${fmt("%j")(date)}-${fmt("%j")(end)}`;
                            },
                        },
                    ],
                },
                // L5: week | day (1 d)
                // boundary → L6: 120 px/d → 5 px/hr (12h col @60px) = 1.0×
                {
                    name: "week-day",
                    scales: [
                        {
                            unit: "week",
                            step: 1,
                            format: (date: Date) => {
                                const end = gantt.date.add(date, 6, "day");
                                return `${fmt("%d %M")(date)} – ${fmt("%d %M %Y")(end)}`;
                            },
                        },
                        { unit: "day", step: 1, format: "%d %M" },
                    ],
                },
                // L6: day | 12 h  (5–10 px/hr)
                // boundary → L7: 10 px/hr → 10 px/hr = 1.0×
                {
                    name: "day-12h",
                    scales: [
                        { unit: "day", step: 1, format: "%D %d/%m %Y" },
                        { unit: "hour", step: 12, format: "%H:%i" },
                    ],
                },
                // L7: day | 6 h  (10–20 px/hr)
                // boundary → L8: 20 px/hr → 30 px/hr = 1.50×
                {
                    name: "day-6h",
                    scales: [
                        { unit: "day", step: 1, format: "%D %d/%m %Y" },
                        { unit: "hour", step: 6, format: "%H:%i" },
                    ],
                },
                // day | 3 h — halves the step down from 6 h, which is 3× on its own (24÷3=8, aligned)
                {
                    name: "day-3h",
                    scales: [
                        { unit: "day", step: 1, format: "%D %d/%m %Y" },
                        { unit: "hour", step: 3, format: "%H:%i" },
                    ],
                },
                // day | 2 h  (30–60 px/hr)
                {
                    name: "day-2h",
                    scales: [
                        { unit: "day", step: 1, format: "%D %d/%m %Y" },
                        { unit: "hour", step: 2, format: "%H:%i" },
                    ],
                },
                // L9: day | 1 h  (60–120 px/hr) — most zoomed in
                {
                    name: "day-hour",
                    scales: [
                        { unit: "day", step: 1, format: "%D %d/%m %Y" },
                        { unit: "hour", step: 1, format: "%H:%i" },
                    ],
                },
            ],
            useKey: "ctrlKey",
            trigger: "wheel",
            element: () => gantt.$root.querySelector(`.${GANTT_TASK_CONTAINER_CLASS}`)!,
        };
    }
}
