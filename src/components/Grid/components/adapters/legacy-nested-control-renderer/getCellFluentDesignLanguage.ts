import { IComboBoxStyles, IDatePickerStyles, ITextFieldStyles, IToggleStyles, merge } from "@fluentui/react";
import { DeepPartial, IColumn } from "@talxis/client-libraries";
import { ITheme } from "@legacy";
import { ControlTheme, getJustifyContent, IAlignment, IFluentDesignState } from "@utils";

//the component overrides depend only on the column alignment, so there are three of them in the whole
//application - they used to be rebuilt, and deep-merged, per cell per render
const componentOverridesByAlignment = new Map<IColumn['alignment'] | undefined, DeepPartial<ITheme>['components']>();

const getComponentOverrides = (columnAlignment: IColumn['alignment']) => {
    const alignment: IAlignment = columnAlignment ?? 'left';
    const cached = componentOverridesByAlignment.get(columnAlignment);
    if (cached) {
        return cached;
    }
    const overrides = {
        'TextField': {
            styles: {
                field: {
                    textAlign: columnAlignment
                }
            } as ITextFieldStyles
        },
        'ComboBox': {
            styles: {
                input: {
                    textAlign: columnAlignment === 'right' ? 'right' : undefined,
                    paddingRight: columnAlignment === 'right' ? 8 : undefined,
                }
            } as IComboBoxStyles
        },
        'DatePicker': {
            styles: {
                root: {
                    '.ms-TextField-field': {
                        paddingRight: columnAlignment === 'right' ? 8 : undefined,
                        textAlign: columnAlignment === 'right' ? 'right' : 'left'
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
    };
    componentOverridesByAlignment.set(columnAlignment, overrides as any);
    return overrides as any;
};

/**
 * A stable name for a theme override, from its content.
 *
 * `undefined` means the override cannot be named, and so cannot be cached under one. That covers a style
 * *function*, which is part of what an override does to a theme and which no serialisation can tell from
 * another - naming two of those alike would hand the second one the first one's theme.
 */
const getOverrideName = (override?: object): string | undefined => {
    if (!override || Object.keys(override).length === 0) {
        return '';
    }
    //an override that names itself is taken at its word, the same as everywhere else
    const declaredName = (override as ITheme).id;
    if (declaredName) {
        return declaredName;
    }
    let isNameable = true;
    try {
        const name = JSON.stringify(override, (_key, value) => {
            if (typeof value === 'function') {
                isNameable = false;
            }
            return value;
        });
        return isNameable ? name : undefined;
    }
    catch {
        //a cycle, so there is nothing to name it by
        return undefined;
    }
};

export interface ICellFluentDesignLanguageParameters {
    /** The theme this cell is drawn in. */
    theme: ITheme;
    columnAlignment: IColumn['alignment'];
    /** What the control would have been given, which is the host's own. */
    parent?: IFluentDesignState;
}

/**
 * The design language a control is given inside a cell.
 *
 * A control on a form draws its own borders and its own background; in a cell the row has already drawn
 * both, so they go transparent and the cell's background stands in for the input's. The alignment cannot
 * reach a control through a theme's colours, so it arrives as component overrides.
 */
export const getCellFluentDesignLanguage = (parameters: ICellFluentDesignLanguageParameters): IFluentDesignState => {
    const { theme, columnAlignment, parent } = parameters;
    const parentOverrides = parent?.v8FluentOverrides;
    const parentName = getOverrideName(parentOverrides);
    const ownOverrides: DeepPartial<ITheme> = {
        //everything the override varies by has to appear here: the theme caches key on this id, so anything
        //left out would serve another cell's theme. `undefined` is how a cell says it cannot be cached
        id: parentName === undefined ? undefined : ['cell', theme.id, columnAlignment ?? '', parentName].join('|'),
        semanticColors: {
            inputBorder: 'transparent',
            inputBorderHovered: 'transparent',
            inputBackground: theme.semanticColors.bodyBackground,
            focusBorder: 'transparent',
            disabledBorder: 'transparent',
            inputFocusBorderAlt: 'transparent',
            errorText: 'transparent'
        },
        effects: {
            underlined: false
        },
        components: getComponentOverrides(columnAlignment)
    };
    //merged only when there is something to merge: only a grid inside another grid's cell inherits an
    //override, and this used to run two deep merges regardless
    const v8FluentOverrides: any = parentOverrides ? merge({}, ownOverrides, parentOverrides) : ownOverrides;
    //an override that names itself would otherwise write its own id over the one computed above, and both
    //theme caches key on that id - so a grid rendered inside another grid's cell, which inherits that
    //cell's named override, would serve every one of its own cells the same theme
    v8FluentOverrides.id = ownOverrides.id;
    return ControlTheme.GenerateFluentDesignLanguage(
        theme.palette.themePrimary,
        theme.semanticColors.bodyBackground,
        theme.semanticColors.bodyText,
        { v8FluentOverrides: v8FluentOverrides, applicationTheme: parent?.applicationTheme });
};
