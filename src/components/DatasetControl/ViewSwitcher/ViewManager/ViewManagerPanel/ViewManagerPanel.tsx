import { PanelType } from "@fluentui/react"
import { useMemo } from "react";
import { useModel } from "../../../useModel";
import { DatasetControl as DatasetControlRenderer } from "../../../DatasetControl";
import { Grid } from "../../../../Grid";
import { ViewManager } from "../ViewManager";
import { Panel } from "../../../../../wip/panel/Panel";

interface IViewManagerPanelProps {
    onDismiss: (shouldRemount: boolean) => void;
}


export const ViewManagerPanel = (props: IViewManagerPanelProps) => {
    const { onDismiss } = props;
    const labels = useModel().getLabels();
    const datasetControl = useModel().getDatasetControl();
    const viewManager = useMemo(() => new ViewManager(datasetControl), []);

    return <Panel
        headerText={labels['manage-views']()}
        type={PanelType.medium}
        onDismiss={() => onDismiss(viewManager.haveChangesBeenMade())}
        onRenderFooterContent={undefined}
        isOpen>
        <DatasetControlRenderer
            onGetDatasetControlInstance={() => viewManager.getDatasetControl()}
            onOverrideComponentProps={(props) => {
                return {
                    ...props,
                    onRender: (props, defaultRender) => {
                        return defaultRender({
                            ...props
                        })
                    }
                }
            }}
            onGetControlComponent={(props) => <Grid {...props} />}
        />
    </Panel>
}