import { TaskGridUiSettingsMenu } from './settings-menu';
import { TaskGridUiTreeCellIndent } from './tree-cell-indent';
import { TaskGridUiPercentComplete } from './percent-complete';
import { TaskGridUiCommandsContainer } from './commands-container';
import { TaskGridUiCommandBar } from './command-bar';

export * from './settings-menu';
export * from './tree-cell-indent';
export * from './percent-complete';
export * from './commands-container';
export * from './command-bar';

/** The task grid's parts as plain UI, with no runtime behind them. */
export interface ITaskGridUi {
    /** A button opening a menu of toggles. */
    SettingsMenu: typeof TaskGridUiSettingsMenu;
    /** The room before a task's subject that shows how deep in the tree it is. */
    TreeCellIndent: typeof TaskGridUiTreeCellIndent;
    /** A bar filled to the value, with the value after it. */
    PercentComplete: typeof TaskGridUiPercentComplete;
    /** The element a task's row commands are drawn in. */
    CommandsContainer: typeof TaskGridUiCommandsContainer;
    /** The first command on the bar and the others in its menu. */
    CommandBar: typeof TaskGridUiCommandBar;
}

/** Every part of the task grid as plain UI, with no runtime behind it. */
export const TaskGridUi: ITaskGridUi = {
    SettingsMenu: TaskGridUiSettingsMenu,
    TreeCellIndent: TaskGridUiTreeCellIndent,
    PercentComplete: TaskGridUiPercentComplete,
    CommandsContainer: TaskGridUiCommandsContainer,
    CommandBar: TaskGridUiCommandBar,
};
