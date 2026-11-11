import { ITextProps, Text } from "@fluentui/react";

/** The replaceable pieces of what a column is called. */
export interface IColumnHeaderUiLabelComponents {
    onRender: (props: ITextProps) => JSX.Element | null;
}

/** The defaults for {@link IColumnHeaderUiLabelComponents}. */
export const ColumnHeaderUiLabelComponents: IColumnHeaderUiLabelComponents = {
    onRender: props => <Text {...props} />,
};
