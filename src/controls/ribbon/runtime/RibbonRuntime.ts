import { EventEmitter } from "@talxis/client-libraries";
import { HookRegistry, IEventSubscriber, IRuntime, RuntimeLifecycle, IHookPoint } from "@core";
import { IRibbonActionCommand, IRibbonCommand } from "../interfaces";

/** What the ribbon raises; its init and teardown are on `lifecycle.events`. */
export interface IRibbonEvents {
    /** The commands were loaded again, after init. */
    onCommandsChanged: () => void;
    /** A reload failed; the commands before it stay. */
    onReloadFailed: (error: unknown) => void;
    onBeforeExecute: (command: IRibbonActionCommand) => void;
    /** Fires when `onExecute` throws, before `onAfterExecute`. */
    onExecuteFailed: (command: IRibbonActionCommand, error: unknown) => void;
    /** Fires once `onExecute` settles, whether it resolved or threw. */
    onAfterExecute: (command: IRibbonActionCommand) => void;
}

/** A hook over the commands the ribbon shows, which it adds to or changes in place. */
export type RibbonCommandsHook = (commands: IRibbonCommand[]) => void;

export interface IRibbonHooks {
    /** The commands, run after `onLoad` on every load; call `reload` to apply it now. */
    readonly commands: IHookPoint<RibbonCommandsHook>;
}

/** The ribbon's commands, and which of them are running. */
export interface IRibbon extends IRuntime {
    readonly events: IEventSubscriber<IRibbonEvents>;
    /** `undefined` until init finishes. */
    getCommands(): IRibbonCommand[] | undefined;
    isRunning(commandId: string): boolean;
    /** Loads the commands again in place; the latest call wins. */
    reload(): Promise<void>;
    readonly hooks: IRibbonHooks;
}

export interface IRibbonRuntimeParameters {
    onLoad?: (ribbon: IRibbon) => IRibbonCommand[] | Promise<IRibbonCommand[]>;
}

export class RibbonRuntime implements IRibbon {
    public readonly lifecycle = new RuntimeLifecycle({
        onInit: () => this._init(),
        onDestroy: () => this._destroy(),
    });
    public readonly events = new EventEmitter<IRibbonEvents>();
    private _onLoad?: (ribbon: IRibbon) => IRibbonCommand[] | Promise<IRibbonCommand[]>;
    public readonly hooks = {
        commands: new HookRegistry<RibbonCommandsHook>(),
    };
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
        this.hooks.commands.apply(commands);
        return commands;
    }
}
