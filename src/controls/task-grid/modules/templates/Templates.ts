import { createElement } from "react";
import type { IDataProvider, IRecord } from "@talxis/client-libraries";
import type { IRibbonCommand } from "@controls/ribbon";
import type { GridCellCommandsHook, IGrid } from "@controls/grid";
import type { LabelsOf } from "@labels";
import type { ICreateTaskTree, ITaskCreateParameters, ITasksCreateResult } from "../../runtime/provider";
import type { ITaskRuntime, TaskRibbonCommandUiHook } from "../../runtime";
import type { ITaskGridServiceMap } from "../../services";
import { TASK_GRID_PRIORITY } from "../../priorities";
import { TASK_COMMANDS_COLUMN_KEY } from "../../constants";
import { TEMPLATES_LABELS } from "./labels";
import { TemplateSelector } from "./adapters/template-selector";
import type { ITemplatesUiRecordListComponents } from "./ui/record-selector/record-list/components";
import type { ITemplatesUiRecordSelectorFrameComponents } from "./ui/record-selector/record-selector-frame/components";
import { runQuietly } from "../../runtime/runQuietly";

/** A template's own task, named after it, with the tasks under it. */
export interface ITemplate {
    name: string;
    tree: ICreateTaskTree;
}

/** The template and where its own task lands. */
export interface ITemplateTasksCreateParameters extends Omit<ITaskCreateParameters, 'data'> {
    templateId: string;
}

/** Where templates are kept, and what creates tasks from them. */
export interface ITemplatesStore {
    /** A provider over the templates, made each time the selector opens. */
    createTemplatesProvider(): IDataProvider;
    /** @returns The tasks created, or `null` when there were none or the user cancelled. */
    createTasks(parameters: ITemplateTasksCreateParameters): Promise<ITasksCreateResult | null>;
    /** Without it, tasks cannot be saved as templates. */
    createTemplate?(template: ITemplate): Promise<void>;
    /** Called as the templates go. */
    destroy?(): void;
}

/** The replaceable parts of what the templates draw, by the piece they belong to. */
export interface ITemplatesComponents {
    /** The box the selector is drawn in, in the New and row add menus. */
    selector?: Partial<ITemplatesUiRecordSelectorFrameComponents>;
    /** The templates offered in the selector. */
    list?: Partial<ITemplatesUiRecordListComponents>;
}

export interface ITemplatesParameters {
    createStore: (taskRuntime: ITaskRuntime) => ITemplatesStore;
    components?: ITemplatesComponents;
}

/** The `templates` module, creating tasks from templates and templates from tasks. */
export interface ITemplates {
    readonly components: ITemplatesComponents;
    createTemplatesProvider(): IDataProvider;
    /** Under `parentId`, or at the top level without it. */
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
    public readonly components: ITemplatesComponents;
    private _taskRuntime: ITaskRuntime;
    private _store: ITemplatesStore;

    constructor(taskRuntime: ITaskRuntime, parameters: ITemplatesParameters) {
        this._taskRuntime = taskRuntime;
        this.components = parameters.components ?? {};
        this._store = parameters.createStore(taskRuntime);
        taskRuntime.services.get('datasetControl').parts.observe('ribbon', ribbon => { ribbon.hooks.commands.add(this._addCommands, RIBBON_PRIORITY); });
        taskRuntime.hooks.ribbonCommandUi.add(this._onRibbonCommandUi);
        taskRuntime.services.get('datasetControl').parts.observe('grid', this._onGridAvailable);
    }

    private get _labels(): LabelsOf<typeof TEMPLATES_LABELS> {
        return this._taskRuntime.getLabels(TEMPLATES_LABELS);
    }

    public createTemplatesProvider(): IDataProvider {
        return this._store.createTemplatesProvider();
    }

    public async createTasksFromTemplate(templateId: string, parentId?: string): Promise<IRecord[] | null> {
        if (!this._taskRuntime.isCreationEnabled()) {
            return null;
        }
        return this._execute('templates.creatingTasksFromTemplate', () => this._taskRuntime.getProvider().createTasksWith(parentId, params => this._store.createTasks({ ...params, templateId })));
    }

    public async createTemplateFromTask(task: IRecord): Promise<void> {
        const createTemplate = this._store.createTemplate?.bind(this._store);
        if (!createTemplate) {
            throw new Error('The templates store keeps no templates of its own.');
        }
        await this._execute('templates.savingTemplate', async () => {
            const subject = this._taskRuntime.getProvider().getFieldMapping().subject;
            const { data, children } = this._toTemplateTree(task);
            const { [subject]: name, ...rootData } = data ?? {};
            await createTemplate({ name: (name as string | null) ?? '', tree: { data: rootData, children } });
        });
    }

    public destroy(): void {
        this._store.destroy?.();
    }

    //after the tree's own add command
    private _onGridAvailable = (grid: IGrid): void => {
        (grid as IGrid<ITaskGridServiceMap>).services.get('cells').hooks.commands.add(this._onCellCommands, TASK_GRID_PRIORITY.tree + 30);
    };

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
        if (task && this._store.createTemplate) {
            commands.splice(newIndex === -1 ? commands.length : newIndex + 1, 0, { id: 'saveAsTemplate', label: this._labels.get('templates.saveAsTemplate'), iconName: 'PageAdd', onExecute: () => runQuietly(() => this.createTemplateFromTask(task)) });
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
        return createElement(TemplateSelector, {
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
