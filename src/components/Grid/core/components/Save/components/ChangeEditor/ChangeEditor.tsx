import { DefaultButton, DialogFooter, IDialogProps, PrimaryButton, Spinner, SpinnerSize, useTheme } from "@fluentui/react";
import { useGridInstance } from "../../../../hooks/useGridInstance";
import Dialog from "../../../Dialog";
import { getChangeEditorStyles } from "./styles";
import { useSave } from "../../hooks/useSave";
import { ChangeGrid } from "./components/ChangeGrid/ChangeGrid";
import { useEffect } from "react";
import { withButtonLoading } from "@talxis/react-components";

const PrimaryButtonWithLoading = withButtonLoading(PrimaryButton);

export const ChangeEditor = (props: IDialogProps) => {
    const grid = useGridInstance();
    const recordChanges = grid.changeTracker.getChanges();
    const labels = grid.labels;
    const { isSaving, save } = useSave();
    const styles = getChangeEditorStyles(useTheme());

    useEffect(() => {
        if (recordChanges.size === 0) {
            props.onDismiss?.();
        }
    }, [recordChanges.size]);

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
                numOfChanges: recordChanges.size
            })
        }}
        hidden={false}>
        <div className={styles.recordGrids}>
            {[...recordChanges.values()].map(recordChange => <ChangeGrid isSavingAll={isSaving} key={recordChange.record.getRecordId()} recordChange={recordChange} />)}
            {Object.values(recordChanges).map(recordChange => <ChangeGrid isSavingAll={isSaving} key={recordChange.record.getRecordId()} recordChange={recordChange} />)}
        </div>
        <DialogFooter>
            <PrimaryButtonWithLoading
                className={styles.saveBtn}
                isLoading={isSaving}
                text={isSaving ? grid.labels['saving-saving']() : grid.labels['saving-save-all']()}
                onClick={() => save()}
            />
            <DefaultButton
                text={grid.labels['saving-discard-all']()}
                disabled={isSaving}
                onClick={async () => {
                    const response = await grid.pcfContext.navigation.openConfirmDialog({
                        text: grid.labels['saving-discard-all-confirmation']()
                    });
                    if (response.confirmed) {
                        grid.changeTracker.clearChanges();
                        grid.pcfContext.factory.requestRender();
                    }
                }}
            />
        </DialogFooter>
    </Dialog>
}