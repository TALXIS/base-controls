import * as React from "react";
import { ICellRendererParams } from "@ag-grid-community/core";
import { IconButton, useTheme } from "@fluentui/react";
import { IRecord } from "@talxis/client-libraries";
import { getDeleteCellStyles } from "./styles";

/** What the checklist's delete column hands its cells. */
export interface IDeleteCellProps extends ICellRendererParams<IRecord> {
    /** Runs the whole delete, confirmation included. The cell holds no logic of its own. */
    onDelete: (record: IRecord) => void;
    label: string;
}

/**
 * The delete button on one item's row.
 *
 * Typed on AG Grid's own params rather than the grid's `ICellProps`: that interface promises a `record`,
 * a `baseColumn` and a `value`, all of which arrive through `cellRendererParams` on a dataset column and
 * are absent on a column injected by the customizer.
 */
export const DeleteCell = (props: IDeleteCellProps) => {
    const theme = useTheme();
    const styles = React.useMemo(() => getDeleteCellStyles(theme), [theme]);
    const record = props.data;

    //the new-record row has no item to delete. Checking the node, not the data: the draft row carries a
    //real record, so a falsy-data check would not catch it
    if (props.node.rowPinned || !record) {
        return null;
    }

    return <IconButton
        className={`${styles.deleteButtonRoot} talxis_check-list_delete-button`}
        iconProps={{ iconName: 'ChromeClose' }}
        title={props.label}
        ariaLabel={props.label}
        styles={{
            icon: styles.deleteButtonIcon,
            iconHovered: styles.deleteButtonIcon,
            iconPressed: styles.deleteButtonIcon
        }}
        onClick={() => props.onDelete(record)} />
}
