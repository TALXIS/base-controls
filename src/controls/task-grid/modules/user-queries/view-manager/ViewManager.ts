import { DataTypes, IRecordSaveOperationResult, MemoryDataProvider } from "@talxis/client-libraries";
import { ErrorHelper } from "@utils";
import { IRibbonCommand } from "@controls/ribbon";
import { ITaskGridServiceLocator } from "@controls/task-grid/services";
import { IDeletedUserQueriesResult } from "@controls/task-grid/providers/saved-query";
import { IUserQueryDataProvider } from "../../interfaces";

//the manager's grid runs on a synthetic entity projected from the views the grid already loaded
const ID_ATTRIBUTE = 'queryid';
const NAME_ATTRIBUTE = 'name';
const DESCRIPTION_ATTRIBUTE = 'description';

export interface IViewManagerParameters {
    services: ITaskGridServiceLocator;
}

/** Drives the *Manage views* dialog: a grid over the user's own views, with inline rename and delete. */
export class ViewManager {
    private _services: ITaskGridServiceLocator;
    private _provider: MemoryDataProvider;
    private _hasChanges = false;

    constructor(parameters: IViewManagerParameters) {
        this._services = parameters.services;
        this._provider = this._createProvider();
        this._userQueryProvider.events.addEventListener('onBeforeUserQueriesDeleted', this._onBeforeUserQueriesDeleted);
        this._userQueryProvider.events.addEventListener('onAfterUserQueriesDeleted', this._onAfterUserQueriesDeleted);
        this._provider.addEventListener('onAfterRecordSaved', this._onAfterRecordSaved);
    }

    private get _userQueryProvider(): IUserQueryDataProvider {
        return this._services.get('userQueriesModule').provider;
    }

    private get _labels() {
        return this._services.get('localizationService');
    }

    public getProvider(): MemoryDataProvider {
        return this._provider;
    }

    /** Whether a view was renamed or deleted, so the task grid's views are stale. */
    public hasChanges(): boolean {
        return this._hasChanges;
    }

    public getCommands(): IRibbonCommand[] {
        const selectedIds = this._provider.getSelectedRecordIds();
        if (selectedIds.length === 0) {
            return [];
        }
        return [{
            id: 'deleteView',
            label: this._labels.getLocalizedString('deleteSelected'),
            iconName: 'Delete',
            onExecute: () => this._deleteViews(selectedIds),
        }];
    }

    public destroy(): void {
        this._userQueryProvider.events.removeEventListener('onBeforeUserQueriesDeleted', this._onBeforeUserQueriesDeleted);
        this._userQueryProvider.events.removeEventListener('onAfterUserQueriesDeleted', this._onAfterUserQueriesDeleted);
    }

    //edits are persisted through the user-query provider, so nothing here knows about the backend
    private _createProvider(): MemoryDataProvider {
        const provider = new MemoryDataProvider({
            dataSource: this._userQueryProvider.getQueries().map(query => ({
                [ID_ATTRIBUTE]: query.id,
                [NAME_ATTRIBUTE]: query.name,
                [DESCRIPTION_ATTRIBUTE]: query.description ?? null,
            })),
            metadata: {
                PrimaryIdAttribute: ID_ATTRIBUTE,
                PrimaryNameAttribute: NAME_ATTRIBUTE,
                LogicalName: 'taskgrid_userquery',
                QuickFindColumns: [NAME_ATTRIBUTE],
            },
        });
        provider.setColumns([
            { name: ID_ATTRIBUTE, dataType: 'SingleLine.Text', isHidden: true },
            { name: NAME_ATTRIBUTE, dataType: 'SingleLine.Text', displayName: this._labels.getLocalizedString('name'), visualSizeFactor: 200 },
            { name: DESCRIPTION_ATTRIBUTE, dataType: DataTypes.Multiple, displayName: this._labels.getLocalizedString('description'), visualSizeFactor: 300 },
        ]);
        return provider;
    }

    private async _deleteViews(queryIds: string[]): Promise<void> {
        const result = await this._services.get('pcfContext').navigation.openConfirmDialog({
            text: this._labels.getLocalizedString('confirmDialog.deleteSelectedRows.text'),
        });
        if (result.confirmed) {
            await this._userQueryProvider.delete(queryIds);
        }
    }

    private _onAfterRecordSaved = async (result: IRecordSaveOperationResult): Promise<void> => {
        const record = this._provider.getRecordsMap()[result.recordId];
        if (!result.success || !record) {
            return;
        }
        this._hasChanges = true;
        //the stored query carries the columns, filters and sorting - only the details are edited here
        await this._userQueryProvider.update({
            ...this._services.get('savedQueryDataProvider').getSavedQuery(result.recordId),
            name: record.getValue(NAME_ATTRIBUTE) as string,
            description: record.getValue(DESCRIPTION_ATTRIBUTE) as string ?? undefined,
        });
    };

    private _onBeforeUserQueriesDeleted = (): void => {
        this._hasChanges = true;
        this._provider.setLoading(true);
    };

    private _onAfterUserQueriesDeleted = (result: IDeletedUserQueriesResult): void => {
        this._provider.setLoading(false);
        if (result.success) {
            //the projection is local: drop the rows from it, then refresh so the grid re-renders
            this._provider.deleteRecords(result.deletedQueryIds);
            this._provider.refresh();
            return;
        }
        this._services.get('pcfContext').navigation.openConfirmDialog({
            subtitle: this._labels.getLocalizedString('deletingUserQueriesError'),
            text: result.errors.map(error => `${this._provider.getRecordsMap()[error.queryId].getNamedReference().name}: ${ErrorHelper.getMessageFromError(error.error)}`).join('\n'),
        });
    };
}
