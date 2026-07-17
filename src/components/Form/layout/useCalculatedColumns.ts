import React from "react";
import { ILayoutBreakpoints, Layout } from "./Layout";


interface IUseCalculatedColumnsParams {
    ref: React.RefObject<HTMLDivElement>;
    breakpoints: ILayoutBreakpoints;
    onGetNumberOfColumnsForWidth?: (containerWidth: number, breakpoints: ILayoutBreakpoints) => number;
}

export interface IColumnCalculation {
    firstRender: boolean;
    columnsPerRow: number;
    containerStyles: React.CSSProperties;
    containerWidth: number;
}

export const useCalculatedColumns = (params: IUseCalculatedColumnsParams) => {
    const { ref, breakpoints, onGetNumberOfColumnsForWidth = Layout.getNumberOfColumnsForWidth } = params;

    const [columnCalculation, setColumnCalculation] = React.useState<IColumnCalculation>({
        firstRender: true,
        columnsPerRow: breakpoints.lg,
        containerWidth: 0,
        containerStyles: Layout.getColumnsContainerStyles(breakpoints.lg)
    });

    const observer = React.useMemo(() => new ResizeObserver((entries) => {
        const containerWidth = entries[0].contentRect.width;
        const numOfColumns = onGetNumberOfColumnsForWidth(containerWidth, breakpoints);
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

    return columnCalculation;
}
