import { useMemo } from "react";
import { IRowUiLoadingComponents, RowUiLoadingComponents } from "./components";
import { getRowUiLoadingStyles } from "./styles";

export interface IRowUiLoadingProps {
    components?: Partial<IRowUiLoadingComponents>;
}

/** A placeholder the width of the row. */
export const RowUiLoading = (props: IRowUiLoadingProps) => {
    const components = { ...RowUiLoadingComponents, ...props.components };
    const styles = useMemo(() => getRowUiLoadingStyles(), []);

    return components.onRenderShimmer({ styles: { root: styles.root, shimmerWrapper: styles.shimmerWrapper } });
};
