import { FontWeights, ITheme, mergeStyleSets } from "@fluentui/react";
import { getTextColorForBackground } from "@theme";

export const getGanttMarkerUiChipStyles = (theme: ITheme, color: string) => mergeStyleSets({
    host: {
        display: 'inline-block',
        pointerEvents: 'auto',
    },
    chip: {
        padding: '2px 8px',
        fontSize: theme.fonts.small.fontSize,
        lineHeight: '16px',
        fontWeight: FontWeights.semibold,
        whiteSpace: 'nowrap',
        borderRadius: theme.effects.roundedCorner2,
        color: getTextColorForBackground(color),
        backgroundColor: color,
    },
});
