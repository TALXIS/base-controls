import { IDataset, IRecord } from "@talxis/client-libraries";
import { IControl } from "@interfaces/context";
import { IRibbonComponentProps } from "@controls/dataset-control/ribbon/interfaces";
import { IStringProperty } from "@interfaces";

export interface IGridInlineRibbon extends IControl<IRibbonParameters, any, any, IGridInlineRibbonComponentProps> {
}

export interface IRibbonParameters {
    Dataset: {
        raw: IDataset;
    }
    Record: {
        raw: IRecord;
    },
    /** Comma-separated IDs of the only command buttons to show, subject to their Enable Rules. */
    CommandButtonIds?: IStringProperty;
}

interface IGridInlineRibbonComponentProps {
    onRender: (props: IContainerProps, defaultRender: (props: IContainerProps) => JSX.Element) => JSX.Element;
}
interface IContainerProps {
    container: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
    onRenderRibbon: IRibbonComponentProps['onRender'];
}