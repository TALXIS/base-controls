import React from "react";
import { IColumnBreakpoints, Layout } from "./Layout";


interface IUseCalculatedColumnsParams {
    ref: React.RefObject<HTMLDivElement>;
    breakpoints: IColumnBreakpoints;
    onGetNumberOfColumnsForWidth?: (containerWidth: number, breakpoints: IColumnBreakpoints) => number;
}

export interface IColumnCalculation {
    firstRender: boolean;
    numberOfColumns: number;
}

export const useCalculatedColumns = (params: IUseCalculatedColumnsParams) => {
    const { ref, breakpoints, onGetNumberOfColumnsForWidth = Layout.getNumberOfColumnsForWidth } = params;
    const [columnCalculation, setColumnCalculation] = React.useState<IColumnCalculation>({
        firstRender: true,
        numberOfColumns: breakpoints.lg
    });
    
    const observer = React.useMemo(() => new ResizeObserver((entries) => {
        console.log(entries[0].contentRect.width)
        setColumnCalculation({ firstRender: false, numberOfColumns: onGetNumberOfColumnsForWidth(entries[0].contentRect.width, breakpoints) });
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