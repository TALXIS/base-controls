import { ITheme, mergeStyleSets } from "@fluentui/react";
import { IColumn } from "@talxis/client-libraries";
import { getJustifyContent } from "../../grid/styles";

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

export const getColumnHeaderContextualMenuStyles = (theme: ITheme) => {
    return mergeStyleSets({
        item: {
            '& .is-checked': {
                backgroundColor: theme.semanticColors.buttonBackgroundHovered,
                fontWeight: 600
            }
        }
    });
};

export const filterCalloutStyles = mergeStyleSets({
    root: {
        minHeight: 200,
        padding: 16,
        '.ms-Callout-main': {
            display: 'flex',
            flexDirection: 'column',
            minHeight: 180,
            gap: 10
        },
        '.TALXIS__combobox__root, [class*="TALXIS__textfield__root"], [class*="TALXIS__tag-picker__root"]': {
            padding: `0x !important`
        }
    },
    title: {
        fontWeight: 600,
        flexGrow: 1
    },
    header: {
        display: 'flex',
        'i': {
            fontSize: 12
        }
    },
    valueControlsContainer: {
        flexGrow: 1
    },
    datasetColumnFilteringRoot: {
        flexGrow: 1
    },
    datasetColumnFilteringButtons: {
        justifyContent: 'flex-end',
    }
});