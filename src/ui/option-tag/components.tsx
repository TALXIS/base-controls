import { ITextProps, Text } from "@fluentui/react";

/** The replaceable pieces of an option tag. */
export interface IOptionTagComponents {
    /** Holds the dot and the label. */
    onRenderContainer: (props: ITextProps) => JSX.Element | null;
    /** The dot in the option's own colour. */
    onRenderDot: (props: React.HTMLAttributes<HTMLSpanElement>) => JSX.Element | null;
    onRenderLabel: (props: React.HTMLAttributes<HTMLSpanElement>) => JSX.Element | null;
}

/** The defaults for {@link IOptionTagComponents}. */
export const OptionTagComponents: IOptionTagComponents = {
    onRenderContainer: props => <Text {...props} />,
    onRenderDot: props => <span {...props} />,
    onRenderLabel: props => <span {...props} />,
};
