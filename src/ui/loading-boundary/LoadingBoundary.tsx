import { useMemo } from "react";
import { SpinnerSize } from "@fluentui/react";
import { useLabels } from "@utils/localization";
import { ILoadingBoundaryComponents, LoadingBoundaryComponents } from "./components";
import { LOADING_BOUNDARY_LABELS } from "./labels";
import { getLoadingBoundaryStyles } from "./styles";

export interface ILoadingBoundaryProps {
    /** Draws the spinner in place of the children while `true`. */
    isLoading: boolean;
    children?: React.ReactNode;
    components?: Partial<ILoadingBoundaryComponents>;
}

/** A spinner with a text beside it while `isLoading`, otherwise the children. */
export const LoadingBoundary = (props: ILoadingBoundaryProps) => {
    const components = { ...LoadingBoundaryComponents, ...props.components };
    const styles = useMemo(() => getLoadingBoundaryStyles(), []);
    const labels = useLabels(LOADING_BOUNDARY_LABELS);

    if (!props.isLoading) {
        return <>{props.children}</>;
    }
    return components.onRenderContainer({
        className: styles.loadingBoundary,
        children: <>
            {components.onRenderSpinner({ size: SpinnerSize.small })}
            {components.onRenderText({ children: labels.get('loadingBoundary.loading') })}
        </>,
    });
};
