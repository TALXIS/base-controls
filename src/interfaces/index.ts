import { IProperty } from './property';

export * from './context';
export * from './property';

export interface IOutputs {
    [key: string]: any
}

export interface IParameters {
    [key: string]: IProperty | undefined | any;
}
