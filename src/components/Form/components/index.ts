import { Cell } from './adapters';
import { ICellProps } from './cell';
import { IFormProps } from './form';
import { Form as FormComponent } from './form';

export * from './tabs';
export * from './tab';
export * from './column';
export * from './section';
export * from './cell';
export * from './field';
export * from './form';
export * from './ribbon';
export * from './skeleton';
export * from './notifications';

export interface IFormComponents {
    Root: React.FC<IFormProps>;
    Cell: React.FC<ICellProps>;
}

export const Form: IFormComponents = {
    Root: FormComponent,
    Cell: Cell
}
