import { Checkbox, ThemeProvider, useTheme } from "@fluentui/react";
import { useGridInstance } from "../../../../hooks/useGridInstance";
import { getGlobalCheckboxStyles } from "./styles";
import { Theming, useRerender, useThemeGenerator } from "@talxis/react-components";
import { Grid2 } from "../../../../model/Grid";
import { IHeaderParams } from "@ag-grid-community/core";
import { useMemo } from "react";


export const GlobalCheckBox = (props: IHeaderParams) => {
    const grid: Grid2 = useGridInstance() as any;
    const api = props.api;
    const dataset = grid.getDataset();
    const context = grid.getPcfContext();
    const baseTheme = useTheme();
    const primaryColor = baseTheme.palette.themePrimary;
    const backgroundColor = baseTheme.semanticColors.bodyBackground;
    const textColor = Theming.GetTextColorForBackground(backgroundColor);
    const v8FluentOverrides = context.fluentDesignLanguage?.v8FluentOverrides;
    const theme = useThemeGenerator(primaryColor, backgroundColor, textColor, v8FluentOverrides);
    const styles = getGlobalCheckboxStyles(theme);
    const selection = grid.getSelection();
    const rerender = useRerender();

    useMemo(() => {
        dataset.addEventListener('onRecordsSelected', () => {
            rerender();
        })
    }, []);

    const getCheckBoxState = () => {
        if (selection.areAllRecordsSelected()) {
            return 'checked';
        }
        if (dataset.getSelectedRecordIds().length > 0) {
            return 'intermediate';
        }
        return 'unchecked';
    }

    const onChange = (checked?: boolean) => {
        if(checked) {
            dataset.setSelectedRecordIds(dataset.sortedRecordIds);
        }
        else {
            dataset.clearSelectedRecordIds();
        }
    }
    const checkboxState = getCheckBoxState();

    if (dataset.sortedRecordIds.length === 0) {
        return <></>
    }
    return (
        <ThemeProvider theme={theme} className={styles.root}>
            {grid.getSelectionType() === 'multiple' &&
                <Checkbox
                    checked={checkboxState === 'checked'}
                    styles={{
                        checkbox: styles.checkbox
                    }}
                    indeterminate={checkboxState === 'intermediate'}
                    onChange={(e, checked) => onChange(checked)} />
            }
        </ThemeProvider>
    )
};