import { IRuntimeHostUiErrorDialogProps, RuntimeHostUiErrorDialog } from "../../ui/error-dialog";

export interface IRuntimeExecuteErrorComponents {
    /** How the failures of `execute` are shown. */
    onRenderErrors: (props: IRuntimeHostUiErrorDialogProps) => JSX.Element | null;
}

/** The defaults for {@link IRuntimeExecuteErrorComponents}. */
export const RuntimeExecuteErrorComponents: IRuntimeExecuteErrorComponents = {
    onRenderErrors: props => <RuntimeHostUiErrorDialog {...props} />,
};
