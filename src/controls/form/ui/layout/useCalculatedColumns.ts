import React from "react";
import { ILayoutBreakpoints, Layout } from "./Layout";
import { useLatest } from "@core";


interface IUseCalculatedColumnsParameters {
    ref: React.RefObject<HTMLDivElement>;
    breakpoints: ILayoutBreakpoints;
    getNumberOfColumnsForWidth?: (containerWidth: number, breakpoints: ILayoutBreakpoints) => number;
}

export interface IColumnCalculation {
    firstRender: boolean;
    columnsPerRow: number;
    containerStyles: React.CSSProperties;
    containerWidth: number;
}

export const useCalculatedColumns = (parameters: IUseCalculatedColumnsParameters) => {
    const { ref, breakpoints, getNumberOfColumnsForWidth = Layout.getNumberOfColumnsForWidth } = parameters;

    const [columnCalculation, setColumnCalculation] = React.useState<IColumnCalculation>({
        firstRender: true,
        columnsPerRow: breakpoints.lg,
        containerWidth: 0,
        containerStyles: Layout.getColumnsContainerStyles(breakpoints.lg)
    });

    const breakpointsRef = useLatest(breakpoints);

    const observer = React.useMemo(() => new ResizeObserver((entries) => {
        const containerWidth = entries[0].contentRect.width;
        const numOfColumns = getNumberOfColumnsForWidth(containerWidth, breakpointsRef.current);
        setColumnCalculation({
            firstRender: false,
            columnsPerRow: numOfColumns,
            containerWidth: containerWidth,
            containerStyles: Layout.getColumnsContainerStyles(numOfColumns)
        });
    }), []);

    React.useEffect(() => {
        if (!ref.current) return;
        observer.observe(ref.current);
        return () => {
            observer.disconnect();
        }
    }, []);

    React.useEffect(() => {
        setColumnCalculation((current) => {
            const numOfColumns = getNumberOfColumnsForWidth(current.containerWidth, breakpointsRef.current);
            if (numOfColumns === current.columnsPerRow) {
                return current;
            }
            return {
                ...current,
                columnsPerRow: numOfColumns,
                containerStyles: Layout.getColumnsContainerStyles(numOfColumns)
            };
        });
    }, [breakpoints]);

    return columnCalculation;
}
