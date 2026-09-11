import { Cell } from './cell';
import { CellTheme } from './cell-theme';
import { Control } from './control';
import { CellLoading } from './loading';
import { Notifications } from './notifications';

export * from './cell';
export * from './cell-theme';
export * from './control';
export * from './loading';
export * from './notifications';

/** What draws a cell, and nothing that knows why. */
export interface ICellUi {
    Cell: typeof Cell;
    Theme: typeof CellTheme;
    Control: typeof Control;
    Notifications: typeof Notifications;
    Loading: typeof CellLoading;
}

export const CellUi: ICellUi = {
    Cell: Cell,
    Theme: CellTheme,
    Control: Control,
    Notifications: Notifications,
    Loading: CellLoading,
};
