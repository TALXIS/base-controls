import { useMemo } from "react";
import { Text, useTheme } from "@fluentui/react";
import { getOptionTagStyles } from "./styles";

export interface IOptionTagProps {
    label?: string;
    /** The colour it is drawn in. Without one it is drawn in the colour of whatever holds it. */
    color?: string;
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

    return <Text className={styles.optionTag} title={props.label}>
        <span className={styles.label}>{props.label}</span>
    </Text>;
};
