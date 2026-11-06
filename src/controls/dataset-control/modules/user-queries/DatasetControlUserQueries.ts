import { ContextualMenuItemType, IContextualMenuItem } from "@fluentui/react";
import { EventEmitter, IDataProvider, ILinkEntityExposedExpression } from "@talxis/client-libraries";
import type { IDatasetControlInternal } from "../../runtime/DatasetControlRuntime";
import type { IDatasetControlView, IDatasetControlViewDefinition } from "../../runtime/interfaces";
import type { IEventSubscriber } from "@core";
import type { LabelsOf } from "@labels";
import { USER_QUERIES_LABELS } from "./labels";
import type { IUserQueriesStore, IUserQueryColumn, IUserQueryListItem, IUserQuerySavedValueMap, IUserQueryView } from "./interfaces";

/** The id of the group the user's views are listed under. */
export const USER_QUERIES_GROUP = 'userQueries';

/** Which of the user views' commands the view switcher offers; each is on unless set to `false`. */
export interface IUserQueriesCommands {
    enableSaveAsNewView?: boolean;
    /** Save changes, while a user view is shown. */
    enableSaveChanges?: boolean;
    enableManageViews?: boolean;
}

export interface IDatasetControlUserQueriesParameters extends IUserQueriesCommands {
    datasetControl: IDatasetControlInternal;
    store: IUserQueriesStore;
}

export interface IDatasetControlUserQueriesEvents {
    /** The user picked Manage views. */
    onManageRequested: () => void;
    /** An operation on the user's views failed. */
    onOperationFailed: (error: unknown) => void;
}

type SavedValues = { [key: string]: unknown };

interface ISavedValue {
    get: () => unknown;
    apply?: (value: unknown, provider: IDataProvider) => void;
}

/** The user's views of one mount: listed with the control's, saved, and opened with what they kept. */
export class DatasetControlUserQueries {
    private _events = new EventEmitter<IDatasetControlUserQueriesEvents>();
    private _datasetControl: IDatasetControlInternal;
    private _store: IUserQueriesStore;
    private _commands: IUserQueriesCommands;
    private _savedValues = new Map<string, ISavedValue>();
    private _views: IUserQueryListItem[] = [];
    private _manageProvider?: IDataProvider;

    constructor(parameters: IDatasetControlUserQueriesParameters) {
        const { datasetControl, store, ...commands } = parameters;
        this._datasetControl = datasetControl;
        this._store = store;
        this._commands = commands;
        datasetControl.addViewsHook(this._addViews);
        datasetControl.parts.observe('viewSwitcher', viewSwitcher => viewSwitcher.addItemsHook(this._addCommands));
    }

    public get events(): IEventSubscriber<IDatasetControlUserQueriesEvents> {
        return this._events;
    }

    /** Lists the user's views. */
    public async load(): Promise<void> {
        this._views = await this._store.getViews();
    }

    /**
     * Saves what `getValue` returns with every user view, under its key.
     * @param getValue Called on every save; `undefined` saves nothing under the key.
     * @param applyValue Called with the saved value as a user view opens, before its first page loads.
     */
    public saveWithView<TKey extends keyof IUserQuerySavedValueMap & string>(key: TKey, getValue: () => IUserQuerySavedValueMap[TKey] | undefined, applyValue?: (value: IUserQuerySavedValueMap[TKey], provider: IDataProvider) => void): () => void {
        if (this._savedValues.has(key)) {
            throw new Error(`The saved value "${key}" is registered twice.`);
        }
        //what a view kept comes back from the store untyped
        const savedValue: ISavedValue = { get: getValue, apply: applyValue && ((value, provider) => applyValue(value as IUserQuerySavedValueMap[TKey], provider)) };
        this._savedValues.set(key, savedValue);
        return () => {
            if (this._savedValues.get(key) === savedValue) {
                this._savedValues.delete(key);
            }
        };
    }

    /** The user's views as records, for Manage views. */
    public getManageProvider(): IDataProvider {
        this._manageProvider ??= this._store.createManageProvider();
        return this._manageProvider;
    }

    /** Deletes the views, then lists the ones left in Manage views. */
    public async deleteViews(viewIds: string[]): Promise<void> {
        await this._run(async () => {
            const provider = this.getManageProvider();
            const { results } = await provider.deleteRecords(viewIds);
            await provider.refresh();
            const errors = results.filter(result => !result.success).map(result => result.errorMessage ?? this._labels.get('userQueries.deleteFailed'));
            if (errors.length > 0) {
                throw new Error(errors.join('\n'));
            }
        });
    }

    public destroy(): void {
        this._manageProvider?.destroy();
    }

