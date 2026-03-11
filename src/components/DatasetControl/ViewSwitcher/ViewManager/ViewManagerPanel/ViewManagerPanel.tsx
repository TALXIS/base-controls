import { PanelType } from "@fluentui/react"
import { useMemo } from "react";
import { useModel } from "../../../useModel";
import { DatasetControl as DatasetControlRenderer } from "../../../DatasetControl";
import { Grid } from "../../../../Grid";
import { ViewManager } from "../ViewManager";
import { Panel } from "../../../../../wip/panel/Panel";
import { getLabels } from "../../../../../wip/panel/functions/getLabels";

interface IViewManagerPanelProps {
    onDismiss: (shouldRemount: boolean) => void;
}


export const ViewManagerPanel = (props: IViewManagerPanelProps) => {
    const { onDismiss } = props;
    const labels = useModel().getLabels();
    const datasetControl = useModel().getDatasetControl();
    const viewManager = useMemo(() => new ViewManager(datasetControl), []);

    return <Panel
        functions={{
            getLabels: () => {
                const originalLabels = getLabels();
                return {
                    ...originalLabels,
                    header: labels['manage-views']()
                }
            },
            onDismiss: () => onDismiss(viewManager.haveChangesBeenMade()),
        }}
        components={{
            FooterContent: () => <></>
        }}
        overrideComponentProps={(props) => {
            return {
                ...props,
                type: PanelType.medium
            }
        }}
    >
        <DatasetControlRenderer
            onGetDatasetControlInstance={() => viewManager.getDatasetControl()}
            onGetControlComponent={(props) => <Grid {...props} />}
        />
    </Panel>
}