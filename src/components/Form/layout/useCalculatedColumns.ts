import React from "react";
import { IColumnBreakpoints, Layout } from "./Layout";


interface IUseCalculatedColumnsParams {
    ref: React.RefObject<HTMLDivElement>;
    breakpoints: IColumnBreakpoints;
    onGetNumberOfColumnsForWidth?: (containerWidth: number, breakpoints: IColumnBreakpoints) => number;
}

export interface IColumnCalculation {
    firstRender: boolean;
    columnsPerRow: number;
    containerStyles: React.CSSProperties;
}

const getContainerStyles = (numOfColumns: number): React.CSSProperties => {
    return {
        display: 'grid',
        gridTemplateColumns: `repeat(${numOfColumns}, 1fr)`
    }
}

export const useCalculatedColumns = (params: IUseCalculatedColumnsParams) => {
    const { ref, breakpoints, onGetNumberOfColumnsForWidth = Layout.getNumberOfColumnsForWidth } = params;

    const [columnCalculation, setColumnCalculation] = React.useState<IColumnCalculation>({
        firstRender: true,
        columnsPerRow: breakpoints.lg,
        containerStyles: getContainerStyles(breakpoints.lg)
    });

    const observer = React.useMemo(() => new ResizeObserver((entries) => {
        const numOfColumns = onGetNumberOfColumnsForWidth(entries[0].contentRect.width, breakpoints);
        setColumnCalculation({ 
            firstRender: false, 
            columnsPerRow: numOfColumns,
            containerStyles: getContainerStyles(numOfColumns)
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
