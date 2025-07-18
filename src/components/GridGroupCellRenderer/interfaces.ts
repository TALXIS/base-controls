import { AggregationFunction, IColumn, IDataset, IRecord } from "@talxis/client-libraries";
import { IControl, IDecimalNumberProperty, IParameters, IStringProperty, ITwoOptionsProperty, IWholeNumberProperty } from "../../interfaces";
import { IIconProps, IImageProps, ILabelProps, ILinkProps, ISpinnerProps, ITextProps, ThemeProviderProps } from "@fluentui/react";
import { getDefaultGridRendererTranslations } from "../GridCellRenderer/translations";

export interface IGridCellRenderer extends IControl<IGridCellRendererParameters, {}, ReturnType<typeof getDefaultGridRendererTranslations>, IGridCellRendererComponentProps> {
}

export interface IGridCellRendererParameters extends IParameters {
    value: any;
    ColumnAlignment: Omit<ComponentFramework.PropertyTypes.EnumProperty<"left" | "center" | "right">, 'type'>;
    CellType: Omit<ComponentFramework.PropertyTypes.EnumProperty<"renderer" | "editor">, 'type'>;
    EnableNavigation: Omit<ITwoOptionsProperty, 'attributes'>;
    AggregateFunction: Omit<ComponentFramework.PropertyTypes.EnumProperty<AggregationFunction | null>, 'type'>;
    AggregatedValue: IDecimalNumberProperty | IWholeNumberProperty;
    Column: {
        raw: IColumn;
    }
    Dataset: {
        raw: IDataset
    }
    Record: {
        raw: IRecord
    }
    PrefixIcon: IStringProperty;
    SuffixIcon: IStringProperty;
}

export interface IGridCellRendererComponentProps {
    onRender: (props: IComponentProps, defaultRender: (props: IComponentProps) => React.ReactElement) => React.ReactElement;
}

interface IComponentProps {
    container: ThemeProviderProps;
    onRenderContentContainer: (props: IContentContainerProps, defaultRender: (props: IContentContainerProps) => React.ReactElement) => React.ReactElement;
    onRenderAggregationLabel: (props: ILabelProps, defaultRender: (props: ILabelProps) => React.ReactElement) => React.ReactElement;
}

interface IContentContainerProps {
    container: React.HTMLAttributes<HTMLDivElement>;
    onRenderPrefixIcon: (props: IIconProps, defaultRender: (props: IIconProps) => React.ReactElement) => React.ReactElement;
    onRenderSuffixIcon: (props: IIconProps, defaultRender: (props: IIconProps) => React.ReactElement) => React.ReactElement;
    onRenderInnerContainer: (props: IInnerContentContainerProps, defaultRender: (props: IInnerContentContainerProps) => React.ReactElement) => React.ReactElement;
}

interface IInnerContentContainerProps {
    container: React.HTMLAttributes<HTMLDivElement>;
    onRenderAggregatedValue: (props: ITextProps, defaultRender: (props: ITextProps) => React.ReactElement) => React.ReactElement;
    onRenderValueContainer: (props: IValueContainerProps, defaultRender: (props: IValueContainerProps) => React.ReactElement) => React.ReactElement;
}

interface IValueContainerProps {
    container: React.HTMLAttributes<HTMLDivElement>;
    onRenderValue: (props: IValueRendererProps, defaultRender: (props: IValueRendererProps) => React.ReactElement) => React.ReactElement;
}

export interface IValueRendererProps {
    onRenderPlaceholder: (props: ITextProps, defaultRender: (props: ITextProps) => React.ReactElement) => React.ReactElement;
    onRenderText: (props: ITextProps, defaultRender: (props: ITextProps) => React.ReactElement) => React.ReactElement;
    onRenderLink: (props: ILinkProps, defaultRender: (props: ILinkProps) => React.ReactElement) => React.ReactElement;
    onRenderFile: (props: IFileRendererProps, defaultRender: (props: IFileRendererProps) => React.ReactElement) => React.ReactElement;
    onRenderColorfulOptionSet: (props: IColorfulOptionSetValueRendererProps, defaultRender: (props: IColorfulOptionSetValueRendererProps) => React.ReactElement) => React.ReactElement;

}

export interface IColorfulOptionSetValueRendererProps {
    container: React.HTMLAttributes<HTMLDivElement>;
    onRenderOption: (props: IColorfulOptionValueRendererProps, defaultRender: (props: IColorfulOptionValueRendererProps) => React.ReactElement) => React.ReactElement;
}

export interface IColorfulOptionValueRendererProps {
    container: ThemeProviderProps;
    onRenderText: (props: ITextProps, defaultRender: (props: ITextProps) => React.ReactElement) => React.ReactElement;
}

export interface IFileRendererProps {
    container: React.HTMLAttributes<HTMLDivElement>;
    onRenderFileAttachmentIcon: (props: IIconProps, defaultRender: (props: IIconProps) => React.ReactElement) => React.ReactElement;
    onRenderImageThumbnail: (props: IImageProps, defaultRender: (props: IImageProps) => React.ReactElement) => React.ReactElement;
    onRenderLoading: (props: ISpinnerProps, defaultRender: (props: ISpinnerProps) => React.ReactElement) => React.ReactElement;
    onRenderLink: (props: ILinkProps, defaultRender: (props: ILinkProps) => React.ReactElement) => React.ReactElement;
}

