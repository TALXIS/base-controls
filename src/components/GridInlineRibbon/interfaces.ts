import { IRecord } from "@talxis/client-libraries";
import { IControl } from "../../interfaces/context";
import { IRibbonComponentProps } from "../Ribbon/interfaces";

export interface IGridInlineRibbon extends IControl<IRibbonParameters, any, any, IGridInlineRibbonComponentProps> {
}

export interface IRibbonParameters {
    Record: {
        raw: IRecord;
    }
}

interface IGridInlineRibbonComponentProps {
    onRender: (props: IContainerProps, defaultRender: (props: IContainerProps) => JSX.Element) => JSX.Element;
}
interface IContainerProps {
    container: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
    onRenderRibbon: IRibbonComponentProps['onRender'];
}