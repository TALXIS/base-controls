import { ITheme, mergeStyleSets } from "@fluentui/react";
import { IColumn } from "@talxis/client-libraries";
import { getJustifyContent } from "../Cell/styles";

export const getColumnHeaderStyles = (theme: ITheme, columnAlignment: Required<IColumn['alignment']>) => {
    return mergeStyleSets({
        root: {
            width: '100%',
            textAlign: 'left',
            height: 42,
            paddingLeft: 10,
            paddingRight: 10,
            justifyContent: 'flex-start',
            '.ms-Button-flexContainer': {
                justifyContent: 'flex-start',
                width: '100%',
                gap: 2,
                pointerEvents: 'none'
            }
        },
        labelWrapper: {
            flex: 1,
            display: 'flex',
            minWidth: 0,
            justifyContent: getJustifyContent(columnAlignment)
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