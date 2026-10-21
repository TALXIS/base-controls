import { ContextualMenuItemType, IContextualMenuItem } from "@fluentui/react";
import { EventEmitter, IColumn, IDataProvider, ILinkEntityExposedExpression, IRecordSaveOperationResult } from "@talxis/client-libraries";
import type { IDatasetControlRuntime } from "../../runtime/DatasetControlRuntime";
import type { IDatasetControl, IDatasetControlView, IDatasetControlViewDefinition } from "../../runtime/interfaces";
import type { IEventSubscriber, ILocalizationService } from "@utils";
import type { IUserQueriesLabels } from "./labels";
import type { IUserQueriesStore, IUserQueryColumn, IUserQueryListItem, IUserQueryView } from "./interfaces";

/** The id of the group the user's views are listed under. */
export const USER_QUERIES_GROUP = 'userQueries';

export interface IDatasetControlUserQueriesParameters {
    datasetControl: IDatasetControlRuntime;
    store: IUserQueriesStore;
    labels: ILocalizationService<IUserQueriesLabels>;
    onGetViewData?: (datasetControl: IDatasetControl) => unknown;
    onGetColumn: (columnName: string, linking: ILinkEntityExposedExpression[]) => IColumn | null | Promise<IColumn | null>;
}

export interface IDatasetControlUserQueriesEvents {
    /** The user picked Manage views. */
    onManageRequested: () => void;
    /** An operation on the user's views failed. */
    onOperationFailed: (error: unknown) => void;
}

/** The user's views of one mount: listing, adding and saving them, and their commands in the view switcher. */
export class DatasetControlUserQueries {
    private _events = new EventEmitter<IDatasetControlUserQueriesEvents>();
    private _datasetControl: IDatasetControlRuntime;
    private _store: IUserQueriesStore;
    private _labels: ILocalizationService<IUserQueriesLabels>;
    private _onGetViewData?: (datasetControl: IDatasetControl) => unknown;
    private _onGetColumn: (columnName: string, linking: ILinkEntityExposedExpression[]) => IColumn | null | Promise<IColumn | null>;
    private _views: IUserQueryListItem[] = [];
    private _manageProvider?: IDataProvider;

    constructor(parameters: IDatasetControlUserQueriesParameters) {
        this._datasetControl = parameters.datasetControl;
        this._store = parameters.store;
        this._labels = parameters.labels;
        this._onGetViewData = parameters.onGetViewData;
        this._onGetColumn = parameters.onGetColumn;
        this._datasetControl.registerViews(this._addViews);
        this._datasetControl.parts.whenAvailable('viewSwitcher', viewSwitcher => viewSwitcher.registerItems(this._addViewSwitcherItems));
    }

    public get events(): IEventSubscriber<IDatasetControlUserQueriesEvents> {
        return this._events;
    }

    public getLabels(): ILocalizationService<IUserQueriesLabels> {
        return this._labels;
    }

    /** The user's views as records, for Manage views. */
    public getManageProvider(): IDataProvider {
        this._manageProvider ??= this._store.createManageProvider();
        return this._manageProvider;
    }

    /** Lists the user's views. */
    public async load(): Promise<void> {
        this._views = await this._store.getViews();
    }

    public isUserView(viewId: string | undefined): boolean {
        return this._views.some(view => view.id === viewId);
    }

    /** Saves a new view under the name, and opens it. */
    public async create(name: string): Promise<void> {
        await this._execute(async () => {
            const viewId = await this._store.createView(name, await this._getView());
            await this._datasetControl.loadView(viewId);
        });
    }

    /** Asks for a name, then saves a new view under it and opens it. */
    public async saveAsNew(): Promise<void> {
        const name = window.prompt(this._labels.getLocalizedString('viewName'))?.trim();
        if (name) {
            await this.create(name);
        }
    }

    /** Saves what the control shows into the user view it is on. */
    public async save(): Promise<void> {
        const viewId = this._datasetControl.getViewId();
        if (viewId && this.isUserView(viewId)) {
            await this._execute(async () => this._store.updateView(viewId, await this._getView()));
        }
    }

    /** Saves the changes made to the views in Manage views. */
    public async saveViews(): Promise<void> {
        await this._execute(async () => this._throwIfSaveFailed(await this.getManageProvider().save()));
    }

