import { createElement } from "react";
import type { IDataProvider, IRecord } from "@talxis/client-libraries";
import type { IRibbonCommand } from "@controls/ribbon";
import type { GridCellCommandsHook, IGrid } from "@controls/grid";
import type { LabelsOf } from "@utils";
import type { ICreateTaskTree, ITaskCreateParams, ITasksCreateResult } from "../../provider";
import type { ITaskRuntime, TaskRibbonCommandUiHook } from "../../runtime";
import type { ITaskGridServiceMap } from "../../services";
import { TASK_GRID_PRIORITY } from "../../priorities";
import { TASK_COMMANDS_COLUMN_KEY } from "../../tree/constants";
import { TEMPLATES_LABELS } from "./labels";
import { TemplateSelectorAdapter } from "./components/adapters/template-selector";
import { runQuietly } from "../../runtime/runQuietly";

/** A template: its own task, named after it, with the tasks under it. */
export interface ITemplate {
    name: string;
    tree: ICreateTaskTree;
}

/** Where a template's tasks go: the template, and where its own task lands. */
export interface ITemplateTasksCreateParams extends Omit<ITaskCreateParams, 'data'> {
    templateId: string;
}

/** Where templates are kept, and what creates tasks from them. */
export interface ITemplatesStore {
    /** A provider over the templates, searched by the selector; made each time it opens. */
    onCreateTemplatesProvider(): IDataProvider;
    /** @returns The tasks created, or `null` when there were none or the user cancelled. */
    onCreateTasks(params: ITemplateTasksCreateParams): Promise<ITasksCreateResult | null>;
    /** Without it, tasks cannot be saved as templates. */
    onCreateTemplate?(template: ITemplate): Promise<void>;
}

export interface ITemplatesParameters {
    onCreateStore: (taskRuntime: ITaskRuntime) => ITemplatesStore;
}

/** The `templates` module: tasks created from templates, and templates captured from tasks. */
export interface ITemplates {
    createTemplatesProvider(): IDataProvider;
    /** Under `parentId`, or at the top level without it; rejects when the store fails. */
    createTasksFromTemplate(templateId: string, parentId?: string): Promise<IRecord[] | null>;
    /** Rejects when the store fails or keeps no templates of its own. */
    createTemplateFromTask(task: IRecord): Promise<void>;
    /** Called as the mount goes. */
    destroy(): void;
}

//after the task runtime's own commands
const RIBBON_PRIORITY = 10;
const FROM_TEMPLATE_COMMAND_ID = 'newFromTemplate';

/** Templates offered from the ribbon's New and from each row's add command. */
export class Templates implements ITemplates {
    private _taskRuntime: ITaskRuntime;
    private _store: ITemplatesStore;
    private _labels: LabelsOf<typeof TEMPLATES_LABELS>;
    private _unregisters: (() => void)[] = [];

    constructor(taskRuntime: ITaskRuntime, parameters: ITemplatesParameters) {
        this._taskRuntime = taskRuntime;
        this._store = parameters.onCreateStore(taskRuntime);
        this._labels = taskRuntime.getLabels(TEMPLATES_LABELS);
        taskRuntime.services.get('datasetControl').parts.whenAvailable('ribbon', ribbon => this._unregisters.push(ribbon.registerCommands(this._addCommands, RIBBON_PRIORITY)));
        this._unregisters.push(taskRuntime.registerRibbonCommandUi(this._onRibbonCommandUi));
        taskRuntime.services.get('datasetControl').parts.whenAvailable('grid', grid => this._onGridAvailable(grid as IGrid<ITaskGridServiceMap>));
    }

    public createTemplatesProvider(): IDataProvider {
        return this._store.onCreateTemplatesProvider();
    }

    public async createTasksFromTemplate(templateId: string, parentId?: string): Promise<IRecord[] | null> {
        if (!this._taskRuntime.isCreationEnabled()) {
            return null;
        }
        return this._execute('templates.creatingTasksFromTemplate', () => this._taskRuntime.getProvider().createTasksWith(parentId, params => this._store.onCreateTasks({ ...params, templateId })));
    }

    public async createTemplateFromTask(task: IRecord): Promise<void> {
        if (!this._store.onCreateTemplate) {
            throw new Error('The templates store keeps no templates of its own.');
        }
        await this._execute('templates.savingTemplate', async () => {
            const subject = this._taskRuntime.getProvider().getFieldMapping().subject;
            const { data, children } = this._toTemplateTree(task);
            const { [subject]: name, ...rootData } = data ?? {};
            await this._store.onCreateTemplate?.({ name: (name as string | null) ?? '', tree: { data: rootData, children } });
        });
    }

