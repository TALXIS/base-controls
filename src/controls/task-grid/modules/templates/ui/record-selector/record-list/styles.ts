import { ITheme, mergeStyleSets } from "@fluentui/react";
import { RECORD_LIST_ITEM_HEIGHT } from "../constants";

export const getTemplatesUiRecordListStyles = (theme: ITheme) => mergeStyleSets({
    root: {
        borderBottom: `1px solid ${theme.semanticColors.bodyDivider}`,
    },
    record: {
        width: '100%',
        height: RECORD_LIST_ITEM_HEIGHT,
        justifyContent: 'flex-start',
        textAlign: 'left',
    },
});
