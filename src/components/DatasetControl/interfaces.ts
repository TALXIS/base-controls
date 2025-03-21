import { ThemeProviderProps } from "@fluentui/react";
import { ITranslation } from "../../hooks";
import { IControl, ITwoOptionsProperty } from "../../interfaces";
import { IGridOutputs, IGridParameters } from "../Grid";
import { gridTranslations } from "../Grid/translations";
import { datasetControlTranslations } from "./translations";
import { ITextFieldProps } from "@talxis/react-components";

export interface IQuickFindProps {
    textFieldProps: ITextFieldProps;
    container: ThemeProviderProps;
}


export interface IDatasetControlComponentProps {
    onDatasetInit: () => void,
    containerProps: ThemeProviderProps;
    headerProps: {
        headerContainerProps: React.HTMLAttributes<HTMLDivElement>
        onRender: (renderQuickFind: () => React.ReactElement) => React.ReactElement;
        onGetQuickFindProps: (props: IQuickFindProps) => IQuickFindProps;
    };
}


export interface IDatasetControl extends IControl<IGridParameters, IGridOutputs, Partial<ITranslation<typeof datasetControlTranslations & typeof gridTranslations>>, IDatasetControlComponentProps> {
    EnableQuickFind?: Omit<ITwoOptionsProperty, 'attributes'>
}
