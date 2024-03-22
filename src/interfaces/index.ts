import { IProperty } from './property';

export * from './context';
export * from './property';

export interface IOutputs {
    [key: string]: any
}

export interface IBindings {
    [key: string]: IProperty | undefined;
}
