import { Checkbox, ThemeProvider, useTheme } from "@fluentui/react";
import { getGlobalCheckboxStyles } from "./styles";
import { Theming, useRerender, useThemeGenerator } from "@talxis/react-components";
import { useMemo } from "react";
import { useGridInstance } from "../../grid/useGridInstance";
import { useEventEmitter } from "../../../../hooks/useEventEmitter";
import { IDataProviderEventListeners } from "@talxis/client-libraries";


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
    useEventEmitter<IDataProviderEventListeners>(dataset, 'onRecordsSelected', rerender);


    const getCheckBoxState = () => {
        const selectedRecordIds = dataset.getDataProvider().getSelectedRecordIds({ includeGroupRecordIds: true, includeChildrenRecordIds: false });
        if (selectedRecordIds.length === 0) {
            return 'unchecked';
        }
        if (selectedRecordIds.length === dataset.sortedRecordIds.length) {
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

    if (dataset.sortedRecordIds.length === 0 && !dataset.loading) {
        return <></>
    }
    else {
        return (
            <ThemeProvider theme={theme} className={styles.root}>
                {grid.getSelectionType() === 'multiple' &&
                    <Checkbox
                        checked={checkboxState === 'checked'}
                        styles={{
                            checkbox: styles.checkbox
                        }}
                        disabled={dataset.grouping.getGroupBys().length > 0}
                        indeterminate={checkboxState === 'intermediate'}
                        onChange={(e, checked) => onChange(checked)} />
                }
            </ThemeProvider>
        )
    }
};