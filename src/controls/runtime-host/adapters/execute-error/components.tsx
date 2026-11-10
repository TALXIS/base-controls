import { IRuntimeHostUiErrorDialogProps, RuntimeHostUiErrorDialog } from "../../ui/error-dialog";

export interface IRuntimeExecuteErrorComponents {
    /** How one failure of `execute` is shown. */
    onRenderError: (props: IRuntimeHostUiErrorDialogProps) => JSX.Element | null;
}

/** The defaults for {@link IRuntimeExecuteErrorComponents}. */
export const RuntimeExecuteErrorComponents: IRuntimeExecuteErrorComponents = {
    onRenderError: props => <RuntimeHostUiErrorDialog {...props} />,
};
