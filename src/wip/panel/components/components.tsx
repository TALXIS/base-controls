import { DefaultButton, IButtonProps, IPanelProps, Panel as PanelBase, PrimaryButton } from "@fluentui/react";
import { ILoadingOverlayProviderProps, LoadingOverlayProvider } from "../../loading-overlay-provider";
import { IScrollableContainerProps, ScrollableContainer } from "../../scrollable-container";
import { Footer } from "./footer";

export interface IPanelComponents {
    Panel: (props: IPanelProps) => JSX.Element;
    Footer: ((props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element) | null;
    FooterPrimaryButton: (props: IButtonProps) => JSX.Element;
    FooterDismissButton: (props: IButtonProps) => JSX.Element;
    ScrollableContainer: (props: IScrollableContainerProps) => JSX.Element;
    Header: () => JSX.Element;
    LoadingOverlayProvider: (props: ILoadingOverlayProviderProps) => JSX.Element;
}

export const FooterPrimaryButton = (props: IButtonProps) => {
    return <PrimaryButton {...props} />
}

export const FooterDismissButton = (props: IButtonProps) => {
    return <DefaultButton {...props} />
}

export const Header = () => {
    return <></>
}

export const Panel = (props: IPanelProps) => {
    return <PanelBase {...props} />
}

export const components: IPanelComponents = {
    Footer: Footer,
    FooterPrimaryButton: FooterPrimaryButton,
    FooterDismissButton: FooterDismissButton,
    ScrollableContainer: ScrollableContainer,
    Header: Header,
    LoadingOverlayProvider: LoadingOverlayProvider,
    Panel: Panel
}