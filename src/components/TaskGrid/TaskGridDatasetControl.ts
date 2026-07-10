import { IDatasetControlParameters } from "../DatasetControl";
import { IDatasetControlEvents } from "../../utils/dataset-control";
import { EditColumns, IEditColumns } from "../../utils/dataset-control/EditColumns";
import { IDataset, ICommand, EventEmitter, IDataProvider, Operators, Filtering } from "@talxis/client-libraries";
import { IDeleteTasksResult, ITaskDataProvider } from "./providers/task";
import { ILocalizationService } from "../../utils";
import { ITaskGridLabels } from "./labels";
import { ISavedQueryDataProvider, PATH_COLUMN_NAME } from "./providers/saved-query";
import { ITaskGridState } from "./TaskGridDatasetControlFactory";
import { Type } from "@talxis/client-libraries/dist/utils/fetch-xml/filter/Type";
import { ICustomColumnsDataProvider } from "./providers/custom-columns/CustomColumnsDataProvider";
import { ITaskGridDatasetControl, ITaskGridDescriptor, ITaskGridParameters, ITaskGridDatasetControlParameters } from "./interfaces";
import { ErrorHelper } from "../../utils/error-handling";

const STATE_CODE_ACTIVE = 0;

export class TaskGridDatasetControl extends EventEmitter<IDatasetControlEvents> implements ITaskGridDatasetControl {
    private _dataset: IDataset;
    private _descriptor: ITaskGridDescriptor;
    private _dataProvider: ITaskDataProvider;
    private _templateDataProvider?: IDataProvider;
    private _localizationService: ILocalizationService<ITaskGridLabels>;
    private _savedQueryDataProvider: ISavedQueryDataProvider;
    private _customColumnsDataProvider?: ICustomColumnsDataProvider;
    private _controlId: string;
    private _state: ITaskGridState;
    private _gridParameters: ITaskGridParameters;
    private _commands: ICommand[] = [];
    private _getPcfContext: () => ComponentFramework.Context<any, any>;
    private _changeToQueryId!: string;

    constructor(parameters: ITaskGridDatasetControlParameters) {
        super();
        this._dataset = parameters.dataset;
        this._dataProvider = this._dataset.getDataProvider() as ITaskDataProvider;
        this._descriptor = parameters.taskGridDescriptor;
        this._controlId = this._descriptor.onGetControlId?.() ?? `task-grid-dataset-control-${crypto.randomUUID()}`;
        this._localizationService = parameters.localizationService;
        this._savedQueryDataProvider = parameters.savedQueryDataProvider;
        this._customColumnsDataProvider = parameters.customColumnsDataProvider;
        this._templateDataProvider = parameters.templateDataProvider;
        this._state = parameters.state;
        this._gridParameters = this._descriptor.onGetGridParameters?.() ?? {};
        this._getPcfContext = parameters.onGetPcfContext;
        this._loadState(parameters.state);
        this.loadCommands([]);
        this._registerEventListeners();
    }

    public get editColumns(): IEditColumns {
        return new EditColumns({ datasetControl: this });
    }

    public getNativeColumns() {
        return {
            ...this._descriptor.onGetFieldMapping(),
            path: PATH_COLUMN_NAME
        }
    }

    public getLocalizationService() {
        return this._localizationService;
    }

    public getControlId() {
        return this._controlId;
    }

    public isRowDraggingEnabled(): boolean {
        return this._gridParameters.enableRowDragging ?? false;
    }

    public isEditColumnsScopeSelectorEnabled(): boolean {
        return this._gridParameters.enableEditColumnsScopeSelector ?? false;
    }

    public isTemplatingEnabled(): boolean {
        return !!this._templateDataProvider;
    }

    public isCustomColumnsEnabled(): boolean {
        return !!this._customColumnsDataProvider;
    }

    public isHideInactiveTasksToggleVisible(): boolean {
        return this._gridParameters.enableHideInactiveTasksToggle ?? false;
    }

