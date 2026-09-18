import { IThemeProviderProps } from "@utils";
import { IControl, IParameters, IStringProperty, ITranslations } from "@interfaces";
import { IOptionSet } from "@controls/fields/option-set";
import { datasetColumnFilteringTranslations } from "./translations";
import { INestedControlRenderer } from "@controls/nested-control-renderer/interfaces";
import { IButtonProps as IFluentButtonProps } from "@fluentui/react";
import React from "react";
import { Filtering } from "@talxis/client-libraries";


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
    /** What the control is drawn in, and what it paints its own element with. */
    container: IThemeProviderProps;
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
