import { IRuntimeHostUiErrorDialogProps, RuntimeHostUiErrorDialog } from "../../ui/error-dialog";

export interface IRuntimeExecuteErrorComponents {
    /** How the failures of `execute` are shown. */
    onRender: (props: IRuntimeHostUiErrorDialogProps) => JSX.Element | null;
}

/** The defaults for {@link IRuntimeExecuteErrorComponents}. */
export const RuntimeExecuteErrorComponents: IRuntimeExecuteErrorComponents = {
    onRender: props => <RuntimeHostUiErrorDialog {...props} />,
};
