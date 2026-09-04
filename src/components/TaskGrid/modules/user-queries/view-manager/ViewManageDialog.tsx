import { Dialog } from "@fluentui/react"
import * as React from "react"
import { getViewManagerDialogStyles } from "./styles";
import { DatasetControl as DatasetControlRenderer } from '@components/DatasetControl';
import { createServerSideRowModelModule, Grid } from '@components/Grid';
import { getClassNames } from "@utils";
import { ViewManager } from "./ViewManager";
import { useDatasetControl, useLocalizationService, useRootElementId } from "@components/TaskGrid/context";

interface IViewManagerDialogProps {
    onDismiss: () => void;
}

/** The *Manage views* dialog: rename and delete the user’s own views. */
export const ViewManagerDialog = (props: IViewManagerDialogProps) => {
    const styles = React.useMemo(() => getViewManagerDialogStyles(), []);
    const localizationService = useLocalizationService();
    const datasetControl = useDatasetControl();
    const viewManager = React.useMemo(() => new ViewManager(datasetControl), []);
    const hostId = useRootElementId();

    const onDismiss = () => {
        if(viewManager.shouldRemountOnDismiss()) {
            datasetControl.requestRemount();
        }
        else {
            props.onDismiss();
        }
    }

    return <Dialog
        hidden={false}
        onDismiss={onDismiss}
        maxWidth={600}
        dialogContentProps={{
            title: localizationService.getLocalizedString('manageViews'),
            className: styles.dialogContent,
            showCloseButton: true
        }}
        modalProps={{
            layerProps: {
                eventBubblingEnabled: true,
                hostId: hostId,
                styles: {
                    root: styles.layerRoot
                }
            }
        }}>
            <DatasetControlRenderer
                onGetDatasetControlInstance={() => viewManager.getDatasetControl()}
                onOverrideComponentProps={(props) => {
                    return {
                        ...props,
                        onRender: (props, defaultRender) => {
                            return defaultRender({
                                ...props,
                                container: {
                                    ...props.container,
                                    className: getClassNames([props.container.className, styles.datasetControlRoot])
                                }
                            })
                        }
                    }
                }}
                onGetControlComponent={(controlProps) => <Grid
                    provider={controlProps.parameters.Grid.getDataProvider()}
                    modules={{ rowModel: createServerSideRowModelModule() }}
                    enableEditing={controlProps.parameters.EnableEditing?.raw === true}
                    enableNavigation={controlProps.parameters.EnableNavigation?.raw !== false}
                    enableAutoSave={controlProps.parameters.EnableAutoSave?.raw === true}
                />}
             />
    </Dialog>
}