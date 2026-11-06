import { EventEmitter } from "@talxis/client-libraries";
import { HookRegistry, IEventSubscriber, IRuntime, RuntimeLifecycle } from "@core";
import { IRibbonActionCommand, IRibbonCommand } from "../interfaces";

/** What the ribbon raises; its init and teardown are on `lifecycle.events`. */
export interface IRibbonRuntimeEvents {
    /** The commands were loaded again, after init. */
    onCommandsChanged: () => void;
    /** A reload failed; the commands before it stay. */
    onReloadFailed: (error: unknown) => void;
    onBeforeExecute: (command: IRibbonActionCommand) => void;
    /** Fired when `onExecute` throws, before `onAfterExecute`. */
    onExecuteFailed: (command: IRibbonActionCommand, error: unknown) => void;
    /** Fired once `onExecute` settles, whether it resolved or threw. */
    onAfterExecute: (command: IRibbonActionCommand) => void;
}

/** A hook over the commands the ribbon shows, which it adds to or changes in place. */
export type RibbonCommandsHook = (commands: IRibbonCommand[]) => void;

/** The ribbon's commands, and which of them are running. */
export interface IRibbonRuntime extends IRuntime {
    readonly events: IEventSubscriber<IRibbonRuntimeEvents>;
    /** `undefined` until init finishes. */
    getCommands(): IRibbonCommand[] | undefined;
    isRunning(commandId: string): boolean;
    /** Loads the commands again in place; the latest call wins. */
    reload(): Promise<void>;
    /**
     * Registers a hook over the commands, run after `onLoad` on every load; call `reload` to apply it now.
     *
     * @param priority Ascending: a higher number gets the later word.
     */
    registerCommands(hook: RibbonCommandsHook, priority?: number): () => void;
}

export interface IRibbonRuntimeParameters {
    onLoad?: (ribbon: IRibbonRuntime) => IRibbonCommand[] | Promise<IRibbonCommand[]>;
}

export class RibbonRuntime implements IRibbonRuntime {
    public readonly lifecycle = new RuntimeLifecycle({
        onInit: () => this._init(),
        onDestroy: () => this._destroy(),
    });
    public readonly events = new EventEmitter<IRibbonRuntimeEvents>();
    private _onLoad?: (ribbon: IRibbonRuntime) => IRibbonCommand[] | Promise<IRibbonCommand[]>;
    private _commandsHooks = new HookRegistry<RibbonCommandsHook>();
    private _commands?: IRibbonCommand[];
    //a slower earlier reload must not overwrite a newer one
    private _latestReload?: Promise<IRibbonCommand[]>;
    private _runningCommandIds = new Set<string>();

    constructor(parameters: IRibbonRuntimeParameters) {
        this._onLoad = parameters.onLoad;
    }

    public getCommands(): IRibbonCommand[] | undefined {
        return this._commands;
    }

    public isRunning(commandId: string): boolean {
        return this._runningCommandIds.has(commandId);
    }

    public registerCommands(hook: RibbonCommandsHook, priority?: number): () => void {
        return this._commandsHooks.register(hook, priority);
    }

    public async reload(): Promise<void> {
        //init applies the hooks itself
        if (this.lifecycle.getStatus() !== 'ready') {
            return;
        }
        const reload = this._loadCommands();
        this._latestReload = reload;
        try {
            const commands = await reload;
            if (reload === this._latestReload && !this.lifecycle.isDestroyed()) {
                this._commands = commands;
                this.events.dispatchEvent('onCommandsChanged');
            }
        }
        catch (error) {
            if (reload === this._latestReload && !this.lifecycle.isDestroyed()) {
                this.events.dispatchEvent('onReloadFailed', error);
            }
        }
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

    private async _init(): Promise<void> {
        this._commands = await this._loadCommands();
    }

    private _destroy(): void {
        this._latestReload = undefined;
        this.events.clearEventListeners();
    }

    private async _loadCommands(): Promise<IRibbonCommand[]> {
        //a copy: the hooks change it in place, and onLoad may return the same array every time
        const commands = [...await this._onLoad?.(this) ?? []];
        this._commandsHooks.apply(commands);
        return commands;
    }
}
