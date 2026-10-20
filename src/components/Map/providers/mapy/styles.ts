import { mergeStyleSets } from "@fluentui/react";

export const getMapyProviderStyles = () => {
    return mergeStyleSets({
        logo: {
            position: 'absolute',
            //bottom left: the corner Mapy.com use themselves, and the one Leaflet leaves empty
            left: 10,
            bottom: 10,
            //over the Leaflet panes and controls
            zIndex: 1000,
            lineHeight: 0
        },
        logoImage: {
            display: 'block',
            //Mapy.com require the logo to be at least 30px tall
            height: 32
        }
    });
};
