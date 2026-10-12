import { useMemo } from "react";
import { SpinnerSize } from "@fluentui/react";
import { LocalizationService } from "@utils";
import { ILoadingBoundaryComponents, LoadingBoundaryComponents } from "./components";
import { ILoadingBoundaryLabels, LOADING_BOUNDARY_LABELS } from "./labels";
import { getLoadingBoundaryStyles } from "./styles";

export interface ILoadingBoundaryProps {
    /** Draws the spinner in place of the children while `true`. */
    isLoading: boolean;
    children?: React.ReactNode;
    labels?: Partial<ILoadingBoundaryLabels>;
    components?: Partial<ILoadingBoundaryComponents>;
}

/** A spinner with a text beside it while `isLoading`, otherwise the children. */
export const LoadingBoundary = (props: ILoadingBoundaryProps) => {
    const components = { ...LoadingBoundaryComponents, ...props.components };
    const styles = useMemo(() => getLoadingBoundaryStyles(), []);
    const labels = useMemo(() => new LocalizationService<ILoadingBoundaryLabels>({ ...LOADING_BOUNDARY_LABELS, ...props.labels }), [props.labels]);

    if (!props.isLoading) {
        return <>{props.children}</>;
    }
    return components.onRenderContainer({
        className: styles.loadingBoundary,
        children: <>
            {components.onRenderSpinner({ size: SpinnerSize.small })}
            {components.onRenderText({ children: labels.getLocalizedString('loading') })}
        </>,
    });
};
