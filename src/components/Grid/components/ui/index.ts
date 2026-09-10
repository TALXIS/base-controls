import { Cell } from './cell';
import { Control } from './control';
import { CellLoading } from './loading';
import { Notifications } from './notifications';

export * from './cell';
export * from './control';
export * from './loading';
export * from './notifications';

/** What draws a cell, and nothing that knows why. */
export interface ICellUi {
    Cell: typeof Cell;
    Control: typeof Control;
    Notifications: typeof Notifications;
    Loading: typeof CellLoading;
}

export const CellUi: ICellUi = {
    Cell: Cell,
    Control: Control,
    Notifications: Notifications,
    Loading: CellLoading,
};
