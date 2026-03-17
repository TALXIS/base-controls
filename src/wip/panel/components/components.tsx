import { DefaultButton, IButtonProps, IPanelProps, Panel as PanelBase, PrimaryButton } from "@fluentui/react";
import { ScrollableContainer } from "./ScrollableContainer/ScrollableContainer";
import { ILoadingOverlayProviderProps, LoadingOverlayProvider } from "../../loading-overlay-provider";

export interface IPanelComponents {
    Panel: (props: IPanelProps) => JSX.Element;
    FooterContent: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element;
    SaveButton: (props: IButtonProps) => JSX.Element;
    DismissButton: (props: IButtonProps) => JSX.Element;
    ScrollableContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element;
    Header: () => JSX.Element;
    LoadingOverlayProvider: (props: ILoadingOverlayProviderProps) => JSX.Element;
}

export const PanelFooterContent = (props: React.HTMLAttributes<HTMLDivElement>) => {
    return <div {...props}>
        {props.children}
    </div>
}

export const SaveButton = (props: IButtonProps) => {
    return <PrimaryButton {...props} />
}

export const DismissButton = (props: IButtonProps) => {
    return <DefaultButton {...props} />
}

export const Header = () => {
    return <></>
}

export const Panel = (props: IPanelProps) => {
    return <PanelBase {...props} />
}

export const components: IPanelComponents = {
    FooterContent: PanelFooterContent,
    SaveButton: SaveButton,
    DismissButton: DismissButton,
    ScrollableContainer: ScrollableContainer,
    Header: Header,
    LoadingOverlayProvider: LoadingOverlayProvider,
    Panel: Panel
}