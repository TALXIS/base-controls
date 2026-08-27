import * as React from "react";
import { ICellRendererParams } from "@ag-grid-community/core";
import { Checkbox } from "@fluentui/react";
import { IRecord } from "@talxis/client-libraries";
import { getCompletionCellStyles } from "./styles";

/** What the checklist's completion column hands its cells. */
export interface ICompletionCellProps extends ICellRendererParams<IRecord> {
    label: string;
}

/**
 * The finished-or-not checkbox on one item's row.
 *
 * Renders only — the checkbox is uncontrolled, so it toggles under the cursor but nothing is written to
 * the record and the state is lost on the next refresh.
 *
 * Typed on AG Grid's own params rather than the grid's `ICellProps`: that interface promises a `record`,
 * a `baseColumn` and a `value`, all of which arrive through `cellRendererParams` on a dataset column and
 * are absent on a column injected by the customizer.
 */
export const CompletionCell = (props: ICompletionCellProps) => {
    const styles = React.useMemo(() => getCompletionCellStyles(), []);

    //an item that does not exist yet cannot be finished. Checking the node, not the data: the new-record
    //row carries a real record, so a falsy-data check would not catch it
    if (props.node.rowPinned || !props.data) {
        return null;
    }

    return <div className={styles.completionCellRoot}>
        <Checkbox
            title={props.label}
            ariaLabel={props.label}
            styles={{
                checkbox: styles.checkBox
            }} />
    </div>
}
