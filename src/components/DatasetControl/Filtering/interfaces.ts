import { ThemeProviderProps } from "@fluentui/react";
import { IControl, IParameters, IStringProperty, ITranslations } from "../../../interfaces";
import { Filtering } from "../../../utils/dataset/extensions";
import { IOptionSet } from "../../OptionSet";
import { datasetColumnFilteringTranslations } from "./translations";
import { INestedControlRenderer } from "../../NestedControlRenderer/interfaces";
import { IButtonProps as IFluentButtonProps } from "@fluentui/react";
import React from "react";


export interface IDatasetColumnFiltering extends IControl<IDatasetColumnFilteringParameters, ComponentFramework.PropertyHelper.DataSetApi.FilterExpression, Partial<ITranslations<typeof datasetColumnFilteringTranslations>>, IDatasetColumnFilteringComponentProps> {
}

export interface IDatasetColumnFilteringParameters extends IParameters {
    ColumnName: IStringProperty;
    Filtering: Filtering;
}

interface IDatasetColumnFilteringComponentProps {
    onRender: (props: IComponentProps, defaultRender: (props: IComponentProps) => React.ReactElement) => React.ReactElement;
}

interface IComponentProps {
    container: ThemeProviderProps;
    valueControlsContainer: React.HTMLAttributes<HTMLDivElement>;
    onRenderConditionOperatorControl: (props: IOptionSet, defaultRender: (props: IOptionSet) => React.ReactElement) => React.ReactElement;
    onRenderConditionValueControl: (props: INestedControlRenderer, defaultRender: (props: INestedControlRenderer) => React.ReactElement) => React.ReactElement;
    onRenderButtons: (props: IButtonsProps, defaultRender: (props: IButtonsProps) => React.ReactElement) => React.ReactElement;
}

interface IButtonsProps {
    container: React.HTMLAttributes<HTMLDivElement>;
    onRenderApplyButton: (props: IFluentButtonProps, defaultRender: (props: IFluentButtonProps) => React.ReactElement) => React.ReactElement;
    onRenderClearButton: (props: IFluentButtonProps, defaultRender: (props: IFluentButtonProps) => React.ReactElement) => React.ReactElement;
}
