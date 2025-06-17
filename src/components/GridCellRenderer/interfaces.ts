import { AggregationFunction, IColumn, ICommand, IDataset, IRecord } from "@talxis/client-libraries";
import { IControl, IParameters, IStringProperty, ITwoOptionsProperty } from "../../interfaces";
import { getDefaultGridRendererTranslations } from "./translations";
import { IIconProps, IImageProps, ILabelProps, ILinkProps, ISpinnerProps, ITextProps, ThemeProviderProps } from "@fluentui/react";
import { ICommandBarProps } from "@talxis/react-components";

export interface IGridCellRenderer extends IControl<IGridCellRendererParameters, {}, ReturnType<typeof getDefaultGridRendererTranslations>, IGridCellRendererComponentProps> {
}

export interface IGridCellRendererParameters extends IParameters {
    value: any;
    ColumnAlignment: Omit<ComponentFramework.PropertyTypes.EnumProperty<"left" | "center" | "right">, 'type'>;
    CellType: Omit<ComponentFramework.PropertyTypes.EnumProperty<"renderer" | "editor">, 'type'>;
    EnableNavigation: Omit<ITwoOptionsProperty, 'attributes'>;
    PrefixIcon?: IStringProperty;
    SuffixIcon?: IStringProperty;
    AggregationFunction: Omit<ComponentFramework.PropertyTypes.EnumProperty<AggregationFunction | null>, 'type'>;
    Column: {
        raw: IColumn;
    }
    Dataset: {
        raw: IDataset
    }
    Record:  {
        raw: IRecord
    }
    RecordCommands?: {
        raw: ICommand[];
    }
}

export interface IOptionSetProps {
    containerProps: React.HTMLAttributes<HTMLDivElement>;
    onGetOptionProps: (props: IOptionProps) => IOptionProps
}

export interface IOptionProps {
    containerProps: ThemeProviderProps;
    option: ComponentFramework.PropertyHelper.OptionMetadata;
    textProps: ITextProps;
}

export interface IRecordCommandsProps {
    containerProps: ThemeProviderProps;
    commandBarProps: ICommandBarProps;
}

export interface IGridCellRendererComponentProps {
    onGetOptionSetProps: (props: IOptionSetProps) => IOptionSetProps,
    onGetLinkProps: (props: ILinkProps) => ILinkProps;
    onGetRecordCommandsProps: (props: IRecordCommandsProps) => IRecordCommandsProps;
    onRenderContent: (defaultRenderer: () => JSX.Element) => JSX.Element, 
    onRenderAggregationLabel: (props: ILabelProps, defaultRenderer: (props: ILabelProps) => React.ReactElement) => React.ReactElement;
    rootContainerProps: ThemeProviderProps;
    prefixSuffixWrapperProps: React.HTMLAttributes<HTMLDivElement>;
    contentWrapperProps: React.HTMLAttributes<HTMLDivElement>;
    textProps: ITextProps;
    fileProps: {
        containerProps: React.HTMLAttributes<HTMLDivElement>;
        iconProps: Omit<IIconProps, 'iconName'> & {
            onGetIconName: (iconName: string) => string
        };
        imageProps: Omit<IImageProps, 'src'> & {
            onGetSrc: (src: string) => string
        },
        loadingProps: {
            spinnerProps: ISpinnerProps;
        }
    }
}