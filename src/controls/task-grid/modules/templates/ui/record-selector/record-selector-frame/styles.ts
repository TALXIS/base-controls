import { mergeStyleSets } from "@fluentui/react";
import { RECORD_SELECTOR_WIDTH } from "../constants";

export const getTemplatesUiRecordSelectorFrameStyles = () => mergeStyleSets({
    root: {
        height: 285,
        width: RECORD_SELECTOR_WIDTH,
        '.ms-TextField, .ms-TextField-fieldGroup': {
            width: '100%',
        },
    },
    header: {
        '&&': { padding: 8, marginBottom: 0 },
    },
    //the only part in the header
    quickFind: {
        '&&': { flex: '1 1 100%' },
    },
});
