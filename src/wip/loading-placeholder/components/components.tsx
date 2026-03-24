import { ISpinnerProps } from "@fluentui/react";
import { Spinner as SpinnerBase } from '@talxis/react-components';

export interface ILoadingPlaceholderComponents {
    Spinner: (props: ISpinnerProps) => JSX.Element;
}

export const Spinner = (props: ISpinnerProps) => {
    return <SpinnerBase {...props} />
}

export const components: ILoadingPlaceholderComponents = {
    Spinner: Spinner
}