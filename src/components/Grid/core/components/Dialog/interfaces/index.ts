import { IDialogProps as IDialogPropsBase } from '@fluentui/react';

export interface IDialogProps extends IDialogPropsBase {
    width?: number | string;
    height?: number | string;
    minHeight?: number;
}