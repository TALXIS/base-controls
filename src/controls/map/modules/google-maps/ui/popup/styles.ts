import { ITheme, mergeStyleSets } from "@fluentui/react";

//marks the content inside the frame Google draws
export const GOOGLE_MAPS_UI_POPUP_CLASS = 'talxis-google-maps-popup';

//Google's own classes, styled to match the Gantt's tooltip callout
export const getGoogleMapsUiPopupStyles = (theme: ITheme) => mergeStyleSets({
    popup: {
        color: theme.semanticColors.bodyText,
        selectors: {
            [`:global(.gm-style .gm-style-iw-c:has(.${GOOGLE_MAPS_UI_POPUP_CLASS}))`]: {
                padding: '0 !important',
                borderRadius: theme.effects.roundedCorner6,
                boxShadow: theme.effects.elevation16,
                background: theme.semanticColors.bodyBackground,
            },
            [`:global(.gm-style .gm-style-iw-d:has(.${GOOGLE_MAPS_UI_POPUP_CLASS}))`]: {
                overflow: 'visible !important',
                maxHeight: 'none !important',
            },
        },
    },
});
