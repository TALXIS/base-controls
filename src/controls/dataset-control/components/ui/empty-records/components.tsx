import { Icon, IIconProps, ITextProps, Text } from "@fluentui/react";

/** The replaceable pieces of the empty state. */
export interface IEmptyRecordsUiComponents {
    /** What the icon and the message are drawn in. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    /** What is drawn above the message. */
    onRenderIcon: (props: IIconProps) => JSX.Element | null;
    /** What says there is nothing to show. */
    onRenderText: (props: ITextProps) => JSX.Element | null;
}

/** The defaults for {@link IEmptyRecordsUiComponents}. */
export const EmptyRecordsUiComponents: IEmptyRecordsUiComponents = {
    onRenderContainer: props => <div {...props} />,
    onRenderIcon: props => <Icon {...props} />,
    onRenderText: props => <Text {...props} />,
};
