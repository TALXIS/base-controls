import { useMemo } from "react";
import { Shimmer } from "@fluentui/react";
import { getCellLoadingStyles } from "./styles";

/** What a cell shows while its value is still being fetched. */
export const CellLoading = () => {
    const styles = useMemo(() => getCellLoadingStyles(), []);
    return <Shimmer data-is-loading='true' styles={{ root: styles.shimmerRoot, shimmerWrapper: styles.shimmerWrapper }} />;
};
