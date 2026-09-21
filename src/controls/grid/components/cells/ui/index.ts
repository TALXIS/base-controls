import { CellUiContainer } from './cell-container';
import { CellUiFieldError } from './field-error';
import { CellUiResizeGrip } from './row-resize-grip';
import { CellUiCommands } from './commands';
import { CellUiControl } from './control';
import { CellUiLoading } from './loading';
import { CellUiNotifications } from './notifications';

export * from './cell-container';
export * from './field-error';
export * from './row-resize-grip';
export * from './commands';
export * from './control';
export * from './loading';
export * from './notifications';

/** What draws a cell, and nothing that knows why. */
export interface ICellUi {
    Container: typeof CellUiContainer;
    FieldError: typeof CellUiFieldError;
    ResizeGrip: typeof CellUiResizeGrip;
    Commands: typeof CellUiCommands;
    Control: typeof CellUiControl;
    Loading: typeof CellUiLoading;
    Notifications: typeof CellUiNotifications;
}

export const CellUi: ICellUi = {
    Container: CellUiContainer,
    FieldError: CellUiFieldError,
    ResizeGrip: CellUiResizeGrip,
    Commands: CellUiCommands,
    Control: CellUiControl,
    Loading: CellUiLoading,
    Notifications: CellUiNotifications,
};
