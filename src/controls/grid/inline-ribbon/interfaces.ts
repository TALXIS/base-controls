import { IDataProvider, IRecord } from "@talxis/client-libraries";
import { IControl } from "@interfaces/context";
import { IRibbonComponentProps } from "@controls/dataset-control/ribbon/interfaces";
import { IStringProperty } from "@interfaces";
import { IAlignment } from "@utils";

export interface IGridInlineRibbon extends IControl<IRibbonParameters, any, any, IGridInlineRibbonComponentProps> {
}

export interface IRibbonParameters {
    Provider: {
        raw: IDataProvider;
    }
    Record: {
        raw: IRecord;
    },
    /** Comma-separated IDs of the only command buttons to show, subject to their Enable Rules. */
    CommandButtonIds?: IStringProperty;
    /** Which edge the buttons sit against, as the cell's column definition says. */
    ColumnAlignment?: {
        raw: IAlignment;
    };
}

interface IGridInlineRibbonComponentProps {
    onRender: (props: IContainerProps, defaultRender: (props: IContainerProps) => JSX.Element) => JSX.Element;
}
interface IContainerProps {
    container: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
    onRenderRibbon: IRibbonComponentProps['onRender'];
}