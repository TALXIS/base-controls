import type { ITheme } from "@fluentui/react";
import type { StylesConfig } from "react-select";
import { CELL_VALUE_PADDING } from "../../../constants";

export const getLookupManyUiSelectStyles = (theme: ITheme, isMenuPopup: boolean): StylesConfig<ComponentFramework.EntityReference, true, never> => ({
    control: base => isMenuPopup
        ? { ...base, minHeight: 32, padding: `2px ${CELL_VALUE_PADDING}px`, border: 'none', borderRadius: 0, background: theme.palette.neutralLighter, boxShadow: 'none', cursor: 'text' }
        : { ...base, minHeight: 0, padding: `4px ${CELL_VALUE_PADDING}px`, border: 'none', borderBottom: `1px solid ${theme.palette.neutralLight}`, borderRadius: 0, background: 'none', boxShadow: 'none' },
    valueContainer: base => ({ ...base, gap: 4, padding: 0 }),
    input: base => ({ ...base, margin: 0, padding: 0, color: theme.semanticColors.inputText }),
    menu: base => isMenuPopup
        ? { ...base, zIndex: 1, margin: 0, borderRadius: 0, background: theme.semanticColors.bodyBackground, boxShadow: theme.effects.elevation8 }
        : { ...base, position: 'static', margin: 0, boxShadow: 'none', borderRadius: 0, background: 'none' },
    menuList: base => ({ ...base, maxHeight: 240 }),
    option: (base, state) => ({ ...base, paddingLeft: CELL_VALUE_PADDING, paddingRight: CELL_VALUE_PADDING, cursor: 'pointer', color: theme.semanticColors.bodyText, backgroundColor: state.isFocused ? theme.palette.neutralLighter : 'transparent' }),
    noOptionsMessage: base => ({ ...base, paddingLeft: CELL_VALUE_PADDING, paddingRight: CELL_VALUE_PADDING, textAlign: 'left', color: theme.semanticColors.bodySubtext }),
    loadingMessage: base => ({ ...base, paddingLeft: CELL_VALUE_PADDING, paddingRight: CELL_VALUE_PADDING, textAlign: 'left', color: theme.semanticColors.bodySubtext }),
});