    private get _labels(): LabelsOf<typeof USER_QUERIES_LABELS> {
        return this._datasetControl.getLabels(USER_QUERIES_LABELS);
    }

    //listed after the control's own, in their own group
    private _addViews = (views: IDatasetControlView[]): void => {
        const group = { id: USER_QUERIES_GROUP, name: this._labels.get('userQueries.myViewsHeader') };
        for (const { id, name } of this._views) {
            views.push({ id, name, group, resolve: provider => this._resolveView(id, provider) });
        }
    };

    private _resolveView = async (viewId: string, provider: IDataProvider): Promise<IDatasetControlViewDefinition> => {
        const { columns, linking = [], data } = await this._store.getView(viewId);
        this._applySavedValues(data as SavedValues | undefined, provider);
        return { columns, linking, data };
    };

    //the switcher reads its items as its menu opens
    private _addCommands = (items: IContextualMenuItem[]): void => {
        const commands: IContextualMenuItem[] = [];
        if (this._commands.enableSaveChanges !== false && this._isOnUserView()) {
            commands.push({ key: 'saveChanges', text: this._labels.get('userQueries.saveChanges'), iconProps: { iconName: 'Save' }, onClick: this._saveChanges });
        }
        if (this._commands.enableSaveAsNewView !== false) {
            commands.push({ key: 'saveAsNewView', text: this._labels.get('userQueries.saveAsNewView'), iconProps: { iconName: 'SaveAs' }, onClick: this._saveAsNewView });
        }
        if (this._commands.enableManageViews !== false) {
            commands.push({ key: 'manageViews', text: this._labels.get('userQueries.manageViews'), iconProps: { iconName: 'Settings' }, onClick: this._openManageViews });
        }
        if (commands.length > 0) {
            items.push({ key: 'userQueriesDivider', itemType: ContextualMenuItemType.Divider }, ...commands);
        }
    };

    private _saveChanges = (): void => {
        const viewId = this._datasetControl.getViewId()!;
        this._run(() => this._store.updateView(viewId, this._getView()));
    };

    private _saveAsNewView = (): void => {
        const name = window.prompt(this._labels.get('userQueries.viewName'))?.trim();
        if (name) {
            this._run(async () => this._datasetControl.loadView(await this._store.createView(name, this._getView())));
        }
    };

    private _openManageViews = (): void => {
        this._events.dispatchEvent('onManageRequested');
    };

    private _isOnUserView(): boolean {
        const viewId = this._datasetControl.getViewId();
        return this._views.some(view => view.id === viewId);
    }

    //what the control shows, as a view keeps it
    private _getView(): IUserQueryView {
        const provider = this._datasetControl.getProvider();
        const columns = (provider?.getColumns() ?? []).map(({ name, isHidden, order, visualSizeFactor, grouping, aggregation }): IUserQueryColumn => ({ name, isHidden, order, visualSizeFactor, grouping, aggregation }));
        return { columns, linking: this._getUsedLinking(provider?.getLinking() ?? [], columns), data: this._getSavedValues() };
    }

    private _getSavedValues(): SavedValues | undefined {
        const values = [...this._savedValues].map(([key, { get }]) => [key, get()]).filter(([, value]) => value !== undefined);
        return values.length > 0 ? Object.fromEntries(values) : undefined;
    }

    private _applySavedValues(values: SavedValues = {}, provider: IDataProvider): void {
        for (const [key, value] of Object.entries(values)) {
            this._savedValues.get(key)?.apply?.(value, provider);
        }
    }

    //the link each related column comes through, with the links that one hangs off
    private _getUsedLinking(linking: ILinkEntityExposedExpression[], columns: IUserQueryColumn[]): ILinkEntityExposedExpression[] {
        const linksByAlias = new Map(linking.filter(link => link.alias).map(link => [link.alias!, link]));
        const usedAliases = new Set<string>();
        const use = (alias: string | undefined) => {
            const link = alias === undefined ? undefined : linksByAlias.get(alias);
            if (link && !usedAliases.has(alias!)) {
                usedAliases.add(alias!);
                use(link.parentLinkedEntityAlias);
            }
        };
        columns.filter(column => column.name.includes('.')).forEach(column => use(column.name.split('.')[0]));
        return linking.filter(link => link.alias && usedAliases.has(link.alias));
    }

    //the menu calls operations without awaiting them
    private async _run(operation: () => Promise<void>): Promise<void> {
        try {
            await operation();
        }
        catch (error) {
            this._events.dispatchEvent('onOperationFailed', error);
        }
    }
}

declare module "../../runtime/interfaces" {
    interface IDatasetControlModuleMap {
        /** The user's own views. */
        userQueries: DatasetControlUserQueries;
    }
}
