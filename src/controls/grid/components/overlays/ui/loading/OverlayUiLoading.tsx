import { SpinnerSize } from '@fluentui/react';
import { useMemo } from 'react';
import { IOverlayUiLoadingComponents, OverlayUiLoadingComponents } from './components';
import { getOverlayUiLoadingStyles } from './styles';

export interface IOverlayUiLoadingProps {
    /** What is being waited on, drawn under the spinner. */
    message?: string;
    components?: Partial<IOverlayUiLoadingComponents>;
}

/** A spinner over the grid, with a message if there is one. */
export const OverlayUiLoading = (props: IOverlayUiLoadingProps) => {
    const components = { ...OverlayUiLoadingComponents, ...props.components };
    const styles = useMemo(() => getOverlayUiLoadingStyles(), []);

    return components.onRenderContainer({
        className: styles.root,
        children: <>
            {components.onRenderSpinner({ size: SpinnerSize.large })}
            {props.message && components.onRenderText({ variant: 'large', className: styles.message, children: props.message })}
        </>,
    });
};
