import type { Breakpoints, LayoutItem, ResponsiveLayouts } from "react-grid-layout";

export const FORM_LAYOUT_BREAKPOINTS = {
    lg: 1200,
    md: 996,
    sm: 768,
    xs: 480,
    xxs: 0,
} as const;

export type FormLayoutBreakpoint = keyof typeof FORM_LAYOUT_BREAKPOINTS;
export type FormResponsiveCols = Record<FormLayoutBreakpoint, number>;

export interface ISequentialLayoutItem {
    key: string;
    span?: number;
    height?: number;
    width?: string | number;
}

export const DEFAULT_FORM_BREAKPOINTS: Breakpoints<FormLayoutBreakpoint> = FORM_LAYOUT_BREAKPOINTS;
export const DEFAULT_COLUMN_LAYOUT_COLS: FormResponsiveCols = {
    lg: 12,
    md: 12,
    sm: 6,
    xs: 12,
    xxs: 1,
};

export const DEFAULT_STACK_LAYOUT_COLS: FormResponsiveCols = {
    lg: 1,
    md: 1,
    sm: 1,
    xs: 1,
    xxs: 1,
};

const BREAKPOINT_ORDER: FormLayoutBreakpoint[] = ["lg", "md", "sm", "xs", "xxs"];

export const buildRowLayoutCols = (columns: number): FormResponsiveCols => {
    const safeColumns = Math.max(columns, 1);

    return {
        lg: safeColumns,
        md: safeColumns,
        sm: Math.min(safeColumns, 2),
        xs: 1,
        xxs: 1,
    };
};

export const mergeResponsiveCols = (
    defaults: FormResponsiveCols,
    overrides?: Partial<FormResponsiveCols>,
): FormResponsiveCols => ({
    ...defaults,
    ...overrides,
});

export const normalizeLayoutKey = (key: React.Key | null | undefined, fallback: string): string => {
    if (key === null || key === undefined || key === "") {
        return fallback;
    }

    return String(key).replace(/^(\.\$)+/, "");
};

export const normalizeSpan = (span: number | undefined, cols: number): number => {
    if (!Number.isFinite(span) || !span || span < 1) {
        return 1;
    }

    return Math.min(Math.max(Math.round(span), 1), cols);
};

export const normalizeHeightUnits = (height: number | undefined): number => {
    if (!Number.isFinite(height) || !height || height < 1) {
        return 1;
    }

    return Math.max(Math.round(height), 1);
};

export const widthToSpan = (width: string | number | undefined, cols: number): number => {
    if (width === undefined || width === null) {
        return 1;
    }

    if (typeof width === "number") {
        return normalizeSpan(width, cols);
    }

    const trimmed = width.trim();
    if (!trimmed) {
        return 1;
    }

    if (trimmed.endsWith("%")) {
        const parsed = Number.parseFloat(trimmed.slice(0, -1));
        if (Number.isFinite(parsed)) {
            return normalizeSpan(Math.round((parsed / 100) * cols), cols);
        }
    }

    const parsed = Number.parseFloat(trimmed);
    if (Number.isFinite(parsed)) {
        return normalizeSpan(parsed, cols);
    }

    return 1;
};

export const buildSequentialResponsiveLayouts = (
    items: readonly ISequentialLayoutItem[],
    colsByBreakpoint: FormResponsiveCols,
    spanResolver: (item: ISequentialLayoutItem, cols: number) => number,
): ResponsiveLayouts<FormLayoutBreakpoint> => {
    return BREAKPOINT_ORDER.reduce<ResponsiveLayouts<FormLayoutBreakpoint>>((layouts, breakpoint) => {
        const cols = colsByBreakpoint[breakpoint];
        const layout: LayoutItem[] = [];

        let currentX = 0;
        let currentY = 0;
        let currentRowHeight = 1;

        for (const item of items) {
            const width = normalizeSpan(spanResolver(item, cols), cols);
            const height = normalizeHeightUnits(item.height);

            if (currentX > 0 && currentX + width > cols) {
                currentY += currentRowHeight;
                currentX = 0;
                currentRowHeight = 1;
            }

            layout.push({
                i: item.key,
                x: currentX,
                y: currentY,
                w: width,
                h: height,
                static: true,
            });

            currentX += width;
            currentRowHeight = Math.max(currentRowHeight, height);

            if (currentX >= cols) {
                currentY += currentRowHeight;
                currentX = 0;
                currentRowHeight = 1;
            }
        }

        layouts[breakpoint] = layout;
        return layouts;
    }, {
        lg: [],
        md: [],
        sm: [],
        xs: [],
        xxs: [],
    });
};
