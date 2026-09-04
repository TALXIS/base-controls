import { Checkbox, ThemeProvider, useTheme } from "@fluentui/react";
import { getGlobalCheckboxStyles } from "./styles";
import { Theming, useRerender, useThemeGenerator } from "@legacy";
import { useGridService } from "@components/Grid/grid/useGridService";
import { useEventEmitter } from "@hooks/useEventEmitter";
import { IDataProviderEventListeners } from "@talxis/client-libraries";
import { IGridSelectionState } from "../../GridSelection";


export const RecordSelectionCheckBox = () => {
    const selection = useGridService('selection')!;
    const provider = useGridService('provider');
    const styles = getGlobalCheckboxStyles();
    const rerender = useRerender();
    useEventEmitter<IDataProviderEventListeners>(provider, 'onRecordsSelected', rerender);


    const getCheckBoxState = (): IGridSelectionState => {
        const selectedRecordIds = provider.getSelectedRecordIds({ includeGroupRecordIds: true, includeChildrenRecordIds: false });
        if (selectedRecordIds.length === 0) {
            return 'unchecked';
        }
        if (selectedRecordIds.length === provider.getSortedRecordIds().length) {
            return 'checked';
        }
        return 'indeterminate';
    }

    const onChange = (checked?: boolean) => {
        if (checked) {
            provider.setSelectedRecordIds(provider.getSortedRecordIds());
        }
        else {
            provider.clearSelectedRecordIds();
        }
    }
    const checkboxState = getCheckBoxState();

    if (provider.getSortedRecordIds().length === 0 && !provider.isLoading()) {
        return <></>
    }
    else {
        return (
            <div className={styles.root}>
                {selection.getMode() === 'multiple' &&
                    <Checkbox
                        checked={checkboxState === 'checked'}
                        styles={{
                            checkbox: styles.checkbox
                        }}
                        indeterminate={checkboxState === 'indeterminate'}
                        onChange={(e, checked) => onChange(checked)} />
                }
            </div>
        )
    }
};