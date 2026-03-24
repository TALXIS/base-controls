import { CommandBarButton as CommandBarButtonBase, IShimmerProps, Shimmer as ShimmerBase } from "@fluentui/react";
import { IButttonWithLoadingProps, withButtonLoading } from "@talxis/react-components";
import { IPanelProps, Panel } from "../../panel";
import { Dialog, IDialogProps } from "../../dialog";
import { ILoadingPlaceholderProps, LoadingPlaceholder } from "../../loading-placeholder";

export interface IViewSwitcherComponents {
    CommandBarButton: (props: IButttonWithLoadingProps) => JSX.Element;
    CreateNewQueryDialog: (props: IDialogProps) => JSX.Element;
    ViewManagerPanel: (props: IPanelProps) => JSX.Element;
    LoadingPlaceholder: (props: ILoadingPlaceholderProps) => JSX.Element;

}

export const CommandBarButton = withButtonLoading(CommandBarButtonBase);

export const Shimmer = (props: IShimmerProps) => {
    return <ShimmerBase {...props} />
}

export const components: IViewSwitcherComponents = {
    CommandBarButton,
    CreateNewQueryDialog: Dialog,
    ViewManagerPanel: Panel,
    LoadingPlaceholder: LoadingPlaceholder
}