import { mergeStyleSets } from "@fluentui/react";

export const getSettingsStyles = () => mergeStyleSets({
    tooltipHost: {
        display: 'inline-flex',
        flexShrink: 0,
    },
    //as tall as the header's other parts
    settingsButton: {
        height: 32,
    },
});
