import { EventEmitter, IDataProvider, IEventEmitter, IInternalDataProvider } from "@talxis/client-libraries";
import type { IColumn } from "@talxis/client-libraries";
import type { ICommandBarItemProps } from "@legacy";
import { HookRegistry, IEventSubscriber, IHookPoint } from "@core";
import { IDatasetControlServiceLocator } from "../../interfaces";
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

export interface IDatasetControlEditColumnsHooks {
    /** The commands at the top of the editor. */
    readonly commands: IHookPoint<EditColumnsCommandsHook>;
    /** Each chosen column's commands. */
    readonly columnCommands: IHookPoint<EditColumnsColumnCommandsHook>;
}

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
    /** Asks about unsaved changes first, then writes the edit, closes the editor and remounts the control. */
    save(): Promise<void>;
    /** The edit in progress; there only while the editor is open. */
    getSession(): DatasetControlEditColumnsSession | undefined;
    readonly hooks: IDatasetControlEditColumnsHooks;
}

/** Whether the column editor is open, and the edit it holds while it is. */
export class DatasetControlEditColumns implements IDatasetControlEditColumns {
    public readonly events: IEventEmitter<IDatasetControlEditColumnsEvents> = new EventEmitter<IDatasetControlEditColumnsEvents>();
    private _services: IDatasetControlServiceLocator;
    private _provider: IDataProvider;
    private _session?: DatasetControlEditColumnsSession;
    public readonly hooks = {
        commands: new HookRegistry<EditColumnsCommandsHook>(),
        columnCommands: new HookRegistry<EditColumnsColumnCommandsHook>(),
    };

    constructor(parameters: IDatasetControlEditColumnsParameters) {
        this._services = parameters.services;
        this._provider = parameters.provider;
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
        this._session = undefined;
        this.events.dispatchEvent('onOpenChanged');
    }

    public async save(): Promise<void> {
        //resolves without writing anything when the user keeps their unsaved changes
        await (this._provider as IInternalDataProvider).executeWithUnsavedChangesBlocker(async () => {
            this._session?.save();
            this.close();
            //the next mount restores the setup this one keeps as it goes
            await this._services.get('runtime').reload();
        });
    }

    public getSession(): DatasetControlEditColumnsSession | undefined {
        return this._session;
    }

    /** The commands at the top of the editor. */
    public getCommands(session: DatasetControlEditColumnsSession): ICommandBarItemProps[] {
        const commands: ICommandBarItemProps[] = [];
        this.hooks.commands.apply(commands, session);
        return commands;
    }

    /** The commands of a chosen column, starting from Remove. */
    public getColumnCommands(column: IColumn, session: DatasetControlEditColumnsSession, removeCommand: ICommandBarItemProps): ICommandBarItemProps[] {
        const commands = [removeCommand];
        this.hooks.columnCommands.apply(commands, column, session);
        return commands;
    }
}
