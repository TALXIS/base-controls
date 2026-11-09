import { FontWeights, ITheme, mergeStyleSets } from "@fluentui/react";
import { getTintColors } from "@theme";

export const getMarkerUiChipStyles = (theme: ITheme, color: string) => {
    const tint = getTintColors(color, theme, 'solid');
    return mergeStyleSets({
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
            color: tint.text,
            backgroundColor: tint.background,
        },
    });
};
