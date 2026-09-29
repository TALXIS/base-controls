import { Icon, IIconProps, ITextProps, Text } from "@fluentui/react";

/** The replaceable pieces of the empty state over the grid. */
export interface IOverlayUiEmptyRecordsComponents {
    /** What the icon and the message are drawn in. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element;
    /** What is drawn above the message. */
    onRenderIcon: (props: IIconProps) => JSX.Element;
    /** What says there is nothing to show. */
    onRenderText: (props: ITextProps) => JSX.Element;
}

/** The defaults for {@link IOverlayUiEmptyRecordsComponents}. */
export const OverlayUiEmptyRecordsComponents: IOverlayUiEmptyRecordsComponents = {
    onRenderContainer: props => <div {...props} />,
    onRenderIcon: props => <Icon {...props} />,
    onRenderText: props => <Text {...props} />,
};
