import { createElement } from "react";
import type { IDataProvider, IRecord } from "@talxis/client-libraries";
import type { IRibbonCommand } from "@controls/ribbon";
import type { GridCellCommandsHook, IGrid } from "@controls/grid";
import { ILocalizationService, LocalizationService } from "@utils";
import type { ICreateTaskTree } from "../../provider";
import type { ITaskRuntime, TaskRibbonCommandUiHook } from "../../runtime";
import type { ITaskGridServiceMap } from "../../services";
import { TASK_GRID_PRIORITY } from "../../priorities";
import { TASK_COMMANDS_COLUMN_KEY } from "../../tree/constants";
import { ITemplatesLabels, TEMPLATES_LABELS } from "./labels";
import { TemplateSelectorAdapter } from "./components/adapters/template-selector";
import { runQuietly } from "../../runtime/runQuietly";

/** A template: its own task, named after it, with the tasks under it. */
export interface ITemplate {
    name: string;
    tree: ICreateTaskTree;
}

/** Where templates are kept. */
export interface ITemplatesStore {
    /** A provider over the templates, searched by the selector; made each time it opens. */
    onCreateTemplatesProvider(): IDataProvider;
    /** @returns The template, or `null` when there is none with the id. */
    onGetTemplate(templateId: string): Promise<ITemplate | null>;
    onCreateTemplate(template: ITemplate): Promise<void>;
}

export interface ITemplatesParameters {
    onCreateStore: (taskRuntime: ITaskRuntime) => ITemplatesStore;
    /** Overrides for the module's strings. */
    labels?: Partial<ITemplatesLabels>;
}

/** The `templates` module: tasks created from templates, and templates captured from tasks. */
export interface ITemplates {
    getLabels(): ILocalizationService<ITemplatesLabels>;
    createTemplatesProvider(): IDataProvider;
    /** Under `parentId`, or at the top level without it. */
    createTasksFromTemplate(templateId: string, parentId?: string): Promise<void>;
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
    private _labels: ILocalizationService<ITemplatesLabels>;
    private _unregisters: (() => void)[] = [];

    constructor(taskRuntime: ITaskRuntime, parameters: ITemplatesParameters) {
        this._taskRuntime = taskRuntime;
        this._store = parameters.onCreateStore(taskRuntime);
        this._labels = new LocalizationService<ITemplatesLabels>({ ...TEMPLATES_LABELS, ...parameters.labels });
        taskRuntime.services.get('datasetControl').parts.whenAvailable('ribbon', ribbon => this._unregisters.push(ribbon.registerCommands(this._addCommands, RIBBON_PRIORITY)));
        this._unregisters.push(taskRuntime.registerRibbonCommandUi(this._onRibbonCommandUi));
        taskRuntime.services.get('datasetControl').parts.whenAvailable('grid', grid => this._onGridAvailable(grid as IGrid<ITaskGridServiceMap>));
    }

    public getLabels(): ILocalizationService<ITemplatesLabels> {
        return this._labels;
    }

    public createTemplatesProvider(): IDataProvider {
        return this._store.onCreateTemplatesProvider();
    }

    public async createTasksFromTemplate(templateId: string, parentId?: string): Promise<void> {
        await this._run('creatingTasksFromTemplate', async () => {
            const template = await this._store.onGetTemplate(templateId);
            if (template) {
                const { tree } = template;
                const subject = this._taskRuntime.getFieldMapping().subject;
                await this._taskRuntime.tasks.createTrees([{ ...tree, data: { ...tree.data, [subject]: template.name } }], parentId);
            }
        });
    }

    public async createTemplateFromTask(task: IRecord): Promise<void> {
        await this._run('savingTemplate', async () => {
            const subject = this._taskRuntime.getProvider().getFieldMapping().subject;
            const { data, children } = this._toTemplateTree(task);
            const { [subject]: name, ...rootData } = data ?? {};
            await this._store.onCreateTemplate({ name: (name as string | null) ?? '', tree: { data: rootData, children } });
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
                    { ...newCommand, id: 'newTask', label: this._labels.getLocalizedString('task') },
                    //its selector comes through the ribbon command UI hook
                    { id: FROM_TEMPLATE_COMMAND_ID, label: this._labels.getLocalizedString('fromTemplate'), iconName: 'PageList', commands: [] },
                ],
            };
        }
        const task = selectedIds.length === 1 ? provider.getRecordsMap()[selectedIds[0]] : undefined;
        if (task) {
            commands.splice(newIndex + 1, 0, { id: 'saveAsTemplate', label: this._labels.getLocalizedString('saveAsTemplate'), iconName: 'PageAdd', onExecute: () => this.createTemplateFromTask(task) });
        }
    };

    private _onRibbonCommandUi: TaskRibbonCommandUiHook = item => {
        if (item.key !== FROM_TEMPLATE_COMMAND_ID) {
            return;
        }
        const provider = this._taskRuntime.getProvider();
        item.subMenuProps = {
            items: [{
                key: 'selector',
                //the selection at the moment of the pick
                onRender: (_, dismissMenu) => this._renderSelector(() => dismissMenu(undefined, true), () => {
                    const ids = provider.getSelectedRecordIds();
                    return ids.length === 1 ? ids[0] : undefined;
                }),
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
            text: this._labels.getLocalizedString('fromTemplate'),
            iconProps: { iconName: 'PageList' },
            subMenuProps: {
                items: [{
                    key: 'selector',
                    onRender: (_, dismissMenu) => this._renderSelector(() => dismissMenu(undefined, true), () => recordId),
                }],
            },
        });
    };

    private _renderSelector(onDismiss: () => void, onGetParentId: () => string | undefined): JSX.Element {
        return createElement(TemplateSelectorAdapter, {
            templates: this,
            onTemplateSelected: templateId => {
                onDismiss();
                this.createTasksFromTemplate(templateId, onGetParentId());
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

    //the commands do not await them
    private async _run(loadingLabel: 'creatingTasksFromTemplate' | 'savingTemplate', operation: () => Promise<void>): Promise<void> {
        await runQuietly(() => this._taskRuntime.execute(operation, { loadingMessage: this._labels.getLocalizedString(loadingLabel), errorMessage: this._labels.getLocalizedString('templatesFailed') }));
    }
}

declare module "@controls/dataset-control/runtime/interfaces" {
    interface IDatasetControlModuleMap {
        /** Tasks created from templates, and templates captured from tasks. */
        templates: ITemplates;
    }
}
