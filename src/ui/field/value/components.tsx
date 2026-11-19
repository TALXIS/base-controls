import { Icon, IIconProps } from "@fluentui/react";

/** The replaceable pieces of a row showing one field. */
export interface IFieldValueComponents {
    /** Holds the icon, the label and the value. */
    onRender: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    /** Drawn only with an icon name. */
    onRenderIcon: (props: IIconProps) => JSX.Element | null;
    onRenderLabel: (props: React.HTMLAttributes<HTMLSpanElement>) => JSX.Element | null;
}

/** The defaults for {@link IFieldValueComponents}. */
export const FieldValueComponents: IFieldValueComponents = {
    onRender: props => <div {...props} />,
    onRenderIcon: props => <Icon {...props} />,
    onRenderLabel: props => <span {...props} />,
};
