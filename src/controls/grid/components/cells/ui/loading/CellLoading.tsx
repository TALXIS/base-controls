import { useMemo } from "react";
import { Shimmer } from "@components/ui";
import { getCellLoadingStyles } from "./styles";

/** What a cell shows while its value is still being fetched. */
export const CellLoading = () => {
    const styles = useMemo(() => getCellLoadingStyles(), []);
    //the grid gives `.ag-cell-wrapper:has([data-is-loading="true"])` a full height
    return <Shimmer data-is-loading='true' styles={{ root: styles.shimmerRoot, shimmerWrapper: styles.shimmerWrapper }} />;
};
