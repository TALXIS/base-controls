import { IComboBoxStyles, IDatePickerStyles, ITextFieldStyles, IToggleStyles, merge } from "@fluentui/react";
import { DeepPartial, IColumn } from "@talxis/client-libraries";
import { ITheme } from "@legacy";
import { ControlTheme, getJustifyContent, IAlignment, IFluentDesignState } from "@utils";

//the component overrides depend only on the column alignment
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

/** A stable name for a theme override, from its content. */
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

/** The design language a control is given inside a cell. */
export const getCellFluentDesignLanguage = (parameters: ICellFluentDesignLanguageParameters): IFluentDesignState => {
    const { theme, columnAlignment, parent } = parameters;
    const parentOverrides = parent?.v8FluentOverrides;
    const parentName = getOverrideName(parentOverrides);
    const ownOverrides: DeepPartial<ITheme> = {
        //everything the override varies by has to appear here.
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
    //merged only when there is something to merge
    const v8FluentOverrides: any = parentOverrides ? merge({}, ownOverrides, parentOverrides) : ownOverrides;
    //both theme caches key on the id, which a named override would overwrite
    v8FluentOverrides.id = ownOverrides.id;
    return ControlTheme.GenerateFluentDesignLanguage(
        theme.palette.themePrimary,
        theme.semanticColors.bodyBackground,
        theme.semanticColors.bodyText,
        { v8FluentOverrides: v8FluentOverrides, applicationTheme: parent?.applicationTheme });
};
