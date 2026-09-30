import { IDataProviderEventListeners } from "@talxis/client-libraries";
import { useRerender } from "@legacy";
import { useEventEmitter } from "@hooks/useEventEmitter";
import { useGridService } from "../../../../useGridService";
import { ColumnHeaderRoot, IColumnHeaderParams } from "../../../../components/column-header/root/ColumnHeaderRoot";
import { ColumnHeaderTheme } from "../../../../components/column-header/theme/ColumnHeaderTheme";
import { IGridRowSelectionState } from "../../GridRowSelection";
import { RowSelectionUi } from "../ui";

export interface ISelectionHeaderProps extends IColumnHeaderParams { }

/** The header of the column the checkboxes live in: what selects every record, and clears them. */
export const SelectionHeader = (props: ISelectionHeaderProps) => {
    const selection = useGridService('rowSelection')!;
    const provider = useGridService('provider');
    const { rerender } = useRerender();
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

    const onChange = (checked: boolean) => {
        if (checked) {
            selection.selectRecords(provider, provider.getSortedRecordIds());
            return;
        }
        provider.clearSelectedRecordIds();
    };

    //no container: it draws the menu button this column lacks
    return <ColumnHeaderRoot {...props}>
        <ColumnHeaderTheme>
            <RowSelectionUi.HeaderCheckbox
                state={getCheckboxState()}
                //drawn only in multiple mode and while there is something to select
                isCheckboxVisible={selection.getMode() === 'multiple' && (provider.getSortedRecordIds().length > 0 || provider.isLoading())}
                onChange={onChange}
                components={selection.components.header?.headerCheckbox} />
        </ColumnHeaderTheme>
    </ColumnHeaderRoot>;
};
