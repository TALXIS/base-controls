import { Checkbox, ThemeProvider, useTheme } from "@fluentui/react";
import { useContext } from "react";
import { useGridInstance } from "../../../../hooks/useGridInstance";
import { getGlobalCheckboxStyles } from "./styles";
import { AgGridContext } from "../../../AgGrid/context";
import { Theming, useThemeGenerator } from "@talxis/react-components";

interface IGlobalCheckBox {
    checkboxState: 'checked' | 'unchecked' | 'intermediate'
}

export const GlobalCheckBox = (props: IGlobalCheckBox) => {
    const grid = useGridInstance();
    const baseTheme = useTheme();
    const theme = useThemeGenerator(
        baseTheme.palette.themePrimary,
        baseTheme.semanticColors.bodyBackground,
        Theming.GetTextColorForBackground(baseTheme.semanticColors.bodyBackground),
        //@ts-ignore - typings
        grid.pcfContext.fluentDesignLanguage?.v8FluentOverrides
    )
    const styles = getGlobalCheckboxStyles(theme);
    const selection = grid.selection;
    const agGrid = useContext(AgGridContext);
    const checkboxState = props.checkboxState;

    if (grid.dataset.sortedRecordIds.length === 0) {
        return <></>
    }
    return (
        <ThemeProvider theme={theme} className={styles.root}>
            {selection.type === 'multiple' &&
                <Checkbox
                    checked={checkboxState === 'checked'}
                    styles={{
                        checkbox: styles.checkbox
                    }}
                    indeterminate={checkboxState === 'intermediate'}
                    onChange={(e, checked) => {
                        if (checked) {
                            selection.selectAll();
                        }
                        else {
                            selection.clear();
                        }
                        agGrid.refreshRowSelection();
                    }} />
            }
        </ThemeProvider>
    )
};