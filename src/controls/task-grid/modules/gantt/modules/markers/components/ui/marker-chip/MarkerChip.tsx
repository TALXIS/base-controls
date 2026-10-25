import { useMemo } from "react";
import { useTheme } from "@fluentui/react";
import { TooltipHost } from "@ui";
import { getMarkerChipStyles } from "./styles";

export interface IMarkerChipProps {
    text: string;
    /** What the chip's tooltip says, such as the date. */
    title: string;
    color?: string;
    /** A diamond rather than a labelled chip. */
    isMilestone?: boolean;
}

/** A marker's label on the timeline's scale. */
export const MarkerChip = (props: IMarkerChipProps) => {
    const theme = useTheme();
    const styles = useMemo(() => getMarkerChipStyles(theme, props.color ?? theme.palette.themePrimary), [theme, props.color]);

    return <TooltipHost content={props.isMilestone ? `${props.text} – ${props.title}` : props.title}>
        {props.isMilestone ? <div className={styles.milestone} /> : <div className={styles.chip}>{props.text}</div>}
    </TooltipHost>;
};
