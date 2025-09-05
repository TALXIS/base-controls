import { IButtonProps, IMessageBarProps, IShimmerProps, ThemeProviderProps } from "@fluentui/react";
import { ITranslation } from "../../hooks";
import { IControl } from "../../interfaces";
import { IGridOutputs, IGridParameters } from "../Grid";
import { gridTranslations } from "../Grid/translations";
import { datasetControlTranslations } from "./translations";
import { ICommandBarProps, ITextFieldProps } from "@talxis/react-components";
import React from "react";
import { IRibbonComponentProps } from "../Ribbon/interfaces";


export interface IDatasetControl extends IControl<IGridParameters, IGridOutputs, Partial<ITranslation<typeof datasetControlTranslations & typeof gridTranslations>>, IDatasetControlComponentProps> {
    /**
     * Tells the Dataset control which UI component should be used for the dataset.
     */
    onGetControlComponent: () => React.ReactElement<IControl<any, any, any, any>>
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

export interface IQuickFindProps {
    textFieldProps: ITextFieldProps;
    onRenderTextField: (props: ITextFieldProps, defaultRender: (props: ITextFieldProps) => React.ReactElement) => React.ReactElement;
}