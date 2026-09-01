import { ZoomConfig } from "gantt-trial";
import { GANTT_TASK_CONTAINER_CLASS } from "../classNames";
export class ZoomingConfig {
    public static readonly scrollZoomMinColumnWidth = 60;
    public static readonly scrollZoomMaxColumnWidth = 120;
    public static readonly scrollZoomWidthStep = 6;

    public static getScrollZoomConfig(gantt: any, locale: string): ZoomConfig {
        const shortMonth = (date: Date) =>
            new Intl.DateTimeFormat(locale, { month: "short" }).format(date);
        const longMonth = (date: Date) =>
            new Intl.DateTimeFormat(locale, { month: "long" }).format(date);
        const fmt = (pattern: string) => gantt.date.date_to_str(pattern);

        return {
            minColumnWidth: ZoomingConfig.scrollZoomMinColumnWidth,
            maxColumnWidth: ZoomingConfig.scrollZoomMaxColumnWidth,
            widthStep: ZoomingConfig.scrollZoomWidthStep,
            levels: [
                // L0: year | quarter (91 d) — most zoomed out
                // boundary → L1: 120/91 px/d → 60/30 px/d = 1.52×
                {
                    name: "year-quarter",
                    scale_height: 43,
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
                // L1: year | month (30 d)
                // boundary → L2: 120/30 → 60/14 = 1.07×
                {
                    name: "year-month",
                    scale_height: 43,
                    scales: [
                        { unit: "year", step: 1, format: "%Y" },
                        { unit: "month", step: 1, format: shortMonth },
                    ],
                },
                // L2: 8-week top | 2-week sub — 4 sub-cols, always aligned
                {
                    name: "8week-2week",
                    scale_height: 43,
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
                    scale_height: 43,
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
                // L4: 2-week top | 2-day sub — 7 sub-cols, always aligned (14÷2=7)
                {
                    name: "2week-2day",
                    scale_height: 43,
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
                    scale_height: 43,
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
                    scale_height: 43,
                    scales: [
                        { unit: "day", step: 1, format: "%D %d/%m %Y" },
                        { unit: "hour", step: 12, format: "%H:%i" },
                    ],
                },
                // L7: day | 6 h  (10–20 px/hr)
                // boundary → L8: 20 px/hr → 30 px/hr = 1.50×
                {
                    name: "day-6h",
                    scale_height: 43,
                    scales: [
                        { unit: "day", step: 1, format: "%D %d/%m %Y" },
                        { unit: "hour", step: 6, format: "%H:%i" },
                    ],
                },
                // L8: day | 2 h  (30–60 px/hr)
                // boundary → L9: 60 px/hr → 60 px/hr = 1.0×
                {
                    name: "day-2h",
                    scale_height: 43,
                    scales: [
                        { unit: "day", step: 1, format: "%D %d/%m %Y" },
                        { unit: "hour", step: 2, format: "%H:%i" },
                    ],
                },
                // L9: day | 1 h  (60–120 px/hr) — most zoomed in
                {
                    name: "day-hour",
                    scale_height: 43,
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
