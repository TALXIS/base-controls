import { ISpinnerProps } from "@fluentui/react";
import { Spinner } from "@talxis/react-components";

export interface ILoadingOverlayProviderComponents {
    Spinner: (props: ISpinnerProps) => JSX.Element;
    Container: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element;
}

export const Container = (props: React.HTMLAttributes<HTMLDivElement>) => {
    return <div {...props} />
}

export const components: ILoadingOverlayProviderComponents = {
    Spinner: Spinner,
    Container: Container
}