import { merge } from "@fluentui/react";
import { DeepPartial } from "@talxis/client-libraries";
import { ITheme } from "@theme";
import { ControlTheme, IFluentDesignState } from "@utils";
import { IGridServiceLocator } from "../../../services";
import { GridCell } from "../../../services/cells";

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

/** The design language a nested control in this cell is given, which is the cell's own theme. */
export const getCellFluentDesignLanguage = (cell: GridCell, services: IGridServiceLocator): IFluentDesignState => {
    const theme = cell.getTheme().getValue();
    const parent = services.get('pcfContext').fluentDesignLanguage as IFluentDesignState | undefined;
    const parentOverrides = parent?.v8FluentOverrides;
    const parentName = getOverrideName(parentOverrides);
    const alignment = cell.getAlignment();
    const cellOverrides = cell.getTheme().getOverrides(theme.semanticColors.bodyBackground);
    const ownOverrides: DeepPartial<ITheme> = {
        ...cellOverrides,
        //everything the override varies by has to appear here.
        id: parentName === undefined ? undefined : ['cell', theme.id, alignment, parentName].join('|'),
        semanticColors: {
            ...cellOverrides.semanticColors,
            //a nested control says nothing about a value the cell already reports on
            errorText: 'transparent'
        },
    };
    //merged only when there is something to merge
    const v8FluentOverrides: any = parentOverrides ? merge({}, ownOverrides, parentOverrides) : ownOverrides;
    //both theme caches key on the id, which a named override would overwrite
    v8FluentOverrides.id = ownOverrides.id;
    return ControlTheme.GenerateFluentDesignLanguage(
        theme.palette.themePrimary,
        theme.semanticColors.bodyBackground,
        theme.semanticColors.bodyText,
        {
            v8FluentOverrides: v8FluentOverrides,
            //a surface drawn over a recoloured cell belongs to the grid, not to the cell
            applicationTheme: parent?.applicationTheme ?? services.get('theme')
        });
};
