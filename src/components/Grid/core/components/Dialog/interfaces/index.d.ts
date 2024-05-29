import { IDialogProps as IDialogPropsBase } from '@fluentui/react/lib/Dialog';

export interface IDialogProps extends IDialogPropsBase {
    width?: number | string;
    height?: number | string;
    minHeight?: number;
}