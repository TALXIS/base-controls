import * as React from "react";
import { Dialog } from "@ui";
import { createEditingModule, createServerSideRowModelModule, Grid } from "@controls/grid";
import { DatasetControl } from "@controls/dataset-control";
import { useTaskGridLabels, useTaskGridRuntime } from "@controls/task-grid/context";
import { ViewManager } from "./ViewManager";
import { getViewManagerDialogStyles } from "./styles";

interface IViewManagerDialogProps {
    onDismiss: () => void;
}

/** The *Manage views* dialog: rename and delete the user's own views. */
export const ViewManagerDialog = (props: IViewManagerDialogProps) => {
    const styles = React.useMemo(() => getViewManagerDialogStyles(), []);
    const labels = useTaskGridLabels();
    const runtime = useTaskGridRuntime();
    const viewManager = React.useMemo(() => new ViewManager({ services: runtime.services }), []);
    const modules = React.useMemo(() => ({ rowModel: createServerSideRowModelModule(), editing: createEditingModule({ autoSave: true }) }), []);

    React.useEffect(() => () => viewManager.destroy(), []);

    const onDismiss = () => {
        props.onDismiss();
        if (viewManager.hasChanges()) {
            runtime.reloadViews();
        }
    };

    return <Dialog
        hidden={false}
        onDismiss={onDismiss}
        maxWidth={600}
        dialogContentProps={{
            title: labels.getLocalizedString('manageViews'),
            className: styles.dialogContent,
            showCloseButton: true
        }}>
        <DatasetControl className={styles.datasetControl} onLoad={async () => ({ provider: viewManager.getProvider() })}>
            <DatasetControl.Header>
                <DatasetControl.Header.End>
                    <DatasetControl.Ribbon onLoad={async () => viewManager.getCommands()} />
                </DatasetControl.Header.End>
            </DatasetControl.Header>
            <DatasetControl.Body>
                <Grid modules={modules} enableNavigation={false} />
            </DatasetControl.Body>
        </DatasetControl>
    </Dialog>;
};
