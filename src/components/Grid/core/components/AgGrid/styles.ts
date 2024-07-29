import { ITheme, mergeStyleSets } from "@fluentui/react";

const getGridHeight = (numOfRecords: number, useContainerAsHeight: boolean) => {
    if(useContainerAsHeight) {
        return '100%';
    }
    return `calc(${numOfRecords} * 42px + var(--height-offset))`
}

export const getGridStyles = (theme: ITheme, numOfRecords: number, useContainerAsHeight: boolean) => {
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
                '--ag-selected-row-background-color': theme.palette.themeLighter,
                '--ag-range-selection-border-color': theme.palette.themePrimary,
                borderBottom: `1px solid ${theme.semanticColors.bodyDivider}`,
                ':has(.ag-overlay:not(.ag-hidden) .TALXIS__grid__empty-records), :has(.ag-center-cols-container:empty)': {
                    minHeight: 270
                }
            },
            '.ag-root-wrapper.ag-layout-normal': {
                height: getGridHeight(numOfRecords, useContainerAsHeight)
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

                '*:not(.ms-ComboBox)>input': {
                    paddingLeft: 10
                },
                '.ms-ComboBox>input': {
                    paddingLeft: 2
                },
                '.talxis__lookupControl': {
                    '.ms-BasePicker-itemsWrapper': {
                        padding: 0,
                        '.ms-CommandBar': {
                            height: '100%'
                        }
                    },
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
        }
    })
}