/** What every ribbon command has. */
export interface IRibbonCommandBase {
    /** Stable across loads. */
    id: string;
    label: string;
    tooltip?: string;
    /** A Fluent icon name. */
    iconName?: string;
    /** The ribbon also disables an action while it runs. */
    isDisabled?: boolean;
}

/** A command the ribbon runs when clicked. */
export interface IRibbonActionCommand extends IRibbonCommandBase {
    onExecute: () => Promise<void> | void;
    commands?: never;
}

/** A command that opens a menu of further commands. */
export interface IRibbonMenuCommand extends IRibbonCommandBase {
    /** Drawn disabled when empty. */
    commands: IRibbonCommand[];
    onExecute?: never;
}

/** What the ribbon draws: a button that runs, or a menu. */
export type IRibbonCommand = IRibbonActionCommand | IRibbonMenuCommand;
