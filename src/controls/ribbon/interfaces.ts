/** A command the ribbon draws as a button and runs when clicked. */
export interface IRibbonCommand {
    /** Stable across loads. */
    id: string;
    label: string;
    tooltip?: string;
    /** A Fluent icon name. */
    iconName?: string;
    /** The ribbon also disables a command while it runs. */
    isDisabled?: boolean;
    onExecute: () => Promise<void> | void;
}
