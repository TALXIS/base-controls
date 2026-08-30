import * as React from "react";
import { ICellRendererParams } from "@ag-grid-community/core";
import { Checkbox } from "@fluentui/react";
import { IRecord, IRecordEvents } from "@talxis/client-libraries";
import { useEventEmitter } from "@hooks/useEventEmitter";
import { useRerender } from "@legacy";
import { useDatasetControl, useLocalizationService } from "../../../context";
import { getCompletionCellStyles } from "./styles";

/**
 * The finished-or-not checkbox on one item's row. The whole cell is the hitbox.
 *
 * Takes nothing beyond what AG Grid hands every cell renderer: the column to write and the label to
 * announce both come off the control, which the cell reaches through the context it already renders in.
 *
 * Renders straight off the record and redraws when the record reports the value changed, so a write from
 * anywhere shows here — this checkbox, or a consumer setting the value itself. It keeps no copy of the
 * value: a second source of truth drifts from the record the moment anything else writes.
 *
 * Typed on AG Grid's own params rather than the grid's `ICellProps`: that interface promises a `record`,
 * a `baseColumn` and a `value`, all of which arrive through `cellRendererParams` on a dataset column and
 * are absent on a column injected by the customizer.
 */
export const CompletionCell = (props: ICellRendererParams<IRecord>) => {
    const styles = React.useMemo(() => getCompletionCellStyles(), []);
    const datasetControl = useDatasetControl();
    const completedColumnName = datasetControl.getFieldMapping().completed;
    const label = useLocalizationService().getLocalizedString('markItemFinished');
    const isEditingEnabled = datasetControl.getParameters().EnableEditing?.raw !== false;
    const record = props.data;
    const rerender = useRerender();

    useEventEmitter<IRecordEvents>(record, 'onFieldValueChanged', (columnName: string) => {
        if (columnName === completedColumnName) {
            rerender();
        }
    });

    //an item that does not exist yet cannot be finished. Checking the node, not the data: the new-record
    //row carries a real record, so a falsy-data check would not catch it
    if (props.node.rowPinned || !record) {
        return null;
    }

    //a TwoOptions field reads back as the string '1' or '0' no matter what it was written with - the
    //field sanitizes booleans and numbers into that on the way in, initial values included
    const completed = record.getValue(completedColumnName) === '1';
    //asked of the record rather than read off the column: it folds in everything that can hold the value
    //still - a column that is not valid for update, an inactive record, a disabled expression. A
    //read-only checklist still shows what is finished, it just cannot change it
    const isEditable = isEditingEnabled && record.getColumnInfo(completedColumnName).security.editable;

    const onChange = (isCompleted: boolean) => {
        record.setValue(completedColumnName, isCompleted);
        //the save has to be asked for: `EnableAutoSave` is what makes the grid save a cell editor's
        //commit, and a write from a cell renderer is not one
        record.save();
    };

    return <Checkbox
        checked={completed}
        disabled={!isEditable}
        title={label}
        ariaLabel={label}
        styles={{
            root: styles.checkBoxRoot,
            label: styles.checkBoxLabel,
            checkbox: styles.checkBox
        }}
        onChange={(_, checked) => onChange(checked === true)} />
}
