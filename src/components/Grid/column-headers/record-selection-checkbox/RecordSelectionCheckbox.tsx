import { Checkbox, ThemeProvider, useTheme } from "@fluentui/react";
import { getGlobalCheckboxStyles } from "./styles";
import { Theming, useRerender, useThemeGenerator } from "@talxis/react-components";
import { useGridInstance } from "../../grid/useGridInstance";
import { useEventEmitter } from "../../../../hooks/useEventEmitter";
import { IDataProviderEventListeners } from "@talxis/client-libraries";


export const RecordSelectionCheckBox = () => {
    const grid = useGridInstance();
    const dataset = grid.getDataset();
    const styles = getGlobalCheckboxStyles();
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
            <div className={styles.root}>
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
            </div>
        )
    }
};