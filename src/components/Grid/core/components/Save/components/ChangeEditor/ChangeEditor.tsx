import { DefaultButton, DialogFooter, IDialogProps, PrimaryButton, useTheme } from "@fluentui/react";
import { useGridInstance } from "../../../../hooks/useGridInstance";
import Dialog from "../../../Dialog";
import { getChangeEditorStyles } from "./styles";
import { ChangeGrid } from "./components/ChangeGrid/ChangeGrid";
import { useEffect, useRef, useState } from "react";
import { IDataset } from "@talxis/client-libraries";
import { useRerender } from "@talxis/react-components";

interface IChangeDialogProps extends IDialogProps {
    onDismiss: (ev?: React.MouseEvent<HTMLButtonElement>, shoulRefreshGrid?: boolean) => void;
}

export const ChangeEditor = (props: IChangeDialogProps) => {
    const grid = useGridInstance();
    const recordChanges = grid.dataset.getChanges?.() ?? [];
    const labels = grid.labels;
    const [activeSaveOperationsCount, setActiveSaveOperationsCount] = useState(0);
    const styles = getChangeEditorStyles(useTheme());
    const datasetsRef = useRef<Set<IDataset>>(new Set());
    const shouldRefreshOnDismissRef = useRef(false);
    const rerender = useRerender();

    const onDismiss = (ev?: React.MouseEvent<HTMLButtonElement>) => {
        //@ts-ignore
        if (ev?.code === 'Escape') {
            return;
        }
        //do not close the dialog if we have pending save operations
        if (activeSaveOperationsCount > 0) {
            return;
        }
        props.onDismiss?.(ev, shouldRefreshOnDismissRef.current);
    }

    const isSaveDisabled = () => {
        if (activeSaveOperationsCount > 0) {
            return true;
        }
        if ([...datasetsRef.current.values()].find(x => x.hasInvalidChanges?.())) {
            return true;
        }
        return false;
    }

    useEffect(() => {
        return () => {
            props.onDismiss?.(undefined, shouldRefreshOnDismissRef.current);
        }
    }, []);

    useEffect(() => {
        if (activeSaveOperationsCount > 0) {
            shouldRefreshOnDismissRef.current = true;
        }
    }, [activeSaveOperationsCount])
    return <Dialog
        {...props}
        onDismiss={onDismiss}
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
                numOfChanges: Object.keys(recordChanges).length
            })
        }}
        hidden={false}>
        <div className={styles.recordGrids}>
            {Object.values(recordChanges).map(recordChange => <ChangeGrid
                onDatasetDestroyed={(dataset) => datasetsRef.current.delete(dataset)}
                onDatasetReady={(dataset) => datasetsRef.current.add(dataset)}
                onIsSaving={(value) => {
                    setActiveSaveOperationsCount(count => value ? count + 1 : count - 1);
                }}
                onRequestRender={() => rerender()}
                key={recordChange.record.getRecordId()}
                recordChange={recordChange} />)}
        </div>
        <DialogFooter>
            <PrimaryButton
                className={styles.saveBtn}
                disabled={isSaveDisabled()}
                text={activeSaveOperationsCount > 0 ? grid.labels['saving-saving']() : grid.labels['saving-save-all']()}
                onClick={async () => {
                    setActiveSaveOperationsCount(count => count + 1);
                    await Promise.all([...datasetsRef.current.values()].map(dataset => dataset.save?.()));
                    grid.dataset.clearChanges?.();
                    setActiveSaveOperationsCount(count => count - 1);
                }}
            />
            <DefaultButton
                text={grid.labels['saving-discard-all']()}
                disabled={activeSaveOperationsCount > 0}
                onClick={async (e) => {
                    if (window.confirm(grid.labels['saving-discard-all-confirmation']())) {
                        grid.dataset.clearChanges?.();
                        props.onDismiss(e as any, shouldRefreshOnDismissRef.current);
                    }
                }}
            />
        </DialogFooter>
    </Dialog>
}