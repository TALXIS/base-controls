import { mergeStyleSets } from "@fluentui/react";
import { ITheme } from "@theme";

export const getEditColumnsColumnListUiStyles = (theme?: ITheme) => mergeStyleSets({
    editColumnsColumnList: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
    },
    column: {
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        height: 26,
        padding: 5,
        paddingLeft: 10,
        borderRadius: 5,
        cursor: 'grab',
        backgroundColor: theme?.semanticColors.buttonBackgroundPressed,
        ':active': {
            cursor: 'grabbing',
        },
        '> span': {
            flexGrow: 1,
            minWidth: 0,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            fontWeight: 600,
            userSelect: 'none',
        },
    },
    commandBar: {
        height: 24,
        padding: 0,
        '.ms-Button--commandBar': {
            minWidth: 24,
        },
    },
});
