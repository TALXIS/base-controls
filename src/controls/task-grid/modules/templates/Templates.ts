import { createElement } from "react";
import type { IDataProvider, IRecord } from "@talxis/client-libraries";
import type { IRibbonCommand } from "@controls/ribbon";
import type { GridCellCommandsHook, IGrid } from "@controls/grid";
import { ErrorHelper, ILocalizationService, LocalizationService } from "@utils";
import type { ITaskDatasetControlRuntime, TaskRibbonCommandUiHook } from "../../runtime";
import type { ITaskGridServiceMap } from "../../services";
import { TASK_GRID_PRIORITY } from "../../priorities";
import { TASK_COMMANDS_COLUMN_KEY } from "../../tree/constants";
import { ITemplatesLabels, TEMPLATES_LABELS } from "./labels";
import { TemplateSelectorAdapter } from "./components/adapters/template-selector";

export interface ICreateTasksFromTemplateParameters {
    templateId: string;
    /** The task the template's tasks go under; the top level without it. */
    parentId?: string;
    taskDatasetControl: ITaskDatasetControlRuntime;
}

export interface ICreateTemplateFromTaskParameters {
    task: IRecord;
    taskDatasetControl: ITaskDatasetControlRuntime;
}

/** Where templates come from, and how they turn into tasks and back. */
export interface ITemplatesStrategy {
    /** A provider over the templates, searched by the selector; made each time it opens. */
    onCreateTemplatesProvider(taskDatasetControl: ITaskDatasetControlRuntime): IDataProvider;
    onCreateTasksFromTemplate(parameters: ICreateTasksFromTemplateParameters): Promise<void>;
    /** Captures the task and its subtree; *Save as template* is offered only when implemented. */
    onCreateTemplateFromTask?(parameters: ICreateTemplateFromTaskParameters): Promise<void>;
}

export interface ITemplatesParameters {
    strategy: ITemplatesStrategy;
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
    private _taskDatasetControl: ITaskDatasetControlRuntime;
    private _strategy: ITemplatesStrategy;
    private _labels: ILocalizationService<ITemplatesLabels>;
    private _unregisters: (() => void)[] = [];

    constructor(taskDatasetControl: ITaskDatasetControlRuntime, parameters: ITemplatesParameters) {
        this._taskDatasetControl = taskDatasetControl;
        this._strategy = parameters.strategy;
        this._labels = new LocalizationService<ITemplatesLabels>({ ...TEMPLATES_LABELS, ...parameters.labels });
        taskDatasetControl.services.get('datasetControl').parts.whenAvailable('ribbon', ribbon => this._unregisters.push(ribbon.registerCommands(this._addCommands, RIBBON_PRIORITY)));
        this._unregisters.push(taskDatasetControl.registerRibbonCommandUi(this._onRibbonCommandUi));
        taskDatasetControl.registerGridModule({ onRegister: grid => this._onGridRegistered(grid) });
    }

    public getLabels(): ILocalizationService<ITemplatesLabels> {
        return this._labels;
    }

    public createTemplatesProvider(): IDataProvider {
        return this._strategy.onCreateTemplatesProvider(this._taskDatasetControl);
    }

    public async createTasksFromTemplate(templateId: string, parentId?: string): Promise<void> {
        await this._run('creatingTasksFromTemplate', () => this._strategy.onCreateTasksFromTemplate({ templateId, parentId, taskDatasetControl: this._taskDatasetControl }));
    }

    public async createTemplateFromTask(task: IRecord): Promise<void> {
        await this._run('savingTemplate', async () => this._strategy.onCreateTemplateFromTask?.({ task, taskDatasetControl: this._taskDatasetControl }));
    }

    public destroy(): void {
        this._unregisters.forEach(unregister => unregister());
    }

    private _onGridRegistered(grid: IGrid<ITaskGridServiceMap>): void {
        //after the tree's own add command
        this._unregisters.push(grid.services.get('cells').registerCellCommands(this._onCellCommands, TASK_GRID_PRIORITY.tree + 30));
    }

    private _addCommands = (commands: IRibbonCommand[]): void => {
        const provider = this._taskDatasetControl.getProvider();
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
        if (task && this._strategy.onCreateTemplateFromTask) {
            commands.splice(newIndex + 1, 0, { id: 'saveAsTemplate', label: this._labels.getLocalizedString('saveAsTemplate'), iconName: 'PageAdd', onExecute: () => this.createTemplateFromTask(task) });
        }
    };

    private _onRibbonCommandUi: TaskRibbonCommandUiHook = item => {
        if (item.key !== FROM_TEMPLATE_COMMAND_ID) {
            return;
        }
        const provider = this._taskDatasetControl.getProvider();
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

    //the commands do not await them
    private async _run(loadingLabel: 'creatingTasksFromTemplate' | 'savingTemplate', operation: () => Promise<void>): Promise<void> {
        const provider = this._taskDatasetControl.getProvider();
        provider.setLoading(true, this._labels.getLocalizedString(loadingLabel));
        try {
            await operation();
        }
        catch (error) {
            await this._taskDatasetControl.services.get('pcfContext').navigation.openErrorDialog({ message: this._labels.getLocalizedString('templatesFailed'), details: ErrorHelper.getMessageFromError(error) });
        }
        finally {
            provider.setLoading(false);
        }
    }
}

declare module "@controls/dataset-control/runtime/interfaces" {
    interface IDatasetControlModuleMap {
        /** Tasks created from templates, and templates captured from tasks. */
        templates: ITemplates;
    }
}
