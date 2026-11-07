import { ITheme, mergeStyleSets } from "@fluentui/react";

//Leaflet's own classes, styled to match the Gantt's tooltip callout
export const getLeafletUiPopupStyles = (theme: ITheme) => mergeStyleSets({
    popup: {
        selectors: {
            '& .leaflet-popup-content-wrapper': {
                padding: 0,
                borderRadius: theme.effects.roundedCorner6,
                boxShadow: theme.effects.elevation16,
                background: theme.semanticColors.bodyBackground,
                color: theme.semanticColors.bodyText,
            },
            '& .leaflet-popup-content': {
                margin: 0,
                lineHeight: 'normal',
            },
            '& .leaflet-popup-tip': {
                background: theme.semanticColors.bodyBackground,
                boxShadow: theme.effects.elevation8,
            },
            '& a.leaflet-popup-close-button': {
                top: 10,
                right: 8,
                color: theme.palette.neutralSecondary,
            },
        },
    },
});
