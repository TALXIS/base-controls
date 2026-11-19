import { mergeStyleSets } from "@fluentui/react";

export const getFormV2UiSectionStyles = (hidden: boolean) => mergeStyleSets({
    section: {
        ...(hidden ? { display: 'none' } : {}),
    },
});