    public destroy(): void {
        this._unregisters.forEach(unregister => unregister());
    }

    private _onGridAvailable(grid: IGrid<ITaskGridServiceMap>): void {
        //after the tree's own add command
        this._unregisters.push(grid.services.get('cells').registerCellCommands(this._onCellCommands, TASK_GRID_PRIORITY.tree + 30));
    }

    private _addCommands = (commands: IRibbonCommand[]): void => {
        const provider = this._taskRuntime.getProvider();
        const selectedIds = provider.getSelectedRecordIds();
        const newIndex = commands.findIndex(command => command.id === 'new');
        const newCommand = commands[newIndex];
        if (newCommand?.onExecute) {
            commands[newIndex] = {
                id: newCommand.id,
                label: newCommand.label,
                iconName: newCommand.iconName,
                commands: [
                    { ...newCommand, id: 'newTask', label: this._labels.get('templates.task') },
                    //its selector comes through the ribbon command UI hook
                    { id: FROM_TEMPLATE_COMMAND_ID, label: this._labels.get('templates.fromTemplate'), iconName: 'PageList', commands: [] },
                ],
            };
        }
        const task = selectedIds.length === 1 ? provider.getRecordsMap()[selectedIds[0]] : undefined;
        if (task && this._store.onCreateTemplate) {
            commands.splice(newIndex + 1, 0, { id: 'saveAsTemplate', label: this._labels.get('templates.saveAsTemplate'), iconName: 'PageAdd', onExecute: () => runQuietly(() => this.createTemplateFromTask(task)) });
        }
    };

    private _onRibbonCommandUi: TaskRibbonCommandUiHook = item => {
        if (item.key !== FROM_TEMPLATE_COMMAND_ID) {
            return;
        }
        item.subMenuProps = {
            items: [{
                key: 'selector',
                onRender: (_, dismissMenu) => this._renderSelector(() => dismissMenu(undefined, true)),
            }],
        };
    };

    private _onCellCommands: GridCellCommandsHook = (result, { record, columnName }) => {
        if (columnName !== TASK_COMMANDS_COLUMN_KEY || !result.items.some(item => item.key === 'addChild')) {
            return;
        }
        const recordId = record.getRecordId();
        result.items.push({
            key: 'fromTemplate',
            text: this._labels.get('templates.fromTemplate'),
            iconProps: { iconName: 'PageList' },
            subMenuProps: {
                items: [{
                    key: 'selector',
                    onRender: (_, dismissMenu) => this._renderSelector(() => dismissMenu(undefined, true), recordId),
                }],
            },
        });
    };

    private _renderSelector(onDismiss: () => void, parentId?: string): JSX.Element {
        return createElement(TemplateSelectorAdapter, {
            templates: this,
            onTemplateSelected: templateId => {
                onDismiss();
                runQuietly(() => this.createTasksFromTemplate(templateId, parentId));
            },
        });
    }

    //the whole subtree, whatever the view hides
    private _toTemplateTree(task: IRecord): ICreateTaskTree {
        const provider = this._taskRuntime.getProvider();
        const { parentId, stackRank } = provider.getFieldMapping();
        const excluded = new Set([provider.getMetadata().PrimaryIdAttribute, parentId, stackRank]);
        const rawData = task.getRawData();
        const data = Object.fromEntries(provider.getColumns().filter(column => !column.isHidden && !excluded.has(column.name)).map(column => [column.name, rawData[column.name] ?? null]));
        const children = provider.getRecordTree().structure.getChildren(task.getRecordId()).map(child => this._toTemplateTree(child));
        return { data, children };
    }

    private _execute<T>(loadingLabel: 'templates.creatingTasksFromTemplate' | 'templates.savingTemplate', operation: () => Promise<T>): Promise<T> {
        return this._taskRuntime.execute(operation, { loading: { message: this._labels.get(loadingLabel) }, error: { title: this._labels.get('templates.templatesFailed') } });
    }
}

declare module "@controls/dataset-control/runtime/interfaces" {
    interface IDatasetControlModuleMap {
        /** Tasks created from templates, and templates captured from tasks. */
        templates: ITemplates;
    }
}