    public isCustomColumnCreationEnabled(): boolean {
        return this._gridParameters.enableCustomColumnCreation ?? false;
    }
    
    public isCustomColumnEditingEnabled(): boolean {
        return this._gridParameters.enableCustomColumnEditing ?? false;
    }
    public isCustomColumnDeletionEnabled(): boolean {
        return this._gridParameters.enableCustomColumnDeletion ?? false;
    }

    public isInlineCreateEnabled(): boolean {
        return this._gridParameters.enableInlineCreation ?? false;
    }

    public isShowHierarchyToggleVisible(): boolean {
        return this._gridParameters.enableShowHierarchyToggle ?? false;
    }

    public getInactiveTasksVisibility() {
        const stateCodeCondition = this._dataProvider.getFiltering()?.conditions?.find(condition => condition.attributeName === this.getNativeColumns().stateCode);
        switch (stateCodeCondition?.conditionOperator) {
            case Operators.In.Value:
                return stateCodeCondition.value?.includes('1') ?? false;
            case Operators.Equal.Value:
                return stateCodeCondition.value === '1';
            default: {
                return true;
            }
        }
    }
    
    public isViewManagerEnabled(): boolean {
        return this._gridParameters.enableQueryManager ?? false;
    }

    public isSaveQueryAsNewEnabled(): boolean {
        return this._gridParameters.enableSaveAsNewQuery ?? false;
    }

    public isSaveQueryChangesEnabled(): boolean {
        return this._gridParameters.enableSaveQueryChanges ?? false;
    }

    public isUserQueriesFeatureEnabled(): boolean {
        return this._gridParameters.enableUserQueries ?? false;
    }

    public getSavedQueryDataProvider() {
        return this._savedQueryDataProvider;
    }

    public getTemplateDataProvider(): IDataProvider {
        if (!this._templateDataProvider) {
            throw new Error('This TaskGridDatasetControl does not have a template data provider');
        }
        return this._templateDataProvider;
    }


    public createUserQueryDataProvider(): IDataProvider {
        return this._descriptor.onCreateUserQueryDataProvider();
    }

    public getCustomColumnsDataProvider() {
        if (!this._customColumnsDataProvider) {
            throw new Error('This TaskGridDatasetControl does not have a custom columns data provider!');
        }
        return this._customColumnsDataProvider;
    }

    public toggleFlatList(enabled: boolean) {
        if (!this._state.savedQuery) {
            throw new Error('Cannot toggle flat list mode when there is no saved query in state');
        }
        this._state.savedQuery.isFlatListEnabled = enabled;
        const pathColumn = this._dataProvider.getColumnsMap()[this.getNativeColumns().path];
        pathColumn.isHidden = !enabled;
        pathColumn.order = -1;
        //update the columns to trigger column sort
        this._dataProvider.setColumns(this._dataProvider.getColumns());
        this._dataProvider.refresh();
    }

    public toggleHideInactiveTasks(hide: boolean) {
        const filtering = new Filtering(this._dataProvider);
        const stateCodeFilter = filtering.getColumnFilter(this.getNativeColumns().stateCode);
        stateCodeFilter.clear();

        if (hide) {
            const condition = stateCodeFilter.addCondition();
            condition.setOperator(Operators.Equal.Value);
            condition.setValue(STATE_CODE_ACTIVE);
        }
        const filterExpression = filtering.getFilterExpression(Type.And.Value);
        if (filterExpression) {
            this._dataProvider.setFiltering(filterExpression);
        }
        this._dataProvider.refresh();
    }

    //we need to make sure that query gets saved into state
    public changeSavedQuery(queryId: string) {
        this._changeToQueryId = queryId;
        this.requestRemount();
    }

    public setInterceptor(event: any, interceptor: any): void {
        throw new Error("Method not implemented.");
    }

