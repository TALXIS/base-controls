import { useMemo } from "react";
import { Shimmer } from "@ui";
import { getCellLoadingStyles } from "./styles";

export interface ICellLoadingProps {
    /** Whether the cell is waiting on something rather than able to draw. */
    isLoading?: boolean;
    children?: React.ReactNode;
}

/** What a cell shows while its value is still being fetched: wrap it around the content it stands in for. */
export const CellLoading = (props: ICellLoadingProps) => {
    const styles = useMemo(() => getCellLoadingStyles(), []);

    if (!props.isLoading) {
        return <>{props.children}</>;
    }
    //the grid gives `.ag-cell-wrapper:has([data-is-loading="true"])` a full height
    return <Shimmer data-is-loading='true' styles={{ root: styles.shimmerRoot, shimmerWrapper: styles.shimmerWrapper }} />;
};
