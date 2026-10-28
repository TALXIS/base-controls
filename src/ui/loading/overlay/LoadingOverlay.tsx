import { useMemo } from "react";
import { SpinnerSize, useTheme } from "@fluentui/react";
import { ILoadingOverlayComponents, LoadingOverlayComponents } from "./components";
import { getLoadingOverlayStyles } from "./styles";

export interface ILoadingOverlayProps {
    /** Lays the overlay over the children while `true`. */
    isLoading: boolean;
    /** What is being waited on, drawn under the spinner. */
    message?: string;
    children?: React.ReactNode;
    components?: Partial<ILoadingOverlayComponents>;
}

/** The children, and while `isLoading` an overlay with a spinner over the nearest positioned element. */
export const LoadingOverlay = (props: ILoadingOverlayProps) => {
    const components = { ...LoadingOverlayComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getLoadingOverlayStyles(theme), [theme]);

    return <>
        {props.children}
        {props.isLoading && components.onRenderOverlay({
            className: styles.overlay,
            children: <>
                {components.onRenderSpinner({ size: SpinnerSize.large })}
                {props.message && components.onRenderText({ variant: 'mediumPlus', className: styles.message, children: props.message })}
            </>,
        })}
    </>;
};
