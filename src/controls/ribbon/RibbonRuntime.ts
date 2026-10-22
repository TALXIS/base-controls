import { EventEmitter, IEventEmitter } from "@talxis/client-libraries";
import { HookRegistry } from "@utils/hook-registry";
import { IRibbonActionCommand, IRibbonCommand } from "./interfaces";

export interface IRibbonRuntimeEvents {
    /** Fired when a load starts, once the previous load's error is cleared. */
    onBeforeLoad: () => void;
    /** Fired when a load finishes, whether it returned commands or threw. */
    onLoaded: () => void;
    onBeforeExecute: (command: IRibbonActionCommand) => void;
    /** Fired when `onExecute` throws, before `onAfterExecute`. */
    onExecuteFailed: (command: IRibbonActionCommand, error: unknown) => void;
    /** Fired once `onExecute` settles, whether it resolved or threw. */
    onAfterExecute: (command: IRibbonActionCommand) => void;
}

/** A hook over the commands the ribbon shows, which it adds to or changes in place. */
export type RibbonCommandsHook = (commands: IRibbonCommand[]) => void;

/** The ribbon's commands, and which of them are running. */
export interface IRibbonRuntime {
    readonly events: IEventEmitter<IRibbonRuntimeEvents>;
    /** `undefined` until the first load finishes. */
    getCommands(): IRibbonCommand[] | undefined;
    /** What the last load threw, until the next one starts. */
    getError(): unknown;
    isRunning(commandId: string): boolean;
    /** Calls `onLoad` again; the latest call's commands win. */
    reload(): Promise<void>;
    /**
     * Registers a hook over the commands, run after `onLoad` on every load; call `reload` to apply it now.
     *
     * @param priority Ascending: a higher number gets the later word.
     */
    registerCommands(hook: RibbonCommandsHook, priority?: number): () => void;
}

export interface IRibbonRuntimeParameters {
    onLoad?: () => Promise<IRibbonCommand[]>;
}

export class RibbonRuntime implements IRibbonRuntime {
    public readonly events: IEventEmitter<IRibbonRuntimeEvents> = new EventEmitter<IRibbonRuntimeEvents>();
    private _onLoad?: () => Promise<IRibbonCommand[]>;
    private _commandsHooks = new HookRegistry<RibbonCommandsHook>();
    private _commands?: IRibbonCommand[];
    private _error?: unknown;
    //a slower earlier load must not overwrite a newer one
    private _latestLoad?: Promise<IRibbonCommand[]>;
    private _runningCommandIds = new Set<string>();

    constructor(parameters: IRibbonRuntimeParameters) {
        this._onLoad = parameters.onLoad;
    }

    public getCommands(): IRibbonCommand[] | undefined {
        return this._commands;
    }

    public getError(): unknown {
        return this._error;
    }

    public isRunning(commandId: string): boolean {
        return this._runningCommandIds.has(commandId);
    }

    public async reload(): Promise<void> {
        const load = this._onLoad?.() ?? Promise.resolve([]);
        this._latestLoad = load;
        this._error = undefined;
        this.events.dispatchEvent('onBeforeLoad');
        try {
            //a copy: the hooks change it in place, and `onLoad` may return the same array every time
            const commands = [...await load];
            if (load === this._latestLoad) {
                this._commandsHooks.apply(commands);
                this._commands = commands;
            }
        }
        catch (error) {
            if (load === this._latestLoad) {
                this._error = error;
            }
        }
        this.events.dispatchEvent('onLoaded');
    }

    public registerCommands(hook: RibbonCommandsHook, priority?: number): () => void {
        return this._commandsHooks.register(hook, priority);
    }

    public async execute(command: IRibbonActionCommand): Promise<void> {
        this._runningCommandIds.add(command.id);
        this.events.dispatchEvent('onBeforeExecute', command);
        try {
            await command.onExecute();
        }
        catch (error) {
            this.events.dispatchEvent('onExecuteFailed', command, error);
        }
        this._runningCommandIds.delete(command.id);
        this.events.dispatchEvent('onAfterExecute', command);
    }

    public destroy(): void {
        this._latestLoad = undefined;
        this.events.clearEventListeners();
    }
}
