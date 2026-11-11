import { DataTypes, IMemoryProviderEntityMetadata, IRawRecord, MemoryDataProvider } from "@talxis/client-libraries";
import type { MemoryTable } from "@core/state";
import type { ICreateTaskTree, ITasksCreateResult } from "../../../runtime/provider";
import { createMemoryTaskTrees } from "../../../runtime/data-sources/memory/createMemoryTaskTrees";
import type { ITaskRuntime } from "../../../runtime";
import type { ITemplate, ITemplatesStore, ITemplateTasksCreateParameters } from "../Templates";
import { TEMPLATES_LABELS } from "../labels";

/** One task of a memory template, with its subtree. */
export interface IMemoryTemplateTask extends ICreateTaskTree {
    /** Column values of the task other than its id, parent and position. */
    data?: { [columnName: string]: unknown };
    children?: IMemoryTemplateTask[];
}

/** The template's own task, named after it, with its subtree. */
export interface IMemoryTemplate extends IMemoryTemplateTask {
    id: string;
    name: string;
}

export interface IMemoryTemplatesStoreParameters {
    taskRuntime: ITaskRuntime;
    /** Where a template's tasks are created, the table the grid's `MemoryTaskStore` reads. */
    tasks: MemoryTable<IRawRecord>;
    /** Where the templates are kept, the ones the user saves included. */
    templates: MemoryTable<IMemoryTemplate>;
}

const TEMPLATE_METADATA: IMemoryProviderEntityMetadata = {
    PrimaryIdAttribute: 'id',
    PrimaryNameAttribute: 'name',
    LogicalName: 'template',
    QuickFindColumns: ['name'],
};

/** Templates kept in a `MemoryTable`, creating their tasks in the tasks table. */
export class MemoryTemplatesStore implements ITemplatesStore {
    private _taskRuntime: ITaskRuntime;
    private _tasks: MemoryTable<IRawRecord>;
    private _templates: MemoryTable<IMemoryTemplate>;

    constructor(parameters: IMemoryTemplatesStoreParameters) {
        this._taskRuntime = parameters.taskRuntime;
        this._tasks = parameters.tasks;
        this._templates = parameters.templates;
    }

    public createTemplatesProvider(): MemoryDataProvider {
        const provider = new MemoryDataProvider({ dataSource: this._templates.getRows().map(template => ({ id: template.id, name: template.name })), metadata: TEMPLATE_METADATA });
        provider.setColumns([{ name: 'name', displayName: this._taskRuntime.getLabels(TEMPLATES_LABELS).get('templates.name'), dataType: DataTypes.SingleLineText, isPrimary: true, visualSizeFactor: 200 }]);
        return provider;
    }

    public async createTasks(parameters: ITemplateTasksCreateParameters): Promise<ITasksCreateResult | null> {
        const template = this._templates.getRow(parameters.templateId);
        if (!template) {
            return null;
        }
        const subject = this._taskRuntime.getProvider().getFieldMapping().subject;
        const tree: ICreateTaskTree = { data: { ...template.data, [subject]: template.name }, children: template.children };
        return { records: createMemoryTaskTrees(this._tasks, this._taskRuntime, [tree], parameters) };
    }

    public async createTemplate(template: ITemplate): Promise<void> {
        this._templates.insert([{ ...template.tree, id: crypto.randomUUID(), name: template.name }]);
    }
}