    public isPaginationVisible(): boolean {
        return false;
    }
    public isRecordCountVisible(): boolean {
        return true
    }
    public isPageSizeSwitcherVisible(): boolean {
        return false;
    }
    public isQuickFindVisible(): boolean {
        return this._gridParameters.enableQuickFind ?? false;
    }
    public isAutoSaveEnabled(): boolean {
        return true;
    }
    public isRibbonVisible(): boolean {
        return true;
    }
    public getHeight(): string | null {
        return this._descriptor.onGetHeight?.() ?? null;
    }
    public getDataset(): IDataset {
        return this._dataset;
    }
    public getDataProvider(): ITaskDataProvider {
        return this._dataProvider;
    }
    public getPcfContext(): ComponentFramework.Context<any> {
        return this._getPcfContext();
    }
    public isTaskEditingEnabled(): boolean {
        return this._gridParameters.enableTaskEditing ?? false;
    }
    public isTaskCreatingEnabled(): boolean {
        return this._gridParameters.enableTaskCreation ?? false;
    }
    public isTaskDeletingEnabled(): boolean {
        return this._gridParameters.enableTaskDeletion ?? false;
    }
    public isNavigationEnabled(): boolean {
        return this._gridParameters.enableNavigation ?? false;
    }

    public getParameters(): IDatasetControlParameters {
        return {
            Grid: this.getDataset(),
            EnableEditing: {
                raw: this.isTaskEditingEnabled()
            },
            EnableAutoSave: {
                raw: true
            },
            EnableEditColumns: {
                raw: this.isEditColumnsVisible()
            },
            EnableZebra: {
                raw: false
            },
            EnableOptionSetColors: {
                raw: true
            },
            EnableNavigation: {
                raw: this.isNavigationEnabled()
            },
            Height: {
                raw: this.getHeight()
            },
            EnableSorting: {
                raw: this._gridParameters.enableSorting ?? false
            },
            EnableFiltering: {
                raw: this._gridParameters.enableFiltering ?? false
            },
            RowHeight: {
                raw: this._gridParameters.rowHeight ?? null
            }
            
        }
    }
    public async loadCommands(ids: string[]): Promise<void> {
        this._commands = await this._dataProvider.retrieveRecordCommand({
            recordIds: ids,
            refreshAllRules: true
        });
        this.dispatchEvent('onRecordCommandsLoaded');
    }
    public retrieveRecordCommands(): ICommand[] {
        return this._commands;
    }
    public areCommandsLoaded(): boolean {
        return true;
    }
    public isEditColumnsVisible(): boolean {
        return this._gridParameters.enableEditColumns ?? false;
    }
    //required like this since task grid is using its own view switcher
    public isViewSwitcherEnabled(): boolean {
        return this._gridParameters.enableViewSwitcher ?? false;
    }
    //hide the native one
    public isViewSwitcherVisible(): boolean {
        return false;
    }
    public isEditFiltersVisible(): boolean {
        return false;
    }
    public requestEditColumns(): void {
        throw new Error("Method not implemented.");
    }
    public destroy(): void {
        this.saveState();
        this._dataProvider.destroy();
        this._savedQueryDataProvider.destroy();
        this._customColumnsDataProvider?.destroy();
        this._templateDataProvider?.destroy();
    }
    public requestRemount(): void {
        this.dispatchEvent('onRemountRequested');
    }
    public async init(): Promise<void> {
        return;
    }
    public getState(): ComponentFramework.Dictionary {
        return this._state;
    }
    public saveState(): void {
        if (this._changeToQueryId) {
            this._state.savedQuery = {
                id: this._changeToQueryId
            }
            //@ts-ignore
            if(this._state.AgGridState) {
                //clean up AgGrid state as it might not be compatible with new query
                //@ts-ignore
                delete this._state.AgGridState;
            }
        }
        else {
            const currentQueryId = this._savedQueryDataProvider.getCurrentQuery().id;
            this._state.savedQuery = {
                ...this._savedQueryDataProvider.getSavedQuery(currentQueryId),
                filtering: this._dataProvider.getFiltering() ?? undefined,
                sorting: this._dataProvider.getSorting(),
                columns: this._dataProvider.getColumns(),
                searchQuery: this._dataProvider.getSearchQuery() ?? undefined,
                linking: this._dataProvider.getLinking(),
                isFlatListEnabled: this._dataProvider.isFlatListEnabled(),
            }
        }
    }

