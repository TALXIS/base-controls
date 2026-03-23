import { IPanelProps, Panel as PanelBase } from "@fluentui/react";
import { useEditColumnsLabels } from "../..";

export const Panel = (props: IPanelProps) => {
    const labels = useEditColumnsLabels();
    return <PanelBase headerText={labels.header} {...props} />
}