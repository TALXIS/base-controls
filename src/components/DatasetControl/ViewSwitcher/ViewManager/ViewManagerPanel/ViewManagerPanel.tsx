import { IPanelProps, PanelType } from "@fluentui/react"
import { useMemo } from "react";
import { useModel } from "../../../useModel";
import { DatasetControl as DatasetControlRenderer } from "../../../DatasetControl";
import { Grid } from "../../../../Grid";
import { ViewManager } from "../ViewManager";
import { Panel } from "../../../../../wip/panel/Panel";
import { components } from "../../../../../wip/panel/components/components";

interface IViewManagerPanelProps {
    onDismiss: (shouldRemount: boolean) => void;
}

const CustomPanel = (props: IPanelProps) => {
    return <components.Panel {...props} type={PanelType.medium} />
}

export const ViewManagerPanel = (props: IViewManagerPanelProps) => {
    const { onDismiss } = props;
    const datasetControl = useModel().getDatasetControl();
    const viewManager = useMemo(() => new ViewManager(datasetControl), []);
    return <Panel
        components={{
            FooterContent: () => <></>,
            Panel: CustomPanel
        }}
    >
        <DatasetControlRenderer
            onGetDatasetControlInstance={() => viewManager.getDatasetControl()}
            onGetControlComponent={(props) => <Grid {...props} />}
        />
    </Panel>
}