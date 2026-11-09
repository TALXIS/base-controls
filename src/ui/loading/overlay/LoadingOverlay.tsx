import { useTheme } from "@theme";
import { useMemo } from "react";
import { SpinnerSize } from "@fluentui/react";
import { ILoadingOverlayComponents, LoadingOverlayComponents } from "./components";
import { getLoadingOverlayStyles } from "./styles";

export interface ILoadingOverlayProps {
    /** Shows the overlay while `true`. */
    isLoading: boolean;
    /** What is being waited on, drawn under the spinner. */
    message?: string;
    components?: Partial<ILoadingOverlayComponents>;
}

/** While `isLoading`, a spinner covering the nearest positioned element; place it inside a `position: relative` host. */
export const LoadingOverlay = (props: ILoadingOverlayProps) => {
    const components = { ...LoadingOverlayComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getLoadingOverlayStyles(theme), [theme]);

    if (!props.isLoading) {
        return null;
    }
    return components.onRenderOverlay({
        className: styles.overlay,
        children: <>
            {components.onRenderSpinner({ size: SpinnerSize.large })}
            {props.message && components.onRenderText({ variant: 'mediumPlus', className: styles.message, children: props.message })}
        </>,
    });
};
