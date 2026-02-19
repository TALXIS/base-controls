import { IButtonProps, IMessageBarProps, IShimmerProps, ITextProps, ThemeProviderProps } from "@fluentui/react";
import { ITranslation } from "../../hooks";
import { IControl, IStringProperty, ITwoOptionsProperty } from "../../interfaces";
import { IGridOutputs, IGridParameters } from "../Grid";
import { gridTranslations } from "../Grid/translations";
import { datasetControlTranslations } from "./translations";
import { ICalloutProps as ICalloutPropsBase, ICommandBarProps, ITextFieldProps } from "@talxis/react-components";
import React from "react";
import { IRibbonComponentProps } from "../Ribbon/interfaces";
import { IDatasetControl } from "../../utils/dataset-control";
import { IColumn } from "@talxis/client-libraries";


export interface IDatasetControlProps extends Omit<IControl<IDatasetControlParameters, IGridOutputs, Partial<ITranslation<typeof datasetControlTranslations & typeof gridTranslations>>, IDatasetControlComponentProps>, 'parameters' | 'context' | 'state'> {
    /**
     * Used to provide the Dataset control instance.
     */
    onGetDatasetControlInstance: () => IDatasetControl;
    /**
     * Tells the Dataset control which UI component should be used for the dataset.
     */
    onGetControlComponent: (props: Omit<IDatasetControlProps, 'onOverrideComponentProps'> & { parameters: IDatasetControlParameters; context: ComponentFramework.Context<any, any>, state: ComponentFramework.Dictionary }) => React.ReactElement<IControl<any, any, any, any>>
}

export interface IDatasetControlParameters extends IGridParameters {
    EnableEditColumns?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnableViewSwitcher?: Omit<ITwoOptionsProperty, 'attributes'>;
    ClientApiWebresourceName?: IStringProperty;
    ClientApiFunctionName?: IStringProperty;
    UserQueryScope?: IStringProperty;
}

export interface IDatasetControlComponentProps {
    onRender: (props: IComponentProps, defaultRender: (props: IComponentProps) => React.ReactElement) => React.ReactElement;
}

export interface IComponentProps {
    container: ThemeProviderProps;
    onRenderControlContainer: (props: IControlContainerProps, defaultRender: (props: IControlContainerProps) => React.ReactElement) => React.ReactElement;
    onRenderHeader: (props: IHeaderProps, defaultRender: (props: IHeaderProps) => React.ReactElement) => React.ReactElement;
    onRenderFooter: (props: IFooterProps, defaultRender: (props: IFooterProps) => React.ReactElement) => React.ReactElement;

}

interface IControlContainerProps {
    controlContainerProps: React.HTMLAttributes<HTMLDivElement>;
    shouldLoadControlComponent: boolean;
    onRenderLoading: () => React.ReactElement;
}

export interface IFooterProps {
    footerContainerProps: React.HTMLAttributes<HTMLDivElement>;
    onRenderPagination: (props: IPaginationProps, defaultRender: (props: IPaginationProps) => React.ReactElement) => React.ReactElement;
}

export interface IPaginationProps {
    paginationContainerProps: React.HTMLAttributes<HTMLDivElement>;
    commandBarProps: ICommandBarProps;
    pageSizeSwitcherProps: IButtonProps;
    onRenderCommandBar: (props: ICommandBarProps, defaultRender: (props: ICommandBarProps) => React.ReactElement) => React.ReactElement;
    onRenderPageSizeSwitcher: (props: IButtonProps, defaultRender: (props: IButtonProps) => React.ReactElement) => React.ReactElement;

}

export interface IHeaderProps {
    headerContainerProps: React.HTMLAttributes<HTMLDivElement>;
    onRenderRibbonQuickFindWrapper: (props: IRibbonQuickFindWrapperProps, defaultRender: (props: IRibbonQuickFindWrapperProps) => React.ReactElement) => React.ReactElement;
    onRenderErrorMessageBar: (props: IErrorMessageBarProps, defaultRender: (props: IErrorMessageBarProps) => React.ReactElement) => React.ReactElement;
    onRenderUnsavedChangesMessageBar: (props: IUnsavedChangesMesssageBarProps, defaultRender: (props: IUnsavedChangesMesssageBarProps) => React.ReactElement) => React.ReactElement;
}

export interface IRibbonQuickFindWrapperProps {
    ribbonQuickFindContainerProps: React.HTMLAttributes<HTMLDivElement>;
    isRibbonVisible: boolean;
    isQuickFindVisible: boolean;
    isViewSwitcherVisible: boolean;
    isEditColumnsVisible: boolean;
    isEditFiltersVisible: boolean;
    onRenderQuickFind: (props: IQuickFindProps, defaultRender: (props: IQuickFindProps) => React.ReactElement) => React.ReactElement;
    onRenderRibbon: IRibbonComponentProps['onRender']
}

interface IErrorMessageBarProps {
    messageBarProps: IMessageBarProps;
    onRenderMessageBar: (props: IMessageBarProps, defaultRender: (props: IMessageBarProps) => React.ReactElement) => React.ReactElement;
}

interface IUnsavedChangesMesssageBarProps {
    messageBarProps: IMessageBarProps;
    onRenderSaveBtn: (props: IButtonProps, defaultRender: (props: IButtonProps) => React.ReactElement) => React.ReactElement;
    onRenderDiscardBtn: (props: IButtonProps, defaultRender: (props: IButtonProps) => React.ReactElement) => React.ReactElement;
}

interface IColumnList extends React.HTMLAttributes<HTMLDivElement> {
    columns: IColumn[];
    onRenderColumnLabel: (props: ITextProps & { key: string }, defaultRender: (props: ITextProps) => React.ReactElement) => React.ReactElement;
}

interface ICalloutProps extends ICalloutPropsBase {
    isVisible: boolean;
    isLikeQuery: boolean;
    onRenderLikeOperatorWarning: (props: ITextProps, defaultRender: (props: ITextProps) => React.ReactElement) => React.ReactElement;
    onRenderBegingsWithFilterInfo: (props: ITextProps, defaultRender: (props: ITextProps) => React.ReactElement) => React.ReactElement;
    onRenderColumnsList: (props: IColumnList, defaultRender: (props: IColumnList) => React.ReactElement) => React.ReactElement;

}

interface ICalloutContainer extends React.HTMLAttributes<HTMLDivElement> {
    isVisible: boolean;
    onRenderCallout: (props: ICalloutProps, defaultRender: (props: ICalloutProps) => React.ReactElement) => React.ReactElement;
}

export interface IQuickFindProps {
    containerProps: React.HTMLAttributes<HTMLDivElement>;
    onRenderTextField: (props: ITextFieldProps, defaultRender: (props: ITextFieldProps) => React.ReactElement) => React.ReactElement;
    onRenderCalloutContainer: (props: ICalloutContainer, defaultRender: (props: ICalloutContainer) => React.ReactElement) => React.ReactElement;
}