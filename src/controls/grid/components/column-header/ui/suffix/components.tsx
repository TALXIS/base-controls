import { Icon, IIconProps } from "@fluentui/react";

/** The replaceable pieces of what a column header draws after the name. */
export interface IColumnHeaderUiSuffixComponents {
    /** What they are drawn in. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element;
    /** What says the column cannot be changed. */
    onRenderUneditableIcon: (props: IIconProps) => JSX.Element;
}

/** The defaults for {@link IColumnHeaderUiSuffixComponents}. */
export const ColumnHeaderUiSuffixComponents: IColumnHeaderUiSuffixComponents = {
    onRenderContainer: props => <div {...props} />,
    onRenderUneditableIcon: props => <Icon {...props} />,
};
