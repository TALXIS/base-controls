import { IDatasetControlParameters } from "../DatasetControl";
import { IDatasetControlEvents } from "../../utils/dataset-control";
import { EditColumns, IEditColumns } from "../../utils/dataset-control/EditColumns";
import { IDataset, ICommand, EventEmitter, IDataProvider, Operators, Filtering, IColumn } from "@talxis/client-libraries";
import { ITaskDataProvider, REQUIRED_COLUMNS } from "./data-providers/task-data-provider";
import { ILocalizationService, ITaskGridLabels } from "./labels";
import { ICreateUserQueryResult, ISavedQueryDataProvider, IUpdateUserQueryResult } from "./data-providers/saved-query-data-provider";
import { ITaskGridState } from "./TaskGridDatasetControlFactory";
import { Type } from "@talxis/client-libraries/dist/utils/fetch-xml/filter/Type";
import { ICustomColumnsDataProvider } from "./data-providers/custom-columns-data-provider/CustomColumnsDataProvider";
import { ITaskGridDatasetControl, ITaskGridDescriptor, ITaskGridParameters, IDatasetControlOptions } from "./interfaces";

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

    constructor(options: IDatasetControlOptions) {
        super();
        this._dataset = options.dataset;
        this._dataProvider = this._dataset.getDataProvider() as ITaskDataProvider;
        this._descriptor = options.taskGridDescriptor;
        this._controlId = this._descriptor.onGetControlId?.() ?? `task-grid-dataset-control-${crypto.randomUUID()}`;
        this._localizationService = options.localizationService;
        this._savedQueryDataProvider = options.savedQueryDataProvider;
        this._customColumnsDataProvider = options.customColumnsDataProvider;
        this._state = options.state;
        this._gridParameters = this._descriptor.onGetGridParameters?.() ?? {};
        this._templateDataProvider = this._createTemplateDataProvider();
        this._getPcfContext = options.onGetPcfContext;
        this._loadState(options.state);
        this.loadCommands([]);
        this._registerEventListeners();
    }

    public get editColumns(): IEditColumns {
        return new EditColumns({ datasetControl: this });
    }

    public getNativeColumns() {
        return this._descriptor.onGetNativeColumns();
    }

    public getLocalizationService() {
        return this._localizationService;
    }

    public getControlId() {
        return this._controlId;
    }

    public isRowDraggingEnabled(): boolean {
        return this._gridParameters.enableRowDragging ?? true;
    }

    public isEditColumnsScopeSelectorEnabled(): boolean {
        return this._gridParameters.enableEditColumnsScopeSelector ?? true;
    }

    public isTemplatingEnabled(): boolean {
        return !!this._templateDataProvider;
    }

    public isHideInactiveTasksToggleVisible(): boolean {
        return this._gridParameters.enableHideInactiveTasksToggle ?? true;
    }
    
    public isShowHierarchyToggleVisible(): boolean {
        return this._gridParameters.enableShowHierarchyToggle ?? true;
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
            throw new Error('This TaskGridDatasetControl does not have a custom columns data provider');
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
            condition.setValue([0]);
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
        return this._gridParameters.enableQuickFind ?? true;
    }
    public isAutoSaveEnabled(): boolean {
        return true;
    }
    public isRibbonVisible(): boolean {
        return true;
    }
    public getHeight(): string | null {
        return this._gridParameters.height  ?? null;
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
    public getParameters(): IDatasetControlParameters {
        return {
            Grid: this.getDataset(),
            EnableEditing: {
                raw: this._dataProvider.isTaskEditingEnabled()
            },
            EnableAutoSave: {
                raw: true
            },
            EnableEditColumns: {
                raw: this._gridParameters.enableEditColumns ?? true
            },
            EnableZebra: {
                raw: false
            },
            EnableOptionSetColors: {
                raw: true
            },
            Height: {
                raw: this.getHeight()
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
        return true;
    }
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
        if (state.savedQuery) {
            currentQuery = {
                ...currentQuery,
                ...state.savedQuery,
            }
        }
        else {
            state.savedQuery = currentQuery;
        }
        //some required columns might have been discared by edit columns
        this._savedQueryDataProvider.includeRequiredColumns(currentQuery.columns);
        this._savedQueryDataProvider.harmonizeColumns(currentQuery.columns);
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

    private _createTemplateDataProvider() {
        if (this._descriptor.onCreateTemplateDataProvider) {
            return this._descriptor.onCreateTemplateDataProvider();
        }
    }

    private _onSelectedRecordsChanged(ids: string[]) {
        this.loadCommands(ids);
    }

    private _onAfterUserQueryCreated(result: ICreateUserQueryResult) {
        this._dataProvider.setLoading(false);
        if (result.success) {
            this.changeSavedQuery(result.queryId);
        }
    }

    private _onAfterUserQueryUpdated(result: IUpdateUserQueryResult) {
        this._dataProvider.setLoading(false);
    }

    private _registerEventListeners() {
        this._dataProvider.addEventListener('onRecordsSelected', (ids) => this._onSelectedRecordsChanged(ids));
        this._savedQueryDataProvider.queryEvents.addEventListener('onAfterUserQueryCreated', (result) => this._onAfterUserQueryCreated(result));
        this._savedQueryDataProvider.queryEvents.addEventListener('onAfterUserQueryUpdated', (result) => this._onAfterUserQueryUpdated(result));
    }

}