import { IDecimalNumberProperty } from "../../interfaces";
import { IInputStaticBindings } from "../../interfaces/bindings";
import { IComponent, IOutputs } from "../../interfaces/context";

export interface IDecimal extends IComponent<IDecimalBindings, IDecimalOutputs> {
    
}

interface IDecimalBindings extends IInputStaticBindings {
    value: IDecimalNumberProperty;
}

interface IDecimalOutputs extends IOutputs {
    value?: number;
}