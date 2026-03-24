import { IPanelProps, PanelType } from "@fluentui/react";
import { Panel as PanelBase } from "../../../../panel/components";

export const Panel = (props: IPanelProps) => {
    return <PanelBase type={PanelType.medium} {...props} />
}