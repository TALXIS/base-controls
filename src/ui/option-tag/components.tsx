import { ITextProps, Text } from "@fluentui/react";

/** The replaceable pieces of an option tag. */
export interface IOptionTagComponents {
    onRender: (props: ITextProps) => JSX.Element | null;
    onRenderLabel: (props: React.HTMLAttributes<HTMLSpanElement>) => JSX.Element | null;
}

/** The defaults for {@link IOptionTagComponents}. */
export const OptionTagComponents: IOptionTagComponents = {
    onRender: props => <Text {...props} />,
    onRenderLabel: props => <span {...props} />,
};
