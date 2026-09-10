import { useMemo } from "react";
import { Shimmer } from "@fluentui/react";
import { getCellLoadingStyles } from "./styles";

/** What a cell shows while its value is still being fetched. */
export const CellLoading = () => {
    const styles = useMemo(() => getCellLoadingStyles(), []);
    //the grid gives `.ag-cell-wrapper:has([data-is-loading="true"])` a full height, so the shimmer fills
    //the row rather than sitting in the middle of it
    return <Shimmer data-is-loading='true' styles={{ root: styles.shimmerRoot, shimmerWrapper: styles.shimmerWrapper }} />;
};
