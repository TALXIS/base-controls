import { RowClassParams } from "@ag-grid-community/core";
import { ITheme, mergeStyleSets } from "@fluentui/react";
import { IRecord } from "@talxis/client-libraries";

const getGridHeight = (height: string) => {
    if(height === '100%') {
        return height;
    }
    return `calc(${height} + var(--height-offset))`;
}

export const getGridStyles = (theme: ITheme, height: string) => {
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
                '--ag-selected-row-background-color': theme.palette.black,
                '--ag-range-selection-border-color': theme.palette.themePrimary,
                '--ag-row-hover-color': theme.palette.black,
                '--ag-row-border-color': theme.semanticColors.menuDivider,
                '--ag-cell-horizontal-padding': 0,
                borderBottom: `1px solid ${theme.semanticColors.menuDivider}`,
                '.ag-row::before': {
                    zIndex: 1
                },
                '.ag-row-hover::before': {
                    opacity: 0.05
                },
                '.ag-row-selected::before': {
                    opacity: 0.1
                }
            },
            '.ag-root-wrapper.ag-layout-normal': {
                height: getGridHeight(height)
            },
            '.ag-body': {
                borderTop: `1px solid ${theme.semanticColors.menuDivider}`
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
            '.ag-cell-focus:has([data-is-valid="false"])': {
                border: '1px solid red !important;'
            },
            '.ag-cell-focus:not(.ag-cell-range-selected):focus-within': {
                borderColor: `${theme.palette.themePrimary} !important`
            }
        }
    })
}
export const getRowStyle = (params: RowClassParams<IRecord, any>) => {
    if(!params.node.isSelected()) {
        return {
            border: 'none'
        }
    }
}