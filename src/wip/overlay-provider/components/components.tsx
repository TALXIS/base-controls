import { IOverlayProps } from "@fluentui/react";
import { Overlay as OverlayBase } from "@fluentui/react";
import React from "react";

export interface IOverlayProviderComponents {
    Overlay: (props: IOverlayProps) => JSX.Element;
    Container: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element;
}

export const Overlay = (props: IOverlayProps) => {
    return <OverlayBase {...props} />
}

export const Container = (props: React.HTMLAttributes<HTMLDivElement>) => {
    return <div {...props} />
}

export const components: IOverlayProviderComponents = {
    Overlay: Overlay,
    Container: Container
}