    private _loadState(state: ITaskGridState) {
        let currentQuery = this._savedQueryDataProvider.getCurrentQuery();
        if (!state.savedQuery) {
            state.savedQuery = currentQuery;
        }
        //at this point current query might be missing required properties
        let { filtering, sorting, columns, searchQuery, linking } = currentQuery;
        this._dataProvider.setColumns(columns);

        if (filtering) {
            this._dataProvider.setFiltering(filtering);
        }
        if (sorting) {
            this._dataProvider.setSorting(sorting);
        }
        if (linking) {
            this._dataProvider.setLinking(linking);
        }
        if (searchQuery) {
            this._dataProvider.setSearchQuery(searchQuery);
        }
    }

    private _onSelectedRecordsChanged(ids: string[]) {
        this.loadCommands(ids);
    }

    private _onAfterUserQueryCreated(result: string | null) {
        this._dataProvider.setLoading(false);
        if (result) {
            this.changeSavedQuery(result);
        }
    }

    private _registerEventListeners() {
        this._dataProvider.taskEvents.addEventListener('onError', (error, message) => this._onError(error, message));
        this._customColumnsDataProvider?.events.addEventListener('onError', (error, message) => this._onError(error, message));
        this._savedQueryDataProvider.queryEvents.addEventListener('onError', (error, message) => this._onError(error, message));
        this._dataProvider.addEventListener('onRecordsSelected', (ids) => this._onSelectedRecordsChanged(ids));
        this._dataProvider.taskEvents.addEventListener('onBeforeTasksDeleted', () => this._dataProvider.setLoading(true));
        this._dataProvider.taskEvents.addEventListener('onAfterTasksDeleted', (result) => this._onAfterTasksDeleted(result));
        this._dataProvider.taskEvents.addEventListener('onBeforeTaskMoved', () => this._dataProvider.setLoading(true));
        this._dataProvider.taskEvents.addEventListener('onBeforeTemplateCreated', () => this._dataProvider.setLoading(true));
        this._dataProvider.taskEvents.addEventListener('onAfterTemplateCreated', () => this._dataProvider.setLoading(false));
        this._dataProvider.taskEvents.addEventListener('onBeforeTasksCreated', () => this._dataProvider.setLoading(true));
        this._dataProvider.taskEvents.addEventListener('onAfterTasksCreated', () => this._dataProvider.setLoading(false));
        this._dataProvider.taskEvents.addEventListener('onAfterTaskMoved', () => this._dataProvider.setLoading(false));
        this._dataProvider.taskEvents.addEventListener('onBeforeDatasetItemsOpened', () => this._dataProvider.setLoading(true));
        this._dataProvider.taskEvents.addEventListener('onAfterDatasetItemsOpened', () => this._dataProvider.setLoading(false));
        this._savedQueryDataProvider.queryEvents.addEventListener('onAfterUserQueryCreated', (result) => this._onAfterUserQueryCreated(result));
        this._savedQueryDataProvider.queryEvents.addEventListener('onAfterUserQueryUpdated', (result) => this._dataProvider.setLoading(false));
    }

    private _onError = (error: any, message: string) => {
        this._dataProvider.setLoading(false);
        this.getPcfContext().navigation.openErrorDialog({
            message: message,
            details: error
        })
    }

    private _onAfterTasksDeleted = (result: IDeleteTasksResult | null) => {
        this._dataProvider.setLoading(false);
        if (!result) return;
        if (!result.success) {
            this.getPcfContext().navigation.openConfirmDialog({
                subtitle: this._localizationService.getLocalizedString('deletingTasksError'),
                text: result.errors.map(e => {
                    return `${this._dataProvider.getRecordsMap()[e.id].getNamedReference().name}: ${ErrorHelper.getMessageFromError(e.error)}`
                }).join('\n'),
            })
        }
    }

}