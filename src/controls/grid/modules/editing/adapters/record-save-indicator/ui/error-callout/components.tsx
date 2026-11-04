import { DefaultButton, IButtonProps, ICalloutProps, Icon, IIconProps, ITextProps, Text } from "@fluentui/react";
import { Callout } from "@ui";

/** The replaceable pieces of what a row says when its record refused to save. */
export interface IRecordSaveUiErrorCalloutComponents {
    /** What everything is drawn in, pointed at the indicator. */
    onRenderCallout: (props: ICalloutProps) => JSX.Element | null;
    /** What the icon and the title are drawn in. */
    onRenderHeader: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    onRenderIcon: (props: IIconProps) => JSX.Element | null;
    onRenderTitle: (props: ITextProps) => JSX.Element | null;
    /** What the list of errors is drawn in. */
    onRenderFields: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    /** What one error is drawn in. */
    onRenderField: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    onRenderFieldName: (props: ITextProps) => JSX.Element | null;
    onRenderMessage: (props: ITextProps) => JSX.Element | null;
    /** What the dismiss button is drawn in. */
    onRenderFooter: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    /** What clears the failure. */
    onRenderDismissButton: (props: IButtonProps) => JSX.Element | null;
}

/** The defaults for {@link IRecordSaveUiErrorCalloutComponents}. */
export const RecordSaveUiErrorCalloutComponents: IRecordSaveUiErrorCalloutComponents = {
    onRenderCallout: props => <Callout {...props} />,
    onRenderHeader: props => <div {...props} />,
    onRenderIcon: props => <Icon {...props} />,
    onRenderTitle: props => <Text {...props} />,
    onRenderFields: props => <div {...props} />,
    onRenderField: props => <div {...props} />,
    onRenderFieldName: props => <Text {...props} />,
    onRenderMessage: props => <Text {...props} />,
    onRenderFooter: props => <div {...props} />,
    onRenderDismissButton: props => <DefaultButton {...props} />,
};
