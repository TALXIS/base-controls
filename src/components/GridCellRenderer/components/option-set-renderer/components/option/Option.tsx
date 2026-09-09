import { useMemo } from "react";
import { Text, useTheme } from "@fluentui/react";
import { Theming } from "@legacy";
import { IOptionProps } from "../../OptionSetRenderer";
import { getOptionStyles } from "./styles";

/** One option as a tag: its own colour behind a label in whichever of black or white reads against it. */
export const Option = (props: IOptionProps) => {
    const { option } = props;
    const theme = useTheme();
    //an option with no colour of its own is drawn in the cell's, so a set of them still reads as one kind
    //of thing whatever theme the cell is in
    const backgroundColor = option.color ?? theme.palette.neutralLight;
    const styles = useMemo(
        () => getOptionStyles(backgroundColor, Theming.GetTextColorForBackground(backgroundColor)),
        [backgroundColor]);
    return <Text className={styles.option} title={option.label}>{option.label}</Text>;
};
