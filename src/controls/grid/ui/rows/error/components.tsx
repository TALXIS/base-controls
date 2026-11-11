import { IMessageBarProps, MessageBar } from "@fluentui/react";

/** The replaceable pieces of a row that failed. */
export interface IRowUiErrorComponents {
    /** What says what went wrong. */
    onRender: (props: IMessageBarProps) => JSX.Element | null;
}

/** The defaults for {@link IRowUiErrorComponents}. */
export const RowUiErrorComponents: IRowUiErrorComponents = {
    onRender: props => <MessageBar {...props} />,
};
