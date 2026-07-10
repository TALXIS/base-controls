import * as React from "react";
import ReactGridLayout, { useContainerWidth, useResponsiveLayout, type Layout, type ResponsiveLayouts } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { DEFAULT_FORM_BREAKPOINTS, normalizeLayoutKey, type FormLayoutBreakpoint, type FormResponsiveCols } from "./layout";

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
    const { containerRef, width, mounted } = useContainerWidth();
    const { layout, cols: currentCols } = useResponsiveLayout<FormLayoutBreakpoint>({
        width,
        breakpoints: DEFAULT_FORM_BREAKPOINTS,
        cols,
        layouts,
    });
    const childEntries = React.Children.toArray(children)
        .filter(React.isValidElement)
        .map((child, index) => ({
            key: normalizeLayoutKey((child as React.ReactElement).key, `${dataId ?? "grid"}-item-${index}`),
            child: child as React.ReactElement,
        }));
    const itemRefs = React.useRef(new Map<string, HTMLDivElement>());
    const [measuredHeights, setMeasuredHeights] = React.useState<Record<string, number>>({});

    React.useLayoutEffect(() => {
        if (typeof ResizeObserver === "undefined") {
            return;
        }

        const observer = new ResizeObserver((entries) => {
            setMeasuredHeights((previous) => {
                let changed = false;
                const next = { ...previous };

                for (const entry of entries) {
                    const key = (entry.target as HTMLElement).dataset.layoutKey;
                    if (!key) {
                        continue;
                    }

                    const height = Math.ceil(entry.contentRect.height);
                    if (next[key] !== height) {
                        next[key] = height;
                        changed = true;
                    }
                }

                return changed ? next : previous;
            });
        });

        for (const entry of childEntries) {
            const element = itemRefs.current.get(entry.key);
            if (element) {
                observer.observe(element);
            }
        }

        return () => {
            observer.disconnect();
        };
    }, [childEntries]);

    const renderLayout = React.useMemo<Layout>(() => (
        layout.map((item) => ({
            ...item,
            h: Math.max(item.h, getGridHeightUnits(measuredHeights[item.i], rowHeight, margin[1])),
        }))
    ), [layout, margin, measuredHeights, rowHeight]);

    return (
        <div ref={containerRef as React.RefObject<HTMLDivElement>} data-id={dataId} style={{ width: "100%" }}>
            {mounted ? (
                <ReactGridLayout
                    className={className}
                    width={width}
                    layout={renderLayout}
                    autoSize={true}
                    gridConfig={{
                        cols: currentCols,
                        rowHeight,
                        margin: [margin[0], margin[1]],
                        containerPadding: [containerPadding[0], containerPadding[1]],
                    }}
                    dragConfig={{ enabled: false }}
                    resizeConfig={{ enabled: false }}
                >
                    {childEntries.map(({ key, child }) => (
                        <div key={key}>
                            <div
                                ref={(element) => {
                                    if (element) {
                                        itemRefs.current.set(key, element);
                                    } else {
                                        itemRefs.current.delete(key);
                                    }
                                }}
                                data-layout-key={key}
                            >
                                {child}
                            </div>
                        </div>
                    ))}
                </ReactGridLayout>
            ) : null}
        </div>
    );
};

const getGridHeightUnits = (contentHeight: number | undefined, rowHeight: number, marginY: number): number => {
    if (!contentHeight || rowHeight <= 0) {
        return 1;
    }

    return Math.max(1, Math.ceil((contentHeight + marginY) / (rowHeight + marginY)));
};
