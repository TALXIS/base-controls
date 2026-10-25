import { Icon, IIconProps } from "@fluentui/react";

/** The replaceable pieces of the date range. */
export interface ITaskTooltipUiDateRangeComponents {
    /** Holds the icon, the range and the duration. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    onRenderIcon: (props: IIconProps) => JSX.Element | null;
    onRenderRange: (props: React.HTMLAttributes<HTMLSpanElement>) => JSX.Element | null;
    /** A badge with the duration; drawn only with one. */
    onRenderDuration: (props: React.HTMLAttributes<HTMLSpanElement>) => JSX.Element | null;
}

/** The defaults for {@link ITaskTooltipUiDateRangeComponents}. */
export const TaskTooltipUiDateRangeComponents: ITaskTooltipUiDateRangeComponents = {
    onRenderContainer: props => <div {...props} />,
    onRenderIcon: props => <Icon {...props} />,
    onRenderRange: props => <span {...props} />,
    onRenderDuration: props => <span {...props} />,
};
