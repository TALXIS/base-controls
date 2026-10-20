import { ContextualMenuItemType, IContextualMenuItem } from "@fluentui/react";
import { EventEmitter, IDataProvider, IRecord, IRecordSaveOperationResult } from "@talxis/client-libraries";
import type { IDatasetControlRuntime } from "../../runtime/DatasetControlRuntime";
import type { IDatasetControlView } from "../../runtime/interfaces";
import type { IEventSubscriber, ILocalizationService } from "@utils";
import type { IUserQueriesLabels } from "./labels";
import type { IUserQueryWriteParameters } from "./interfaces";

/** The id of the group the user's views are listed under. */
export const USER_QUERIES_GROUP = 'userQueries';

export interface IDatasetControlUserQueriesParameters {
    datasetControl: IDatasetControlRuntime;
    provider: IDataProvider;
    labels: ILocalizationService<IUserQueriesLabels>;
    onReadViewData: (record: IRecord) => unknown;
    onWriteViewData?: (parameters: IUserQueryWriteParameters) => Promise<void> | void;
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
    private _provider: IDataProvider;
    private _labels: ILocalizationService<IUserQueriesLabels>;
    private _onReadViewData: (record: IRecord) => unknown;
    private _onWriteViewData?: (parameters: IUserQueryWriteParameters) => Promise<void> | void;

    constructor(parameters: IDatasetControlUserQueriesParameters) {
        this._datasetControl = parameters.datasetControl;
        this._provider = parameters.provider;
        this._labels = parameters.labels;
        this._onReadViewData = parameters.onReadViewData;
        this._onWriteViewData = parameters.onWriteViewData;
        this._datasetControl.registerViews(this._addViews);
        this._datasetControl.parts.whenAvailable('viewSwitcher', viewSwitcher => viewSwitcher.registerItems(this._addViewSwitcherItems));
    }

    public get events(): IEventSubscriber<IDatasetControlUserQueriesEvents> {
        return this._events;
    }

    public getLabels(): ILocalizationService<IUserQueriesLabels> {
        return this._labels;
    }

    /** The user's views, one record per view. */
    public getProvider(): IDataProvider {
        return this._provider;
    }

    /** Loads the user's views. */
    public async load(): Promise<void> {
        await this._provider.refresh();
    }

    /** The user view's record; `undefined` when the view is not a user view. */
    public getRecord(viewId: string | undefined): IRecord | undefined {
        return viewId ? this._provider.getRecordsMap()[viewId] : undefined;
    }

    /** Saves a new view under the name, and opens it. */
    public async create(name: string): Promise<void> {
        await this._execute(async () => {
            const record = this._provider.newRecord();
            record.setValue(this._provider.getMetadata().PrimaryNameAttribute, name);
            await this._save(record);
            await this._datasetControl.loadView(record.getRecordId());
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
        const record = this.getRecord(this._datasetControl.getViewId());
        if (record) {
            await this._execute(() => this._save(record));
        }
    }

    /** Saves the changes made to the views in Manage views. */
    public async saveViews(): Promise<void> {
        await this._execute(async () => this._throwIfSaveFailed(await this._provider.save()));
    }

    /** Deletes the views, then lists the ones left. */
    public async deleteViews(viewIds: string[]): Promise<void> {
        await this._execute(async () => {
            const { results } = await this._provider.deleteRecords(viewIds);
            await this._provider.refresh();
            const failed = results.filter(result => !result.success);
            if (failed.length > 0) {
                throw new Error(failed.map(result => result.errorMessage ?? this._labels.getLocalizedString('deleteFailed')).join('\n'));
            }
        });
    }

    //listed after the control's own, in their own group
    private _addViews = (views: IDatasetControlView[]): void => {
        const group = { id: USER_QUERIES_GROUP, name: this._labels.getLocalizedString('myViewsHeader') };
        views.push(...this._provider.getRecords().map(record => ({ id: record.getRecordId(), name: record.getNamedReference().name ?? '', group, data: this._onReadViewData(record) })));
    };

    //the switcher reads its items as its menu opens
    private _addViewSwitcherItems = (items: IContextualMenuItem[]): void => {
        items.push({ key: 'userQueriesDivider', itemType: ContextualMenuItemType.Divider });
        if (this.getRecord(this._datasetControl.getViewId())) {
            items.push({ key: 'saveChanges', text: this._labels.getLocalizedString('saveChanges'), iconProps: { iconName: 'Save' }, onClick: () => { this.save(); } });
        }
        items.push(
            { key: 'saveAsNewView', text: this._labels.getLocalizedString('saveAsNewView'), iconProps: { iconName: 'SaveAs' }, onClick: () => { this.saveAsNew(); } },
            { key: 'manageViews', text: this._labels.getLocalizedString('manageViews'), iconProps: { iconName: 'Settings' }, onClick: () => this._events.dispatchEvent('onManageRequested') },
        );
    };

    private async _save(record: IRecord): Promise<void> {
        await this._onWriteViewData?.({ record, datasetControl: this._datasetControl });
        this._throwIfSaveFailed([await record.save()]);
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
    interface IDatasetControlServiceMap {
        /** The user's own views, when the user queries module is there. */
        userQueries: DatasetControlUserQueries;
    }
}