    /** Deletes the views, then lists the ones left in Manage views. */
    public async deleteViews(viewIds: string[]): Promise<void> {
        await this._execute(async () => {
            const provider = this.getManageProvider();
            const { results } = await provider.deleteRecords(viewIds);
            await provider.refresh();
            const failed = results.filter(result => !result.success);
            if (failed.length > 0) {
                throw new Error(failed.map(result => result.errorMessage ?? this._labels.getLocalizedString('deleteFailed')).join('\n'));
            }
        });
    }

    public destroy(): void {
        this._manageProvider?.destroy();
    }

    //listed after the control's own, in their own group
    private _addViews = (views: IDatasetControlView[]): void => {
        const group = { id: USER_QUERIES_GROUP, name: this._labels.getLocalizedString('myViewsHeader') };
        views.push(...this._views.map(({ id, name }) => ({ id, name, group, resolve: () => this._resolveView(id) })));
    };

    private _resolveView = async (viewId: string): Promise<IDatasetControlViewDefinition> => {
        const { columns, linking = [], data } = await this._store.getView(viewId);
        const definitions = await Promise.all(columns.map(column => this._onGetColumn(column.name, linking)));
        const definedColumns = columns.map((column, index) => this._toColumn(column, definitions[index])).filter((column): column is IColumn => !!column);
        return { columns: definedColumns, linking, data };
    };

    //its own metadata, so the provider setting up one view's column leaves the others alone
    private _toColumn(saved: IUserQueryColumn, definition: IColumn | null): IColumn | undefined {
        return definition ? { ...definition, ...saved, metadata: structuredClone(definition.metadata) } : undefined;
    }

    //the switcher reads its items as its menu opens
    private _addViewSwitcherItems = (items: IContextualMenuItem[]): void => {
        items.push({ key: 'userQueriesDivider', itemType: ContextualMenuItemType.Divider });
        if (this.isUserView(this._datasetControl.getViewId())) {
            items.push({ key: 'saveChanges', text: this._labels.getLocalizedString('saveChanges'), iconProps: { iconName: 'Save' }, onClick: () => { this.save(); } });
        }
        items.push(
            { key: 'saveAsNewView', text: this._labels.getLocalizedString('saveAsNewView'), iconProps: { iconName: 'SaveAs' }, onClick: () => { this.saveAsNew(); } },
            { key: 'manageViews', text: this._labels.getLocalizedString('manageViews'), iconProps: { iconName: 'Settings' }, onClick: () => this._events.dispatchEvent('onManageRequested') },
        );
    };

    //what the control shows, as a view keeps it
    private async _getView(): Promise<IUserQueryView> {
        const provider = this._datasetControl.getProvider();
        const columns = (provider?.getColumns() ?? []).map(({ name, isHidden, order, visualSizeFactor, grouping, aggregation }): IUserQueryColumn => ({ name, isHidden, order, visualSizeFactor, grouping, aggregation }));
        const linking = this._getUsedLinking(provider?.getLinking() ?? [], columns);
        return { columns, linking, data: await this._onGetViewData?.(this._datasetControl) };
    }

    //the links a related column's alias names, with the links they hang off
    private _getUsedLinking(linking: ILinkEntityExposedExpression[], columns: IUserQueryColumn[]): ILinkEntityExposedExpression[] {
        const usedAliases = new Set(columns.filter(column => column.name.includes('.')).map(column => column.name.split('.')[0]));
        let isGrowing = true;
        while (isGrowing) {
            isGrowing = false;
            for (const link of linking) {
                if (link.alias && usedAliases.has(link.alias) && link.parentLinkedEntityAlias && !usedAliases.has(link.parentLinkedEntityAlias)) {
                    usedAliases.add(link.parentLinkedEntityAlias);
                    isGrowing = true;
                }
            }
        }
        return linking.filter(link => !!link.alias && usedAliases.has(link.alias));
    }

    private _throwIfSaveFailed(results: IRecordSaveOperationResult[]): void {
        const failed = results.filter(result => !result.success);
        if (failed.length > 0) {
            const messages = failed.flatMap(result => result.errors?.map(error => error.message) ?? []);
            throw new Error(messages.length > 0 ? messages.join('\n') : this._labels.getLocalizedString('saveFailed'));
        }
    }

    //the menu calls operations without awaiting them
    private async _execute(operation: () => Promise<void>): Promise<void> {
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
