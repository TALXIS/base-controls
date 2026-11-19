import { mergeStyleSets } from "@fluentui/react";

export const getFormV2UiSectionBodyStyles = () => mergeStyleSets({
    grid: {
        containerType: 'inline-size',
        gap: 10,
        gridAutoRows: 'minmax(10px, auto)',
    },
});
