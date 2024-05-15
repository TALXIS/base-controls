import { DialogFooter, ICommandBarItemProps, IDialogProps, PrimaryButton, Spinner, SpinnerSize, useTheme } from "@fluentui/react";
import { useEffect } from 'react';
import { useGridInstance } from "../../../../hooks/useGridInstance";
import { useRecordUpdateServiceController } from "../../../../services/RecordUpdateService/controllers/useRecordUpdateServiceController";
import { IUpdatedRecord } from "../../../../services/RecordUpdateService/model/RecordUpdateService";
import { IEntityColumn, IEntityRecord } from "../../../../../interfaces";
import Dialog from "../../../Dialog";
import { RecordGrids } from "./components/RecordGrids/RecordGrids";
import { DataType } from "../../../../enums/DataType";
import { getChangeEditorStyles } from "./styles";
import { useSave } from "../../hooks/useSave";
import React from 'react';

export const ChangeEditor = (props: IDialogProps) => {
    const grid = useGridInstance();
    const labels = grid.labels;
    const controller = useRecordUpdateServiceController();
    const { isSaving, saveBtnProps, save } = useSave();
    const updatedRecords = controller.updatedRecords;
    // Sample data for IEntityColumn
    //@ts-ignore
    const column1: IEntityColumn = {
        name: "Column1",
        dataType: DataType.SINGLE_LINE_TEXT,
        displayName: 'Column 1',
        visualSizeFactor: 200,
        order: 1,

    };
    //@ts-ignore
    const column2: IEntityColumn = {
        name: "Column2",
        dataType: DataType.SINGLE_LINE_TEXT,
        displayName: 'Column 1',
        visualSizeFactor: 200,
        order: 1
    };

    // Sample data for IEntityRecord
    //@ts-ignore
    const entityRecord1: IEntityRecord = {
        setValue: (columnName, value) => {
            console.log(`Setting ${columnName} to ${value}`);
        },
        save: () => {
            console.log("Saving entity record...");
            return Promise.resolve(true);
        },
        getRecordId: () => {
            return "1111"
        },
        getValue: () => {
            return "value"
        },
        getFormattedValue: () => {
            return "formattedValue"
        }
    };

    // Sample data for IUpdatedRecord
    const updatedRecord1: IUpdatedRecord = {
        columns: new Set([column1, column2]),
        getOriginalValue: (columnKey) => {
            // Sample implementation for getOriginalValue method
            return "Original Value for " + columnKey;
        },
        getOriginalFormattedValue: (columnKey) => {
            // Sample implementation for getOriginalFormattedValue method
            return "Formatted Original Value for " + columnKey;
        },
        getOriginalFormattedPrimaryNameValue: () => {
            // Sample implementation for getOriginalFormattedPrimaryNameValue method
            return "Original Primary Name Value";
        },
        clear: () => {
            // Sample implementation for clear method
            console.log("Clearing updated record...");
        },
        ...entityRecord1, // Spread the IEntityRecord properties
        getRecordId: () => {
            return "1111"
        }
    };

    // Create additional sample updated records if needed
    const updatedRecord2: IUpdatedRecord = {
        columns: new Set([column1]),
        getOriginalValue: (columnKey) => {
            // Sample implementation for getOriginalValue method
            return "Original Value for " + columnKey;
        },
        getOriginalFormattedValue: (columnKey) => {
            // Sample implementation for getOriginalFormattedValue method
            return "Formatted Original Value for " + columnKey;
        },
        getOriginalFormattedPrimaryNameValue: () => {
            // Sample implementation for getOriginalFormattedPrimaryNameValue method
            return "Original Primary Name Value";
        },
        clear: () => {
            // Sample implementation for clear method
            console.log("Clearing updated record...");
        },
        ...entityRecord1,

        getRecordId: () => {
            return "2222"
        } // Spread the IEntityRecord properties
    };

    const updatedRecord3: IUpdatedRecord = {
        columns: new Set([column2]),
        getOriginalValue: (columnKey) => {
            // Sample implementation for getOriginalValue method
            return "Original Value for " + columnKey;
        },
        getOriginalFormattedValue: (columnKey) => {
            // Sample implementation for getOriginalFormattedValue method
            return "Formatted Original Value for " + columnKey;
        },
        getOriginalFormattedPrimaryNameValue: () => {
            // Sample implementation for getOriginalFormattedPrimaryNameValue method
            return "Original Primary Name Value";
        },
        clear: () => {
            // Sample implementation for clear method
            console.log("Clearing updated record...");
        },
        ...entityRecord1,
        getRecordId: () => {
            return "3333"
        } // Spread the IEntityRecord properties
    };

    // Populate updatedRecords array with sample updated records
    //const updatedRecords: IUpdatedRecord[] = [updatedRecord1, updatedRecord2, updatedRecord3];

    const styles = getChangeEditorStyles(useTheme());
    useEffect(() => {
        if (updatedRecords.length === 0) {
            props.onDismiss?.();
        }
    }, [updatedRecords]);


    return <Dialog
        {...props}
        width={1000}
        minWidth={600}
        modalProps={{
            className: styles.root,
            layerProps: {
                eventBubblingEnabled: true
            }
        }}
        dialogContentProps={{
            showCloseButton: true,
            title: labels["saving-changepreview-title"]({
                numOfChanges: updatedRecords.length
            })
        }}
        hidden={false}>
        <div className={styles.recordGrids}>
            {updatedRecords.map(record => <RecordGrids key={record.getRecordId()} record={record} />)}
        </div>
        <DialogFooter>
            <PrimaryButton
                className={styles.saveBtn}
                text={saveBtnProps.text}
                disabled={saveBtnProps.disabled}
                onClick={() => save()}
                >
                {isSaving && 
                    <Spinner size={SpinnerSize.small} />
                }
            </PrimaryButton>
        </DialogFooter>
    </Dialog>
}