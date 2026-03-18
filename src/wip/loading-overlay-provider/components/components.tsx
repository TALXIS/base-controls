import { ISpinnerProps } from "@fluentui/react";
import { Spinner as SpinnerBase, Overlay as OverlayBase  } from "@fluentui/react";

export interface ILoadingOverlayProviderComponents {
    Spinner: (props: ISpinnerProps) => JSX.Element;
    Container: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element;
    Overlay: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element;
}

export const Container = (props: React.HTMLAttributes<HTMLDivElement>) => {
    return <div {...props} />
}

export const Spinner = (props: ISpinnerProps) => {
    return <SpinnerBase {...props} />
}

export const Overlay = (props: React.HTMLAttributes<HTMLDivElement>) => {
    return <OverlayBase {...props} />
}

export const components: ILoadingOverlayProviderComponents = {
    Spinner: Spinner,
    Container: Container,
    Overlay: Overlay
}