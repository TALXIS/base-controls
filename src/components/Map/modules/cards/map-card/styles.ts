import { ITheme, mergeStyleSets } from '@fluentui/react';

/** Width a card is drawn at. Matches what the legacy MapPicker's info window used. */
const CARD_WIDTH = 320;

export const getMapCardStyles = (theme: ITheme) => {
    return mergeStyleSets({
        root: {
            minWidth: 220,
            maxWidth: CARD_WIDTH,
            color: theme.semanticColors.bodyText
        },
        title: {
            display: 'block',
            marginBottom: 6,
            fontWeight: 600,
            fontSize: theme.fonts.mediumPlus.fontSize
        },
        fields: {
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            columnGap: 10,
            rowGap: 4,
            fontSize: theme.fonts.small.fontSize
        },
        fieldLabel: {
            color: theme.semanticColors.bodySubtext,
            whiteSpace: 'nowrap'
        },
        fieldValue: {
            overflowWrap: 'anywhere'
        },
        actions: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            marginTop: 10
        },
        empty: {
            fontSize: theme.fonts.small.fontSize,
            color: theme.semanticColors.bodySubtext
        }
    });
};
