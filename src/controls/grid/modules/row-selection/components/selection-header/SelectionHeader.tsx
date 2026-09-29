import { Checkbox } from "@fluentui/react";
import { IDataProviderEventListeners } from "@talxis/client-libraries";
import { useRerender } from "@legacy";
import { useEventEmitter } from "@hooks/useEventEmitter";
import { useGridService } from "../../../../useGridService";
import { Grid } from "../../../../namespace";
import { IColumnHeaderParams } from "../../../../components/column-header/root/ColumnHeaderRoot";
import { IGridRowSelectionState } from "../../GridRowSelection";
import { getSelectionHeaderStyles } from "./styles";

/** The header of the column the checkboxes live in: what selects every record, and clears them. */
export const SelectionHeader = (props: IColumnHeaderParams) => {
    const selection = useGridService('rowSelection')!;
    const provider = useGridService('provider');
    const styles = getSelectionHeaderStyles();
    const rerender = useRerender();
    useEventEmitter<IDataProviderEventListeners>(provider, 'onRecordsSelected', rerender);

    const getCheckboxState = (): IGridRowSelectionState => {
        const selectedRecordIds = provider.getSelectedRecordIds({ includeGroupRecordIds: true, includeChildrenRecordIds: false });
        if (selectedRecordIds.length === 0) {
            return 'unchecked';
        }
        if (selectedRecordIds.length === provider.getSortedRecordIds().length) {
            return 'checked';
        }
        return 'indeterminate';
    };

    const onChange = (checked?: boolean) => {
        if (checked) {
            selection.selectRecords(provider, provider.getSortedRecordIds());
            return;
        }
        provider.clearSelectedRecordIds();
    };

    //drawn only in multiple mode and while there is something to select
    const isDrawn = selection.getMode() === 'multiple' && (provider.getSortedRecordIds().length > 0 || provider.isLoading());
    const checkboxState = getCheckboxState();

    //no container: it draws the menu button this column lacks
    return <Grid.ColumnHeader.Root {...props}>
        <Grid.ColumnHeader.Theme>
            <div className={styles.container}>
                {isDrawn && <Checkbox
                    checked={checkboxState === 'checked'}
                    indeterminate={checkboxState === 'indeterminate'}
                    styles={{ checkbox: styles.checkbox }}
                    onChange={(event, checked) => onChange(checked)} />}
            </div>
        </Grid.ColumnHeader.Theme>
    </Grid.ColumnHeader.Root>;
};
