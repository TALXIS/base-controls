import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getGridStyles = (theme: ITheme, numOfRecords?: number) => {
    return mergeStyleSets({
        root: {
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            '--height-offset': '64px',
            ':has(.ag-body-horizontal-scroll-viewport[style*="height: 0px"])': {
                '--height-offset': '45px'
            } ,
            '--ag-borders': 'none !important',
            '.ag-root-wrapper': {
                maxHeight: '100%',
                '--ag-input-focus-border-color': 'transparent',
                borderBottom: `1px solid ${theme.semanticColors.bodyDivider}`,
                ':has(.ag-overlay:not(.ag-hidden) .TALXIS__grid__empty-records)': {
                    minHeight: 270
                }
            },
            '.ag-root-wrapper.ag-layout-normal': {
                height: numOfRecords ? `calc(${numOfRecords} * 42px + var(--height-offset))` : undefined,
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
            '.ag-cell-inline-editing': {
                overflow: 'visible',
                top: -1,
                backgroundColor: 'transparent',
                'input': {
                    paddingLeft: 10
                },
                '.TALXIS__error-message__root': {
                    display: 'none'
                }
            },
            '.talxis-cell-align-right': {
                '[class^="cellContent"]': {
                    justifyContent: 'flex-end',
                },
                '.talxis-cell-text, input': {
                    textAlign: 'right'
                },
                'input': {
                    paddingRight: 10
                }
            },
            '.ag-cell-focus:has([data-is-valid="false"])': {
                border: '1px solid red !important;'
            },
            '.TALXIS__combobox__root, [class*="TALXIS__textfield__root"], [class*="TALXIS__tag-picker__root"]': {
                padding: '0px !important'
            }
        }
    })
}