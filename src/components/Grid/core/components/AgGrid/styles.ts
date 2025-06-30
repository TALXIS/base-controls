import { ITheme, keyframes, mergeStyleSets } from "@fluentui/react";

const fadeIn = keyframes({
  from: {
    opacity: 0,
  },
  to: {
    opacity: 1,
  },
});

const fadeOut = keyframes({
  from: {
    opacity: 1,
  },
  to: {
    opacity: 0,
  },
});

export const getGridStyles = (theme: ITheme) => {
    return mergeStyleSets({
        agGridRoot: {
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            '--ag-borders': 'none !important',
            '.ag-root-wrapper': {
                maxHeight: '100%',
                '--ag-selected-row-background-color': theme.palette.themePrimary,
                '--ag-range-selection-border-color': theme.palette.themePrimary,
                '--ag-row-hover-color': theme.palette.black,
                '--ag-row-border-color': theme.semanticColors.menuDivider,
                '--ag-cell-horizontal-padding': 0,
                '--ag-input-focus-border-color': theme.semanticColors.inputFocusBorderAlt,
                borderBottom: `1px solid ${theme.semanticColors.menuDivider}`,
                '.ag-row::before': {
                    zIndex: 1
                },
                '.ag-row-hover::before': {
                    opacity: 0.1
                },
                '.ag-row-selected::before': {
                    opacity: 0.2
                }
            },
            '.ag-root': {
                minHeight: 180
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
            '.ag-cell': {
                border: 'none !important',
                borderRadius: 0
            },
            '.ag-cell-highlight': {
                '::after': {
                    content: "''",
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    backgroundColor: `color-mix(in srgb, ${theme.palette.themePrimary}, transparent 70%)`,
                    'view-transition-name': 'cell-highlight',
                }
            },
            '.ag-cell-focus': {
                zIndex: 2,
                '::after': {
                    content: "''",
                    position: 'absolute',
                    inset: '-1px',
                    border: `3px solid ${theme.semanticColors.inputFocusBorderAlt}`,
                    borderRadius: theme.effects.roundedCorner2,
                    pointerEvents: 'none'
                }
            },
            '.ag-cell-focus:has([data-is-valid="false"])': {
                '::after': {
                    borderColor: `${theme.semanticColors.errorIcon} !important`
                }
            },
            '.ag-floating-bottom .ag-row-pinned': {
                borderTop: `1px solid ${theme.semanticColors.menuDivider}`,
                borderBottom: 'none',
            },
            '::view-transition-old(cell-highlight)': {
                animation: `${fadeOut} 0.3s ease-out forwards`
            },
            '::view-transition-new(cell-highlight)': {
                animation: `${fadeIn} 0.3s ease-in forwards`
            }
        }
    })
};