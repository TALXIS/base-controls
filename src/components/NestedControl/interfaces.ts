import { IParameters } from "../../interfaces";
import { IControl, IOutputs } from "../../interfaces/context";
import { IBinding, IControlStates } from "./NestedControl";

type ControlNameOptions = 'TextField' | 'OptionSet' | 'MultiSelectOptionSet' | 'Lookup' | 'Decimal' | 'Duration' | 'DateTime' | 'GridCellRenderer' | (string & {});

export interface INestedControlRenderer extends IControl<INestedControlRendererParameters, IOutputs, any, INestedControlRendererComponentProps> {
}

export interface INestedControlRendererParameters extends IParameters {
    ControlName: ControlNameOptions
    Bindings: {
        [key: string]: IBinding
    }
    ControlStates?: IControlStates;
}

export interface INestedControlRendererComponentProps {
    rootClassName?: string;
    onGetProps: () => ((props: IControl<any, any, any, any>) => IControl<any, any, any, any>) | undefined
    onOverrideBaseControlProps: (props: any) => any;   
}




