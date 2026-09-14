import { Cell } from './cell';
import { CellContainer } from './cell-container';
import { RowResizeGrip } from './row-resize-grip';
import { Commands } from './commands';
import { Control } from './control';
import { CellLoading } from './loading';
import { Notifications } from './notifications';

export * from './cell';
export * from './cell-container';
export * from './row-resize-grip';
export * from './commands';
export * from './control';
export * from './loading';
export * from './notifications';

/** What draws a cell, and nothing that knows why. */
export interface ICellUi {
    Cell: typeof Cell;
    Container: typeof CellContainer;
    RowResizeGrip: typeof RowResizeGrip;
    Commands: typeof Commands;
    Control: typeof Control;
    Notifications: typeof Notifications;
    Loading: typeof CellLoading;
}

export const CellUi: ICellUi = {
    Cell: Cell,
    Container: CellContainer,
    RowResizeGrip: RowResizeGrip,
    Commands: Commands,
    Control: Control,
    Notifications: Notifications,
    Loading: CellLoading,
};
