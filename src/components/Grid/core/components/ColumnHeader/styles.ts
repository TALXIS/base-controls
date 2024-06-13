import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getColumnHeaderStyles = (theme: ITheme) => {
    return mergeStyleSets({
        root: {
            width: '100%',
            textAlign: 'left',
            height: 42,
            paddingLeft: 10,
            paddingRight: 10,
            '.ms-Button-flexContainer': {
                justifyContent: 'flex-start',
                gap: 2,
                pointerEvents: 'none'
            }
        },
        labelWrapper: {
            flex: 1,
            display: 'flex',
            minWidth: 0
        },
        label: {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            cursor: 'pointer',
        },
        requiredSymbol: {
            color: theme.semanticColors.errorIcon,
            position: 'relative',
            top: 4,
            left: 2
        },
        filterSortIcons: {
            display: 'flex',
            gap: 2
        },
        editIcon: {
            marginRight: 3
        }
    })
}