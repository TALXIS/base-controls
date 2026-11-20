import { ITheme, mergeStyleSets } from '@fluentui/react';

/** Width a card is drawn at, matching the built-in one so a map does not resize as pins are clicked. */
const CARD_WIDTH = 320;

export const getAdaptiveMapCardStyles = (theme: ITheme) => {
    return mergeStyleSets({
        root: {
            minWidth: 220,
            maxWidth: CARD_WIDTH,
            color: theme.semanticColors.bodyText,
            //Adaptive Cards paints its own background, which would otherwise sit on the popup's
            '.ac-adaptiveCard': {
                backgroundColor: 'transparent !important',
                padding: '0 !important'
            }
        }
    });
};
