import { IFileProperty } from "../../interfaces";
import { IControl, IOutputs } from "../../interfaces/context";
import { IBaseParameters } from "../../interfaces/parameters";

export interface IFile extends IControl<IFileParameters, IFileOutputs, any, any> {
}

export interface IFileParameters extends IBaseParameters {
    value: IFileProperty;
}

export interface IFileOutputs extends IOutputs {
    value?: ComponentFramework.FileObject;
}
