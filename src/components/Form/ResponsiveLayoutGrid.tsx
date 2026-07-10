import * as React from "react";
import { ResponsiveGridLayout, useContainerWidth, type ResponsiveLayouts } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { DEFAULT_FORM_BREAKPOINTS, type FormLayoutBreakpoint, type FormResponsiveCols } from "./layout";

export interface IResponsiveLayoutGridProps {
    dataId?: string;
    className?: string;
    layouts: ResponsiveLayouts<FormLayoutBreakpoint>;
    cols: FormResponsiveCols;
    rowHeight?: number;
    margin?: readonly [number, number];
    containerPadding?: readonly [number, number];
    children?: React.ReactNode;
}

export const ResponsiveLayoutGrid: React.FC<IResponsiveLayoutGridProps> = ({
    dataId,
    className,
    layouts,
    cols,
    rowHeight = 48,
    margin = [12, 12],
    containerPadding = [0, 0],
    children,
}) => {
    const { containerRef, mounted, width } = useContainerWidth();

    return (
        <div ref={containerRef as React.RefObject<HTMLDivElement>} data-id={dataId} style={{ width: "100%" }}>
            {mounted ? (
                <ResponsiveGridLayout<FormLayoutBreakpoint>
                    className={className}
                    breakpoints={DEFAULT_FORM_BREAKPOINTS}
                    cols={cols}
                    layouts={layouts}
                    width={width}
                    rowHeight={rowHeight}
                    margin={margin}
                    containerPadding={containerPadding}
                >
                    {children}
                </ResponsiveGridLayout>
            ) : (
                <div className={className}>
                    {children}
                </div>
            )}
        </div>
    );
};
