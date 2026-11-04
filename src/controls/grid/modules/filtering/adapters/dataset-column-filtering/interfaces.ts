import { IControl, IParameters, IStringProperty } from "@core/pcf/interfaces";
import { IOptionSet } from "@fields/option-set";
import { INestedControlRenderer } from "@fields/nested-control-renderer/interfaces";
import { IButtonProps as IFluentButtonProps } from "@fluentui/react";
import React from "react";
import { Filtering } from "@talxis/client-libraries";


export interface IDatasetColumnFiltering extends IControl<IDatasetColumnFilteringParameters, ComponentFramework.PropertyHelper.DataSetApi.FilterExpression, IDatasetColumnFilteringComponentProps> {
}

export interface IDatasetColumnFilteringParameters extends IParameters {
    ColumnName: IStringProperty;
    Filtering: Filtering;
}

interface IDatasetColumnFilteringComponentProps {
    onRender: (props: IComponentProps, defaultRender: (props: IComponentProps) => React.ReactElement) => React.ReactElement;
}

interface IComponentProps {
    container: React.HTMLAttributes<HTMLDivElement>;
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
