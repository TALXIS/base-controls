import { DefaultButton, IButtonProps, PrimaryButton } from "@fluentui/react";
import { ScrollableContainer } from "./ScrollableContainer/ScrollableContainer";

export interface IPanelComponents {
    FooterContent: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element;
    SaveButton: (props: IButtonProps) => JSX.Element;
    DismissButton: (props: IButtonProps) => JSX.Element;
    ScrollableContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element;
    Header: () => JSX.Element;
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

export const components: IPanelComponents = {
    FooterContent: PanelFooterContent,
    SaveButton: SaveButton,
    DismissButton: DismissButton,
    ScrollableContainer: ScrollableContainer,
    Header: Header
}