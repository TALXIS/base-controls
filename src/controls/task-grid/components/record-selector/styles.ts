import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getRecordSelectorStyles = (theme: ITheme) => mergeStyleSets({
    root: {
        height: 285,
        width: 300,
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
    recordList: {
        borderBottom: `1px solid ${theme.semanticColors.bodyDivider}`,
    },
    recordButton: {
        width: '100%',
        height: 36,
        justifyContent: 'flex-start',
        textAlign: 'left',
    },
});
