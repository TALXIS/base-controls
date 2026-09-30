import { IButtonProps, ICalloutProps, IconButton, ITextProps, Text } from "@fluentui/react";
import { Callout } from "@ui";

/** The replaceable pieces of the callout a column's filter is set in. */
export interface IFilteringUiCalloutComponents {
    /** What everything is drawn in, pointed at the column's header. */
    onRenderCallout: (props: ICalloutProps) => JSX.Element | null;
    /** What the title and the close button are drawn in. */
    onRenderHeader: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    onRenderTitle: (props: ITextProps) => JSX.Element | null;
    onRenderCloseButton: (props: IButtonProps) => JSX.Element | null;
}

/** The defaults for {@link IFilteringUiCalloutComponents}. */
export const FilteringUiCalloutComponents: IFilteringUiCalloutComponents = {
    onRenderCallout: props => <Callout {...props} />,
    onRenderHeader: props => <div {...props} />,
    onRenderTitle: props => <Text {...props} />,
    onRenderCloseButton: props => <IconButton {...props} />,
};
