import { DataTypes, EventEmitter, IColumn } from "@talxis/client-libraries";
import type { IDatasetControlLoadParameters, IDatasetControlLoadResult, IDatasetControlRuntime } from "@controls/dataset-control/runtime/DatasetControlRuntime";
import type { IDatasetControl } from "@controls/dataset-control/runtime/interfaces";
import type { IPcfContext } from "@interfaces";
import type { IGrid, IGridModule } from "@controls/grid";
import type { ITaskGridServiceMap } from "../services";
import { TaskTree } from "../tree/TaskTree";
import { HookRegistry, ILocalizationService, ServiceLocator } from "@utils";
import type { IFieldMapping, ITaskDataProvider, ITaskView, ITaskViewData } from "../provider";
import { PATH_COLUMN_NAME } from "../provider/record-tree";
import type { ITaskGridLabels } from "../labels";
import type { ITaskDatasetControlProps } from "../dataset-control/TaskDatasetControl";
import type { ITaskDatasetControlRuntime, ITaskDatasetControlRuntimeEvents, ITaskDatasetControlRuntimeServiceMap, ITaskGridSetting, TaskGridSettingsHook } from "./interfaces";

export interface ITaskDatasetControlRuntimeParameters {
    datasetControl: IDatasetControlRuntime;
    labels: ILocalizationService<ITaskGridLabels>;
    pcfContext: IPcfContext;
    /** The `TaskDatasetControl`'s current props. */
    onGetProps: () => ITaskDatasetControlProps;
}

export class TaskDatasetControlRuntime implements ITaskDatasetControlRuntime {
    public readonly services = new ServiceLocator<ITaskDatasetControlRuntimeServiceMap>();
    public readonly events = new EventEmitter<ITaskDatasetControlRuntimeEvents>();
    private _onGetProps: () => ITaskDatasetControlProps;
    private _settingsHooks = new HookRegistry<TaskGridSettingsHook>();
    private _view?: ITaskView;
    private _gridModules: IGridModule<ITaskGridServiceMap>[] = [];

    constructor(parameters: ITaskDatasetControlRuntimeParameters) {
        const datasetControl = parameters.datasetControl;
        this._onGetProps = parameters.onGetProps;
        this.services.register('datasetControl', () => datasetControl as IDatasetControl<ITaskViewData>);
        this.services.register('labels', () => parameters.labels);
        this.services.register('pcfContext', () => parameters.pcfContext);
        this._settingsHooks.register(this._addCoreSettings);
        //ahead of the modules, which attach to the grid after the tree
        datasetControl.parts.whenAvailable('grid', grid => new TaskTree({ grid: grid as IGrid<ITaskGridServiceMap>, runtime: this, state: datasetControl.getViewStateStore() }));
    }

    public async load(parameters: IDatasetControlLoadParameters<ITaskViewData>): Promise<IDatasetControlLoadResult> {
        const { provider, fieldMapping, rootTaskId } = await this._onGetProps().onLoad({ ...parameters, taskDatasetControl: this });
        provider.initialize({ fieldMapping, rootTaskId });
        provider.registerAvailableColumns(this._addPathColumn);
        //after the Path column is available, which a user view may keep
        if (parameters.view) {
            const definition = await parameters.view.resolve(provider);
            this._view = { ...parameters.view, ...definition };
            this._applyView(provider, definition.data ?? {});
        }
        this.services.register('provider', () => provider);
        return { provider };
    }

    public getView(): ITaskView | undefined {
        return this._view;
    }

    public getCurrentViewData(): ITaskViewData {
        const provider = this.getProvider();
        return {
            sorting: provider.getSorting(),
            filtering: provider.getFiltering(),
            quickFindColumns: provider.getQuickFindColumns().map(column => column.name),
            searchQuery: provider.getSearchQuery() || undefined,
            isFlatList: this.isFlatList(),
        };
    }

    public getFieldMapping(): IFieldMapping {
        return this.getProvider().getFieldMapping();
    }

    public getProvider(): ITaskDataProvider {
        return this.services.get('provider');
    }

    public getLabels(): ILocalizationService<ITaskGridLabels> {
        return this.services.get('labels');
    }

    public isFlatList(): boolean {
        return this.services.find('taskTree')?.isFlatList() ?? false;
    }

    public setFlatList(isFlatList: boolean): void {
        this.services.find('taskTree')?.setFlatList(isFlatList);
    }

    public async openTasks(taskIds: string[]): Promise<void> {
        await this.execute(() => this.getProvider().openTasks(taskIds));
    }

    public registerGridModule(module: IGridModule<ITaskGridServiceMap>): void {
        this._gridModules.push(module);
    }

    public getGridModules(): IGridModule<ITaskGridServiceMap>[] {
        return this._gridModules;
    }

    public registerSettings(hook: TaskGridSettingsHook, priority?: number): () => void {
        return this._settingsHooks.register(hook, priority);
    }

    public getSettings(): ITaskGridSetting[] {
        const settings: ITaskGridSetting[] = [];
        this._settingsHooks.apply(settings);
        return settings;
    }

    /** Called as the mount goes. */
    public destroy(): void {
        this.events.dispatchEvent('onDestroyed');
        this.events.clearEventListeners();
        this.services.destroy();
    }

    private _applyView(provider: ITaskDataProvider, view: ITaskViewData): void {
        provider.setSorting(view.sorting ?? []);
        provider.setFiltering(view.filtering ?? null);
        provider.setQuickFindColumns(view.quickFindColumns ?? []);
        provider.setSearchQuery(view.searchQuery);
    }

    private _addPathColumn = (columns: IColumn[]): void => {
        if (!columns.some(column => column.name === PATH_COLUMN_NAME)) {
            columns.push({ name: PATH_COLUMN_NAME, displayName: this.getLabels().getLocalizedString('path'), dataType: DataTypes.Multiple, isVirtual: true, visualSizeFactor: 300 });
        }
    };

    private _addCoreSettings = (settings: ITaskGridSetting[]): void => {
        const provider = this.getProvider();
        settings.push({
            key: 'hideInactiveTasks',
            label: this.getLabels().getLocalizedString('hideInactiveTasks'),
            isChecked: provider.areInactiveTasksHidden(),
            onChange: isChecked => provider.setInactiveTasksHidden(isChecked),
        });
    };

    //the provider's notification already shows the failure
    public async execute(operation: () => Promise<unknown>): Promise<void> {
        try {
            await operation();
        }
        catch { }
    }
}
