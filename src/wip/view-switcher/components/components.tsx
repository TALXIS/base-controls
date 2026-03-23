import { CommandBarButton as CommandBarButtonBase } from "@fluentui/react";
import { IButttonWithLoadingProps, withButtonLoading } from "@talxis/react-components";
import { Dialog, IDialogProps } from "../../dialog";

export interface IViewSwitcherComponents {
    CommandBarButton: (props: IButttonWithLoadingProps) => JSX.Element;
    CreateNewViewDialog: (props: IDialogProps) => JSX.Element;
}

export const CreateNewViewDialog = (props: IDialogProps) => {
    return <Dialog {...props} />
}

export const CommandBarButton = withButtonLoading(CommandBarButtonBase)
export const components: IViewSwitcherComponents = {
    CommandBarButton,
    CreateNewViewDialog: CreateNewViewDialog
}