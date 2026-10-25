import { Icon, IIconProps } from "@fluentui/react";

/** The replaceable pieces of a row showing one field. */
export interface ITaskTooltipUiFieldRowComponents {
    /** Holds the icon, the label and the value. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    /** Drawn only with an icon name. */
    onRenderIcon: (props: IIconProps) => JSX.Element | null;
    onRenderLabel: (props: React.HTMLAttributes<HTMLSpanElement>) => JSX.Element | null;
    onRenderValue: (props: React.HTMLAttributes<HTMLSpanElement>) => JSX.Element | null;
}

/** The defaults for {@link ITaskTooltipUiFieldRowComponents}. */
export const TaskTooltipUiFieldRowComponents: ITaskTooltipUiFieldRowComponents = {
    onRenderContainer: props => <div {...props} />,
    onRenderIcon: props => <Icon {...props} />,
    onRenderLabel: props => <span {...props} />,
    onRenderValue: props => <span {...props} />,
};
