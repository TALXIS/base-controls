import { IComboBoxStyles, IDatePickerStyles, ITextFieldStyles, IToggleStyles } from "@fluentui/react";
import { DeepPartial } from "@talxis/client-libraries";
import { ITheme, Theming } from "@legacy";
import { getJustifyContent, IAlignment } from "@utils";
import { IGridServiceLocator } from "../../services";
import { GridCell } from "./GridCell";
import { IGridCellThemeColors, IGridCellThemeResult } from "./GridCells";

//the component overrides depend only on the column alignment
const componentOverridesByAlignment = new Map<IAlignment, DeepPartial<ITheme>['components']>();

export interface IGridCellThemeParameters {
    services: IGridServiceLocator;
    /** The cell this is the theme of. */
    cell: GridCell;
}

/** The theme a cell and everything drawn in it takes. */
export class GridCellTheme {
    private _services: IGridServiceLocator;
    private _cell: GridCell;

    constructor(parameters: IGridCellThemeParameters) {
        this._services = parameters.services;
        this._cell = parameters.cell;
    }

    public getValue(): ITheme {
        const result: IGridCellThemeResult = { colors: this._rowColors };
        this._cells.applyCellThemeHooks(result, { record: this._cell.getRecord(), columnName: this._cell.getColumnName() });
        if (result.theme) {
            return result.theme;
        }
        const { primary, background, text } = result.colors;
        //the generator is keyed on the three colours and the override's name
        return Theming.GenerateThemeV8(primary, background, text, this.getOverrides(background));
    }

    /** What a control drawn in this cell looks like, over the colours the cell is drawn in. */
    public getOverrides(background: string): DeepPartial<ITheme> {
        return {
            //a named override is one `Theming.GenerateThemeV8` can cache, and the colours are already its key
            id: `cell|${this._cell.getAlignment()}`,
            semanticColors: {
                inputBorder: 'transparent',
                inputBorderHovered: 'transparent',
                inputBackground: background,
                focusBorder: 'transparent',
                disabledBorder: 'transparent',
                inputFocusBorderAlt: 'transparent',
            },
            effects: {
                underlined: false
            },
            components: this._getComponentOverrides()
        };
    }

    /** The colours of the row this cell is in: the grid's, striped on every other row. */
    private get _rowColors(): IGridCellThemeColors {
        const gridTheme = this._gridTheme;
        return {
            primary: gridTheme.palette.themePrimary,
            background: this._rowBackground,
            text: gridTheme.semanticColors.bodyText,
        };
    }

    /** What the row this cell is in is drawn on. */
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
    private _getComponentOverrides(): DeepPartial<ITheme>['components'] {
        const alignment = this._cell.getAlignment();
        const cached = componentOverridesByAlignment.get(alignment);
        if (cached) {
            return cached;
        }
        const overrides = {
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
        componentOverridesByAlignment.set(alignment, overrides);
        return overrides;
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
