import { ITextProps, Text } from "@fluentui/react";

/** The replaceable pieces of an option tag. */
export interface IFieldOptionSetComponents {
    onRender: (props: ITextProps) => JSX.Element | null;
    onRenderLabel: (props: React.HTMLAttributes<HTMLSpanElement>) => JSX.Element | null;
}

/** The defaults for {@link IFieldOptionSetComponents}. */
export const FieldOptionSetComponents: IFieldOptionSetComponents = {
    onRender: props => <Text {...props} />,
    onRenderLabel: props => <span {...props} />,
};
