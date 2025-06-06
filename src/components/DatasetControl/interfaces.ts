import { ThemeProviderProps } from "@fluentui/react";
import { ITranslation } from "../../hooks";
import { IControl, ITwoOptionsProperty } from "../../interfaces";
import { IGridComponentProps, IGridOutputs, IGridParameters } from "../Grid";
import { gridTranslations } from "../Grid/translations";
import { datasetControlTranslations } from "./translations";
import { ITextFieldProps } from "@talxis/react-components";
import React from "react";

export interface IQuickFindProps {
    textFieldProps: ITextFieldProps;
    container: ThemeProviderProps;
}


export interface IDatasetControlComponentProps {
    onDatasetInit: () => void,
    containerProps: ThemeProviderProps;
    headerProps: {
        headerContainerProps: React.HTMLAttributes<HTMLDivElement>
        /**
         * Can be used to override the default header renderer (includes QuickFind).
         */
        onRender: (renderQuickFind: () => React.ReactElement) => React.ReactElement;
        onGetQuickFindProps: (props: IQuickFindProps) => IQuickFindProps;
    };
}


export interface IDatasetControl extends IControl<IGridParameters, IGridOutputs, Partial<ITranslation<typeof datasetControlTranslations & typeof gridTranslations>>, IDatasetControlComponentProps> {
    /**
     * Tells the Dataset control which UI component should be used for the dataset.
     */
    onGetControlComponent: (props: IControl<IGridParameters, any, any, any>) => React.ReactElement<IControl<any, any, any, any>>
}
