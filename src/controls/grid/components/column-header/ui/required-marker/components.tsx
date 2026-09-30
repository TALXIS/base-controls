import { ITextProps, Text } from "@fluentui/react";

/** The replaceable pieces of what says a column asks for a value. */
export interface IColumnHeaderUiRequiredMarkerComponents {
    onRenderText: (props: ITextProps) => JSX.Element | null;
}

/** The defaults for {@link IColumnHeaderUiRequiredMarkerComponents}. */
export const ColumnHeaderUiRequiredMarkerComponents: IColumnHeaderUiRequiredMarkerComponents = {
    onRenderText: props => <Text {...props} />,
};
