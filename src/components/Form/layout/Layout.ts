export enum WIDTH_BREAKPOINT {
    lg = 1200,
    md = 996,
    sm = 768,
    xs = 480,
}

export interface ILayoutBreakpoints {
    'lg': number;
    'md': number;
    'sm': number;
    'xs': number;
}

export class Layout {

    public static getNumberOfColumnsForWidth(width: number, breakpoints: ILayoutBreakpoints) {
        if (width <= WIDTH_BREAKPOINT.xs) return breakpoints['xs'];
        if (width <= WIDTH_BREAKPOINT.sm) return breakpoints['sm'];
        if (width <= WIDTH_BREAKPOINT.md) return breakpoints['md'];
        return breakpoints['lg'];
    }

    public static createDefaultColumnBreakpoints(breakpoints?: Partial<ILayoutBreakpoints>): ILayoutBreakpoints {
        let definedBreakpoint = breakpoints?.lg ?? breakpoints?.md ?? breakpoints?.sm ?? breakpoints?.xs ?? 1;
        return {
            'lg': definedBreakpoint,
            'md': Math.min(definedBreakpoint, 3),
            'sm': Math.min(definedBreakpoint, 2),
            'xs': 1,
        };
    }

    public static getColumnsContainerStyles(columnsPerRow: number): React.CSSProperties {
        return {
            display: 'grid',
            gridTemplateColumns: `repeat(${columnsPerRow}, 1fr)`,
        }
    }

    public static getColumnStyles(requestedColspan: number = 1, columnsPerRow: number = 1): React.CSSProperties {
        return {
            gridColumn: `span ${Math.min(requestedColspan, columnsPerRow)}`
        }
    }

}
