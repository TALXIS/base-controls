import { mergeStyleSets } from "@fluentui/react";

export const getPersonLookupManyPillStyles = () => mergeStyleSets({
    pill: {
        '&&': { height: 24, padding: 0, boxShadow: 'none', backgroundColor: 'transparent', borderRadius: 12 },
    },
});
