import { mergeStyleSets } from "@fluentui/react";

export const getFormV2UiTabStyles = (hidden: boolean) => {
    return mergeStyleSets({
        tab: {
            gap: 12,
            flexGrow: 1,
            overflow: 'auto',
            gridAutoRows: 'min-content',
            padding: 2,
            paddingTop: 12,
            ...(hidden ? { display: 'none !important' } : {}),
        }
    });
};
