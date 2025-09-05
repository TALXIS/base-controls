import { IRecord } from "@talxis/client-libraries";
import { IControl } from "../../interfaces/context";
import { IRibbonComponentProps } from "../Ribbon/interfaces";
import { IStringProperty } from "../../interfaces";

export interface IGridInlineRibbon extends IControl<IRibbonParameters, any, any, IGridInlineRibbonComponentProps> {
}

export interface IRibbonParameters {
    Record: {
        raw: IRecord;
    },
    /**
     * A comma-separated list of command button IDs to display in the ribbon. If specified, only these buttons will be shown.
     * The button still might not be visible if it's Enable Rules evaluate to false
     */
    CommandButtonIds?: IStringProperty;
}

interface IGridInlineRibbonComponentProps {
    onRender: (props: IContainerProps, defaultRender: (props: IContainerProps) => JSX.Element) => JSX.Element;
}
interface IContainerProps {
    container: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
    onRenderRibbon: IRibbonComponentProps['onRender'];
}