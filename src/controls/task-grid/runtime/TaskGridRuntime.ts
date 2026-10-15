import { EventEmitter } from "@talxis/client-libraries";
import type { IGrid } from "@controls/grid";
import type { IRibbonCommand, IRibbonRuntime } from "@controls/ribbon";
import { IPcfContext } from "@interfaces";
import { HookRegistry, ILocalizationService } from "@utils";
import { ErrorHelper } from "@utils/error-handling";
import type { ICreateTaskOptions, ITaskDataProvider } from "../provider";
import type { ITaskGridServiceMap } from "../services";
import type { ITaskGridLabels } from "../labels";
import { ITaskGrid, ITaskGridEvents, ITaskGridSetting, TaskGridSettingsHook } from "./interfaces";

/** What the runtime reads of the tree module. */
export interface ITaskGridTree {
    isFlatList(): boolean;
    setFlatList(isFlatList: boolean): void;
}

export interface ITaskGridRuntimeParameters {
    provider: ITaskDataProvider;
    pcfContext: IPcfContext;
    labels: ILocalizationService<ITaskGridLabels>;
    /** Whether the New command and the add-task column are there. */
    onIsTaskCreationEnabled: () => boolean;
}

export class TaskGridRuntime implements ITaskGrid {
    private _provider: ITaskDataProvider;
    private _pcfContext: IPcfContext;
    private _labels: ILocalizationService<ITaskGridLabels>;
    private _onIsTaskCreationEnabled: () => boolean;
    private _grid?: IGrid<ITaskGridServiceMap>;
    private _tree?: ITaskGridTree;
    private _settingsHooks = new HookRegistry<TaskGridSettingsHook>();
    public readonly events = new EventEmitter<ITaskGridEvents>();

    constructor(parameters: ITaskGridRuntimeParameters) {
        this._provider = parameters.provider;
        this._pcfContext = parameters.pcfContext;
        this._labels = parameters.labels;
        this._onIsTaskCreationEnabled = parameters.onIsTaskCreationEnabled;
        this._settingsHooks.register(this._addCoreSettings);
    }

    public get grid(): IGrid<ITaskGridServiceMap> {
        if (!this._grid) {
            throw new Error('The task grid is reached before its modules registered.');
        }
        return this._grid;
    }

    /** Hands over the grid and its tree once the modules register. */
    public attach(grid: IGrid<ITaskGridServiceMap>, tree: ITaskGridTree): void {
        this._grid = grid;
        this._tree = tree;
    }

    public isFlatList(): boolean {
        return this._tree?.isFlatList() ?? false;
    }

    public setFlatList(isFlatList: boolean): void {
        this._tree?.setFlatList(isFlatList);
    }

    public getProvider(): ITaskDataProvider {
        return this._provider;
    }

    public getLabels(): ILocalizationService<ITaskGridLabels> {
        return this._labels;
    }

    public isTaskCreationEnabled(): boolean {
        return this._onIsTaskCreationEnabled();
    }

    public async createTask(parentId?: string, options?: ICreateTaskOptions): Promise<void> {
        await this._execute(() => this._provider.createTask(parentId, options));
    }

    public async deleteTasks(taskIds: string[]): Promise<void> {
        const confirmation = await this._pcfContext.navigation.openConfirmDialog({ text: this._labels.getLocalizedString('confirmDeleteTasks') });
        if (confirmation.confirmed) {
            await this._execute(() => this._provider.deleteTasks(taskIds));
        }
    }

    public async openTasks(taskIds: string[]): Promise<void> {
        await this._execute(() => this._provider.openTasks(taskIds));
    }

    /** Puts New, Edit and Delete on the control's ribbon. */
    public attachRibbon(ribbon: IRibbonRuntime): () => void {
        const unregister = ribbon.registerCommands(this._addCoreCommands);
        ribbon.reload();
        return unregister;
    }

    public registerSettings(hook: TaskGridSettingsHook, priority?: number): () => void {
        return this._settingsHooks.register(hook, priority);
    }

    public getSettings(): ITaskGridSetting[] {
        const settings: ITaskGridSetting[] = [];
        this._settingsHooks.apply(settings);
        return settings;
    }

    public destroy(): void {
        this.events.dispatchEvent('onDestroyed');
        this.events.clearEventListeners();
    }

    //ahead of the consumer's own commands
    private _addCoreCommands = (commands: IRibbonCommand[]): void => {
        const selectedIds = this._provider.getSelectedRecordIds();
        const coreCommands: IRibbonCommand[] = [];
        if (this.isTaskCreationEnabled()) {
            coreCommands.push({ id: 'new', label: this._labels.getLocalizedString('new'), iconName: 'Add', onExecute: () => this.createTask() });
        }
        if (selectedIds.length > 0) {
            coreCommands.push(
                { id: 'edit', label: this._labels.getLocalizedString('edit'), iconName: 'Edit', onExecute: () => this.openTasks(selectedIds) },
                { id: 'delete', label: this._labels.getLocalizedString('delete'), iconName: 'Delete', onExecute: () => this.deleteTasks(selectedIds) },
            );
        }
        commands.unshift(...coreCommands);
    };

    private _addCoreSettings = (settings: ITaskGridSetting[]): void => {
        settings.push({
            key: 'hideInactiveTasks',
            label: this._labels.getLocalizedString('hideInactiveTasks'),
            isChecked: this._provider.areInactiveTasksHidden(),
            onChange: isChecked => this._provider.setInactiveTasksHidden(isChecked),
        });
    };

    private async _execute(operation: () => Promise<unknown>): Promise<void> {
        try {
            await operation();
        }
        catch (error) {
            await this._pcfContext.navigation.openErrorDialog({ message: ErrorHelper.getMessageFromError(error), details: error instanceof Error ? error.stack : undefined });
        }
    }
}
