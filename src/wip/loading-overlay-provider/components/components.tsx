import { ISpinnerProps } from "@fluentui/react";
import { Spinner as SpinnerBase, Overlay as OverlayBase  } from "@fluentui/react";
import { IOverlayProviderComponents } from "../../overlay-provider/components";
import { components as overlayProviderComponents } from "../../overlay-provider/components";
import { Overlay } from "./overlay";

export interface ILoadingOverlayProviderComponents extends IOverlayProviderComponents {
    Spinner: (props: ISpinnerProps) => JSX.Element;
}


export const Spinner = (props: ISpinnerProps) => {
    return <SpinnerBase {...props} />
}

export const components: ILoadingOverlayProviderComponents = {
    ...overlayProviderComponents,
    Spinner: Spinner,
    Overlay: Overlay
}