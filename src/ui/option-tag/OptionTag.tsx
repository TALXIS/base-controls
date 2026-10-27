import { useMemo } from "react";
import { mergeStyles, useTheme } from "@fluentui/react";
import { IOptionTagComponents, OptionTagComponents } from "./components";
import { getOptionTagStyles } from "./styles";

export interface IOptionTagProps {
    label?: string;
    /** The colour it is drawn in. Without one it is drawn in the colour of whatever holds it. */
    color?: string;
    /** Placement from what holds it, over the tag's own. */
    className?: string;
    components?: Partial<IOptionTagComponents>;
}

/**
 * One option as a tag: its label over a tint of its own colour.
 *
 * What draws an option wherever one is drawn - a cell of the grid, the field a choice is made in - so a
 * set of them reads the same however it was reached.
 */
export const OptionTag = (props: IOptionTagProps) => {
    const theme = useTheme();
    //an option with no colour of its own is drawn in the surface's, so a set of them still reads as one
    //kind of thing whatever theme it is in
    const color = props.color || theme.palette.neutralSecondary;
    const styles = useMemo(() => getOptionTagStyles(theme, color), [theme, color]);
    const components = { ...OptionTagComponents, ...props.components };

    return components.onRenderContainer({
        className: mergeStyles(styles.optionTag, props.className),
        children: <>
            {components.onRenderDot({ className: styles.dot })}
            {components.onRenderLabel({ className: styles.label, title: props.label, children: props.label })}
        </>,
    });
};
