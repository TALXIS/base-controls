import { ITheme, mergeStyleSets } from "@fluentui/react";
import { IColumn } from "@talxis/client-libraries";

/**
 * How tall the rows area stays when there is nothing in it.
 *
 * The "no records" overlay is centred over the whole grid, pinned rows included, so the rows have to keep
 * enough height that the overlay is drawn inside them rather than over the row that adds an item. Which is
 * what the `minHeight` on the root used to buy: with the grid sized to its rows, the floor has to be on the
 * rows themselves - a floor on the root only adds empty space underneath them.
 */
const EMPTY_ROWS_AREA_HEIGHT = 135;

/**
 * Sizes the grid to its rows, up to `maxVisibleRows`, without anything having to measure it.
 *
 * The cap goes on the rows area alone — the header, the pinned rows and the scrollbars are its siblings,
 * so the grid ends up as tall as all of them together and nothing has to know how tall the parts are. The
 * rows area is the only one of them that scrolls, which is why the cap belongs there rather than on
 * anything around it: capping a box that does not scroll only clips it.
 *
 * A cap in rows is a cap in pixels because the row area always carries its full height, every row of it,
 * whether or not the rows are rendered — the grid writes that height itself.
 *
 * Only used when no `Height` was given. With one, the grid is that tall and the rows take what is left.
 */
const getAutoHeightStyles = (rowHeight: number, maxVisibleRows: number) => {
    return {
        //as tall as what is in it, which is the whole of the auto height
        height: 'auto',
        //ag-grid gives this a height of 0 and has it grow into its parent, which collapses the grid to
        //nothing the moment the parent is sized by its contents instead of the other way round
        '.ag-root-wrapper-body.ag-layout-normal': {
            height: 'auto'
        },
        //capped on both: the viewport is what scrolls, so the cap has to be there for it to know it has
        //something to scroll - but the box around it is sized by the tallest thing in it, and the fake
        //scrollbar alongside the rows carries the height of every row there is. Left uncapped, showing
        //that scrollbar is what stretches the grid to the full length of its list
        '.ag-body, .ag-body-viewport': {
            maxHeight: rowHeight * maxVisibleRows
        },
        '.ag-body-viewport': {
            //never past the cap: a min-height beats a max-height, so a list told to show fewer rows than
            //the empty state needs would grow to fit the empty state instead of honouring the cap
            minHeight: Math.min(EMPTY_ROWS_AREA_HEIGHT, rowHeight * maxVisibleRows)
        }
    };
};

export const getGridStyles = (theme: ITheme, height?: string | null, rowHeight: number = 42, maxVisibleRows: number = 15) => {
    return mergeStyleSets({
        gridRoot: {
            //the "no records" overlay is centred over the whole grid, pinned rows included, so the grid
            //needs to stay tall enough that the overlay clears them instead of being drawn over the top
            minHeight: 220,
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
            '.ag-body': {
                borderTop: `1px solid ${theme.semanticColors.menuDivider}`
            },
            '.ag-header-viewport': {
                backgroundColor: `${theme.semanticColors.bodyBackground}`
            },
            '.ag-center-cols-container': {
                minWidth: '100%',
            },
            '.ag-header-cell': {
                paddingLeft: 0,
                paddingRight: 0,
                backgroundColor: `${theme.semanticColors.bodyBackground} !important`
            },
            '.ag-cell': {
                border: 'none !important',
                borderRadius: 0,
                overflow: 'hidden'
            },
            '.ag-cell-wrapper:has([data-is-loading="true"])': {
                height: '100%'
            },
            '.ms-Checkbox.is-disabled .ms-Checkbox-checkbox': {
                borderColor: `${theme.semanticColors.disabledBorder} !important`
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
            '.ag-overlay-loading-wrapper': {
                backdropFilter: 'blur(1px)'
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
            //the grid is either as tall as it was told to be, or as tall as its rows
            ...(height ? { height: height } : getAutoHeightStyles(rowHeight, maxVisibleRows))
        }
    })
};

export const getJustifyContent = (columnAlignment: Required<IColumn['alignment']>) => {
    switch (columnAlignment) {
        case 'left': {
            return 'flex-start'
        }
        case 'center': {
            return 'center'
        }
        case 'right': {
            return 'flex-end'
        }
    }
}
