import { EventEmitter, IDataProvider, IEventEmitter } from "@talxis/client-libraries";
import type { IColumn } from "@talxis/client-libraries";
import type { ICommandBarItemProps } from "@legacy";
import { HookRegistry, IEventSubscriber } from "@utils";
import { IDatasetControlServiceLocator } from "../../../runtime/interfaces";
import { DatasetControlEditColumnsSession } from "./DatasetControlEditColumnsSession";

/** What the column editor raises. */
export interface IDatasetControlEditColumnsEvents {
    /** The editor opened or closed. */
    onOpenChanged: () => void;
}

export interface IDatasetControlEditColumnsParameters {
    services: IDatasetControlServiceLocator;
    provider: IDataProvider;
}

/** A hook over the commands at the top of the column editor, which it adds to or changes in place. */
export type EditColumnsCommandsHook = (commands: ICommandBarItemProps[], session: DatasetControlEditColumnsSession) => void;

/** A hook over the commands of one chosen column, Remove first, which it adds to or changes in place. */
export type EditColumnsColumnCommandsHook = (commands: ICommandBarItemProps[], column: IColumn, session: DatasetControlEditColumnsSession) => void;

/** Opens and closes the column editor. */
export interface IDatasetControlEditColumns {
    /** Subscribe to the editor's events. */
    readonly events: IEventSubscriber<IDatasetControlEditColumnsEvents>;
    /** Whether the editor is open. */
    isOpen(): boolean;
    /** Opens the editor over a copy of the provider's columns. */
    open(): void;
    /** Closes the editor and drops whatever was not saved. */
    close(): void;
    /** Writes the edit to the provider, closes the editor and mounts the control anew with it. */
    save(): void;
    /** The edit in progress; there only while the editor is open. */
    getSession(): DatasetControlEditColumnsSession | undefined;
    /**
     * Registers a hook over the commands at the top of the editor.
     * @param priority Ascending: a higher number gets the later word.
     */
    registerCommands(hook: EditColumnsCommandsHook, priority?: number): () => void;
    /**
     * Registers a hook over each chosen column's commands.
     * @param priority Ascending: a higher number gets the later word.
     */
    registerColumnCommands(hook: EditColumnsColumnCommandsHook, priority?: number): () => void;
}

/** Whether the column editor is open, and the edit it holds while it is. */
export class DatasetControlEditColumns implements IDatasetControlEditColumns {
    public readonly events: IEventEmitter<IDatasetControlEditColumnsEvents> = new EventEmitter<IDatasetControlEditColumnsEvents>();
    private _services: IDatasetControlServiceLocator;
    private _provider: IDataProvider;
    private _session?: DatasetControlEditColumnsSession;
    private _commandsHooks = new HookRegistry<EditColumnsCommandsHook>();
    private _columnCommandsHooks = new HookRegistry<EditColumnsColumnCommandsHook>();

    constructor(parameters: IDatasetControlEditColumnsParameters) {
        this._services = parameters.services;
        this._provider = parameters.provider;
        this._services.register('editColumns', () => this);
    }

    public isOpen(): boolean {
        return !!this._session;
    }

    /** Opens the editor over a copy of the provider's columns. */
    public open(): void {
        if (this._session) {
            return;
        }
        this._session = new DatasetControlEditColumnsSession({ provider: this._provider });
        this.events.dispatchEvent('onOpenChanged');
    }

    /** Closes the editor and drops whatever was not saved. */
    public close(): void {
        if (!this._session) {
            return;
        }
        this._session.destroy();
        this._session = undefined;
        this.events.dispatchEvent('onOpenChanged');
    }

    /** Writes the edit to the provider and closes the editor. */
    public save(): void {
        this._session?.save();
        this.close();
        //the next mount restores the setup this one keeps as it goes
        this._services.get('runtime').reload();
    }

    public getSession(): DatasetControlEditColumnsSession | undefined {
        return this._session;
    }

    public registerCommands(hook: EditColumnsCommandsHook, priority?: number): () => void {
        return this._commandsHooks.register(hook, priority);
    }

    public registerColumnCommands(hook: EditColumnsColumnCommandsHook, priority?: number): () => void {
        return this._columnCommandsHooks.register(hook, priority);
    }

    /** The commands at the top of the editor. */
    public getCommands(session: DatasetControlEditColumnsSession): ICommandBarItemProps[] {
        const commands: ICommandBarItemProps[] = [];
        this._commandsHooks.apply(commands, session);
        return commands;
    }

    /** The commands of a chosen column, starting from Remove. */
    public getColumnCommands(column: IColumn, session: DatasetControlEditColumnsSession, removeCommand: ICommandBarItemProps): ICommandBarItemProps[] {
        const commands = [removeCommand];
        this._columnCommandsHooks.apply(commands, column, session);
        return commands;
    }

    public destroy(): void {
        this._session?.destroy();
        if (this._services.find('editColumns') === this) {
            this._services.unregister('editColumns');
        }
        this.events.clearEventListeners();
    }
}
