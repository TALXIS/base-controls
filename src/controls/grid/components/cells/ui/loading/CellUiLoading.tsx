import { useMemo } from "react";
import { IShimmerProps } from "@fluentui/react";
import { getClassNames } from "@utils";
import { CellUiLoadingComponents, ICellUiLoadingComponents } from "./components";
import { getCellUiLoadingStyles } from "./styles";

export interface ICellUiLoadingProps {
    /** Whether the cell is waiting on something. */
    isLoading?: boolean;
    /** Put on the shimmer's root, alongside its own class. */
    className?: string;
    children?: React.ReactNode;
    components?: Partial<ICellUiLoadingComponents>;
}

/** What a cell shows while its value is fetched: wrap it around what it stands in for. */
export const CellUiLoading = (props: ICellUiLoadingProps) => {
    const components = { ...CellUiLoadingComponents, ...props.components };
    const styles = useMemo(() => getCellUiLoadingStyles(), []);

    if (!props.isLoading) {
        return <>{props.children}</>;
    }
    //the grid gives `.ag-cell-wrapper:has([data-is-loading="true"])` a full height
    const shimmerProps: IShimmerProps & { 'data-is-loading': string } = {
        'data-is-loading': 'true',
        styles: { root: getClassNames([styles.shimmerRoot, props.className]), shimmerWrapper: styles.shimmerWrapper },
    };
    return components.onRenderShimmer(shimmerProps);
};
