import { Cell } from './cell';
import { CellContainer } from './cell-container';
import { Commands } from './commands';
import { Control } from './control';
import { CellLoading } from './loading';
import { Notifications } from './notifications';

export * from './cell';
export * from './cell-container';
export * from './commands';
export * from './control';
export * from './loading';
export * from './notifications';

/** What draws a cell, and nothing that knows why. */
export interface ICellUi {
    Cell: typeof Cell;
    Container: typeof CellContainer;
    Commands: typeof Commands;
    Control: typeof Control;
    Notifications: typeof Notifications;
    Loading: typeof CellLoading;
}

export const CellUi: ICellUi = {
    Cell: Cell,
    Container: CellContainer,
    Commands: Commands,
    Control: Control,
    Notifications: Notifications,
    Loading: CellLoading,
};
