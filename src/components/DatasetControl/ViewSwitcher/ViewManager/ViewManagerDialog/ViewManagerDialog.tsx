import { Dialog } from "@fluentui/react"
import { useMemo } from "react";
import { getViewManagerDialogStyles } from "./styles";
import { useModel } from "../../../useModel";
import { DatasetControl as DatasetControlRenderer } from "../../../DatasetControl";
import { Grid } from "../../../../Grid";
import { getClassNames } from "@talxis/react-components";
import { ViewManager } from "../ViewManager";


export const ViewManagerDialog = () => {
    const styles = useMemo(() => getViewManagerDialogStyles(), []);
    const labels = useModel().getLabels();
    const datasetControl = useModel().getDatasetControl();
    const viewManager = useMemo(() => new ViewManager(datasetControl), []);

    return <Dialog
        maxWidth={600}
        hidden={false}
        onDismiss={() => datasetControl.requestRemount()}
        dialogContentProps={{
            title: labels['manage-views'](),
            className: styles.dialogContent,
        }}
        modalProps={{
            isBlocking: true,
            layerProps: {
                eventBubblingEnabled: true
            }
        }}
    >
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