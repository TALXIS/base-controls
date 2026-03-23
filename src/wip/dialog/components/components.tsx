import { DefaultButton, Dialog as DialogBase, IButtonProps, IDialogProps, PrimaryButton } from "@fluentui/react";
import { ILoadingOverlayProviderProps, LoadingOverlayProvider } from "../../loading-overlay-provider";
import { IScrollableContainerProps, ScrollableContainer } from "../../scrollable-container";

export interface IDialogComponents {
    Dialog: (props: IDialogProps) => JSX.Element;
    ScrollableContainer: (props: IScrollableContainerProps) => JSX.Element;
    Footer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element;
    FooterDismissButton: (props: IButtonProps) => JSX.Element;
    FooterPrimaryButton: (props: IButtonProps) => JSX.Element;
    LoadingOverlayProvider: (props: ILoadingOverlayProviderProps) => JSX.Element;
}

export const Dialog = (props: IDialogProps) => {
    return <DialogBase {...props} />
}

export const Footer = (props: React.HTMLAttributes<HTMLDivElement>) => {
    return <div {...props} />
}
export const FooterDismissButton = (props: IButtonProps) => {
    return <DefaultButton {...props} />
}

export const FooterPrimaryButton = (props: IButtonProps) => {
    return <PrimaryButton {...props} />
}

export const components: IDialogComponents = {
    Dialog: Dialog,
    ScrollableContainer: ScrollableContainer,
    Footer: Footer,
    FooterDismissButton: FooterDismissButton,
    FooterPrimaryButton: FooterPrimaryButton,
    LoadingOverlayProvider: LoadingOverlayProvider
}