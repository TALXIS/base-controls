import * as React from "react";
import { ICellRendererParams } from "@ag-grid-community/core";
import { Checkbox } from "@fluentui/react";
import { IRecord } from "@talxis/client-libraries";
import { useDatasetControl, useLocalizationService } from "../../../context";
import { getCompletionCellStyles } from "./styles";

/**
 * The finished-or-not checkbox on one item's row. The whole cell is the hitbox.
 *
 * Takes nothing beyond what AG Grid hands every cell renderer: the column to write and the label to
 * announce both come off the control, which the cell reaches through the context it already renders in.
 *
 * Holds the state it renders rather than reading the record on every render, so the tick follows the
 * click. Seeded from the record, which is what carries the state across a row being destroyed and
 * rebuilt.
 *
 * Typed on AG Grid's own params rather than the grid's `ICellProps`: that interface promises a `record`,
 * a `baseColumn` and a `value`, all of which arrive through `cellRendererParams` on a dataset column and
 * are absent on a column injected by the customizer.
 */
export const CompletionCell = (props: ICellRendererParams<IRecord>) => {
    const styles = React.useMemo(() => getCompletionCellStyles(), []);
    const fieldMapping = useDatasetControl().getFieldMapping();
    const completedColumnName = fieldMapping.completed;
    const label = useLocalizationService().getLocalizedString('markItemFinished');
    const record = props.data;
    //a TwoOptions field reads back as the string '1' or '0' no matter what it was written with - the
    //field sanitizes booleans and numbers into that on the way in, initial values included
    const [completed, setCompleted] = React.useState<boolean>(() => record?.getValue(completedColumnName) === '1');

    //an item that does not exist yet cannot be finished. Checking the node, not the data: the new-record
    //row carries a real record, so a falsy-data check would not catch it
    if (props.node.rowPinned || !record) {
        return null;
    }

    const onChange = (isCompleted: boolean) => {
        setCompleted(isCompleted);
        record.setValue(completedColumnName, isCompleted);
        //the name cell strikes its text through off a class rule, which AG Grid only re-decides when the
        //cell is refreshed - nothing else asks for that, since this column is not the one that changed
        props.api.refreshCells({ rowNodes: [props.node], columns: [fieldMapping.name], force: true });
        //the save has to be asked for: `EnableAutoSave` is what makes the grid save a cell editor's
        //commit, and a write from a cell renderer is not one
        record.save();
    };

    return <Checkbox
        checked={completed}
        title={label}
        ariaLabel={label}
        styles={{
            root: styles.checkBoxRoot,
            label: styles.checkBoxLabel,
            checkbox: styles.checkBox
        }}
        onChange={(_, checked) => onChange(checked === true)} />
}
