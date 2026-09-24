import { IComboBoxStyles, IDatePickerStyles, ITextFieldStyles, IToggleStyles } from "@fluentui/react";
import { DeepPartial } from "@talxis/client-libraries";
import { ITheme, ThemeBuilder } from "@theme";
import { getJustifyContent, IAlignment } from "@utils";
import { IGridServiceLocator } from "../../services";
import type { IGridCell } from "./GridCell";

//the component styles depend only on the column alignment
const componentStylesByAlignment = new Map<IAlignment, DeepPartial<ITheme>['components']>();

export interface IGridCellThemeParameters {
    services: IGridServiceLocator;
    /** The cell this is the theme of. */
    cell: IGridCell;
}

/** The theme a cell and everything drawn in it takes. */
export interface IGridCellTheme {
    /** What the cell's theme is worked out from, where the grid's own is not what it should be. */
    setSeed(seed: ITheme | undefined): void;
    get(): ITheme;
}

export class GridCellTheme implements IGridCellTheme {
    private _services: IGridServiceLocator;
    private _cell: IGridCell;
    private _seed?: ITheme;

    constructor(parameters: IGridCellThemeParameters) {
        this._services = parameters.services;
        this._cell = parameters.cell;
    }

    public setSeed(seed: ITheme | undefined): void {
        this._seed = seed;
    }

    public get(): ITheme {
        const builder = ThemeBuilder.from({ theme: this._seed ?? this._gridTheme });
        //the row this cell is in, where the grid stripes them and no seed said otherwise
        if (!this._seed) {
            builder.colors.background = this._rowBackground;
        }
        //before the hooks, so what a hook edits is the last word on it
        builder.edit(`cell|${this._cell.getAlignment()}`, theme => this._applyCellStyling(theme));
        this._cells.applyCellThemeHooks(builder, { record: this._cell.getRecord(), columnName: this._cell.getColumnName() });
        return builder.getTheme();
    }

    /** How a control reads in a cell: no border of its own, and the column's alignment. */
    private _applyCellStyling(theme: ITheme): void {
        theme.semanticColors.inputBackground = theme.semanticColors.bodyBackground;
        theme.semanticColors.inputBorder = 'transparent';
        theme.semanticColors.inputBorderHovered = 'transparent';
        theme.semanticColors.focusBorder = 'transparent';
        theme.semanticColors.disabledBorder = 'transparent';
        theme.semanticColors.inputFocusBorderAlt = 'transparent';
        theme.effects.underlined = false;
        theme.components = { ...theme.components, ...this._getComponentStyles() };
    }

    /** What the row this cell is in is drawn on, where the grid's own theme is what it starts from. */
    private get _rowBackground(): string {
        const gridTheme = this._gridTheme;
        if (!this._settings.isZebraEnabled() || this._isEvenRow) {
            return gridTheme.semanticColors.bodyBackground;
        }
        //the faintest step off the surface Fluent has.
        return gridTheme.palette.neutralLighterAlt;
    }

    private get _isEvenRow(): boolean {
        return (this._cell.getNode()?.rowIndex ?? 0) % 2 === 0;
    }

    /** How a control reads in a column of this alignment, which is all the alignment decides. */
    private _getComponentStyles(): DeepPartial<ITheme>['components'] {
        const alignment = this._cell.getAlignment();
        const cached = componentStylesByAlignment.get(alignment);
        if (cached) {
            return cached;
        }
        const styles = {
            'TextField': {
                styles: {
                    field: {
                        textAlign: alignment
                    }
                } as ITextFieldStyles
            },
            'ComboBox': {
                styles: {
                    input: {
                        textAlign: alignment === 'right' ? 'right' : undefined,
                        paddingRight: alignment === 'right' ? 8 : undefined,
                    }
                } as IComboBoxStyles
            },
            'DatePicker': {
                styles: {
                    root: {
                        '.ms-TextField-field': {
                            paddingRight: alignment === 'right' ? 8 : undefined,
                            textAlign: alignment === 'right' ? 'right' : 'left'
                        }
                    } as any
                } as IDatePickerStyles
            },
            'Toggle': {
                styles: {
                    root: {
                        justifyContent: getJustifyContent(alignment)
                    }
                } as IToggleStyles
            }
        } as any;
        componentStylesByAlignment.set(alignment, styles);
        return styles;
    }

    private get _settings() {
        return this._services.get('settings');
    }

    private get _gridTheme(): ITheme {
        return this._services.get('theme');
    }

    private get _cells() {
        return this._services.get('cells');
    }
}
