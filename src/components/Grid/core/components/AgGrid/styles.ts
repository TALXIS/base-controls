import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getGridStyles = (theme: ITheme) => {
    return mergeStyleSets({
        root: {
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            '--ag-borders': 'none !important',
            '.ag-root-wrapper': {
                //minHeight: 600,
                borderBottom: `1px solid ${theme.semanticColors.bodyDivider}`
            },
            '.ag-body': {
                borderTop: `1px solid ${theme.semanticColors.bodyDivider}`
            },
            '.ag-header-viewport': {
                backgroundColor: `${theme.semanticColors.bodyBackground}`
            },
            '.ag-center-cols-container': {
                minWidth: '100%',
            },
            '.ag-layout-auto-height .ag-center-cols-clipper, .ag-layout-auto-height .ag-center-cols-container, .ag-layout-print .ag-center-cols-clipper, .ag-layout-print .ag-center-cols-container': {
                minHeight: '42px !important'
            },
            '.ag-header-cell': {
                paddingLeft: 0,
                paddingRight: 0,
                backgroundColor: `${theme.semanticColors.bodyBackground} !important`
            },
            '.ag-cell-focus:has([data-is-valid="false"])': {
                border: '1px solid red !important;'
            },
            ':global(.TALXIS__combobox__root, [class*="TALXIS__textfield__root"], [class*="TALXIS__tag-picker__root"])': {
                padding: '0px !important'
            }
        }
    })
}