import { ITheme, mergeStyleSets } from '@fluentui/react';

/** Width a form card is drawn at. Wider than the fields card, because a form lays its labels beside the values. */
const CARD_WIDTH = 360;

export const getFormMapCardStyles = (theme: ITheme) => {
    return mergeStyleSets({
        root: {
            width: CARD_WIDTH,
            maxWidth: '100%',
            color: theme.semanticColors.bodyText
        },
        status: {
            display: 'block',
            padding: '8px 0',
            color: theme.semanticColors.bodySubtext
        }
    });
};
