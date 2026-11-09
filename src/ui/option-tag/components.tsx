import { ITextProps, Text } from "@fluentui/react";

/** The replaceable pieces of an option tag. */
export interface IOptionTagComponents {
    onRenderContainer: (props: ITextProps) => JSX.Element | null;
    onRenderLabel: (props: React.HTMLAttributes<HTMLSpanElement>) => JSX.Element | null;
}

/** The defaults for {@link IOptionTagComponents}. */
export const OptionTagComponents: IOptionTagComponents = {
    onRenderContainer: props => <Text {...props} />,
    onRenderLabel: props => <span {...props} />,
};
