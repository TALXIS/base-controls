import { ICommandBarProps, IMessageBarProps, ITooltipHostProps, MessageBar } from "@fluentui/react";
import { CommandBar } from "../command-bar";
import { TooltipHost } from "../surfaces";

/** The replaceable pieces of the error message bar. */
export interface IErrorMessageBarComponents {
    /** The bar; `children` holds the title, `actions` the command bar. */
    onRenderMessageBar: (props: IMessageBarProps) => JSX.Element | null;
    /** Wraps the title; its `children` are the title. */
    onRenderTooltip: (props: ITooltipHostProps) => JSX.Element | null;
    onRenderTitle: (props: React.HTMLAttributes<HTMLSpanElement>) => JSX.Element | null;
    /** The details and retry commands; an override can add its own items. */
    onRenderCommandBar: (props: ICommandBarProps) => JSX.Element | null;
}

/** The defaults for {@link IErrorMessageBarComponents}. */
export const ErrorMessageBarComponents: IErrorMessageBarComponents = {
    onRenderMessageBar: props => <MessageBar {...props} />,
    onRenderTooltip: props => <TooltipHost {...props} />,
    onRenderTitle: props => <span {...props} />,
    onRenderCommandBar: props => <CommandBar {...props} />,
};
