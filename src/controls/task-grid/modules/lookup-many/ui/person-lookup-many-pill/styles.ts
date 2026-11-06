import { mergeStyleSets } from "@fluentui/react";

export const getLookupManyUiPersonPillStyles = () => mergeStyleSets({
    pill: {
        '&&': { height: 24, padding: 0, boxShadow: 'none', backgroundColor: 'transparent', borderRadius: 12 },
    },
    persona: {
        margin: 0,
    },
});
