import { Dialog } from "@fluentui/react"
import * as React from "react"
import { getViewManagerDialogStyles } from "./styles";
import { DatasetControl as DatasetControlRenderer } from '../../../../../DatasetControl';
import { Grid } from '../../../../../Grid';
import { getClassNames } from "@talxis/react-components";
import { ViewManager } from "./ViewManager";
import { useDatasetControl, useLocalizationService, useRootElementId } from "../../../../context";

interface IViewManagerDialogProps {
    onDismiss: () => void;
}

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
                onGetControlComponent={(props) => <Grid {...props} />}
             />
    </Dialog>
}