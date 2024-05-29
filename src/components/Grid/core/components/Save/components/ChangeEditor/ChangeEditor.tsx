import { DialogFooter, FocusTrapZone, ICommandBarItemProps, IDialogProps, PrimaryButton, Spinner, SpinnerSize, useTheme } from "@fluentui/react";
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

    const styles = getChangeEditorStyles(useTheme());
    useEffect(() => {
        if (updatedRecords.length === 0) {
            props.onDismiss?.();
        }
    }, [updatedRecords]);


    return <Dialog
        {...props}
        width={1000}
        minWidth={'80%'}
        modalProps={{
            isBlocking: true,
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