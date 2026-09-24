import { Checkbox } from "@fluentui/react";
import { IDataProviderEventListeners } from "@talxis/client-libraries";
import { useRerender } from "@legacy";
import { useEventEmitter } from "@hooks/useEventEmitter";
import { useGridService } from "../../../../useGridService";
import { Grid } from "../../../../namespace";
import { IColumnHeaderParams } from "../../../../components/column-header/root/ColumnHeaderRoot";
import { IGridSelectionState } from "../../GridSelection";
import { getSelectionHeaderStyles } from "./styles";

/** The header of the column the checkboxes live in: what selects every record, and clears them. */
export const SelectionHeader = (props: IColumnHeaderParams) => {
    const selection = useGridService('selection')!;
    const provider = useGridService('provider');
    const styles = getSelectionHeaderStyles();
    const rerender = useRerender();
    useEventEmitter<IDataProviderEventListeners>(provider, 'onRecordsSelected', rerender);

    const getCheckboxState = (): IGridSelectionState => {
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

    //one record is selected in the row it is in, and nothing is selected while there is nothing to select
    const isDrawn = selection.getMode() === 'multiple' && (provider.getSortedRecordIds().length > 0 || provider.isLoading());
    const checkboxState = getCheckboxState();

    //no container: what that part draws is the button a column's menu opens from, and this column has none
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
