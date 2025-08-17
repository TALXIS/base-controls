import { Checkbox, ThemeProvider, useTheme } from "@fluentui/react";
import { getGlobalCheckboxStyles } from "./styles";
import { Theming, useRerender, useThemeGenerator } from "@talxis/react-components";
import { useMemo } from "react";
import { useGridInstance } from "../../grid/useGridInstance";


export const RecordSelectionCheckBox = () => {
    const grid = useGridInstance();
    const dataset = grid.getDataset();
    const context = grid.getPcfContext();
    const baseTheme = useTheme();
    const primaryColor = baseTheme.palette.themePrimary;
    const backgroundColor = baseTheme.semanticColors.bodyBackground;
    const textColor = Theming.GetTextColorForBackground(backgroundColor);
    const v8FluentOverrides = context.fluentDesignLanguage?.v8FluentOverrides;
    const theme = useThemeGenerator(primaryColor, backgroundColor, textColor, v8FluentOverrides);
    const styles = getGlobalCheckboxStyles(theme);
    const rerender = useRerender();

    useMemo(() => {
        dataset.addEventListener('onRecordsSelected', () => rerender());
        dataset.addEventListener('onNewDataLoaded', () => rerender());
    }, []);

    const getCheckBoxState = () => {
        const selectedRecordIds = dataset.getDataProvider().getSelectedRecordIds();
        const selectedRecordIdsWithChildren = dataset.getDataProvider().getSelectedRecordIds(true);
        if (selectedRecordIdsWithChildren.length === 0) {
            return 'unchecked';
        }
        if(selectedRecordIds.length === dataset.sortedRecordIds.length) {
            return 'checked';
        }
        return 'intermediate'; //indeterminate state, when some records are selected but not all
    }

    const onChange = (checked?: boolean) => {
        if (checked) {
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