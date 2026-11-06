import { DataTypes, IMemoryProviderEntityMetadata, MemoryDataProvider } from "@talxis/client-libraries";
import type { ICreateTaskTree, ITasksCreateResult } from "../../../runtime/provider";
import type { MemoryTaskDatabase } from "../../../runtime/data-sources/memory/MemoryTaskDatabase";
import type { ITaskRuntime } from "../../../runtime";
import type { ITemplate, ITemplatesStore, ITemplateTasksCreateParameters } from "../Templates";
import { simulateBackend } from "../../../runtime/data-sources/memory/simulateBackend";
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
    /** Where a template's tasks are created, the one the grid's memory task store reads. */
    database: MemoryTaskDatabase;
    /** Copied in with the templates captured later. */
    templates: IMemoryTemplate[];
}

const TEMPLATE_METADATA: IMemoryProviderEntityMetadata = {
    PrimaryIdAttribute: 'id',
    PrimaryNameAttribute: 'name',
    LogicalName: 'template',
    QuickFindColumns: ['name'],
};

/** Templates held in memory. */
export class MemoryTemplatesStore implements ITemplatesStore {
    private _taskRuntime: ITaskRuntime;
    private _database: MemoryTaskDatabase;
    private _templates: IMemoryTemplate[];

    constructor(parameters: IMemoryTemplatesStoreParameters) {
        this._taskRuntime = parameters.taskRuntime;
        this._database = parameters.database;
        this._templates = structuredClone(parameters.templates);
    }

    public createTemplatesProvider(): MemoryDataProvider {
        const provider = new MemoryDataProvider({ dataSource: this._templates.map(template => ({ id: template.id, name: template.name })), metadata: TEMPLATE_METADATA });
        provider.setColumns([{ name: 'name', displayName: this._taskRuntime.getLabels(TEMPLATES_LABELS).get('templates.name'), dataType: DataTypes.SingleLineText, isPrimary: true, visualSizeFactor: 200 }]);
        return provider;
    }

    public async createTasks(parameters: ITemplateTasksCreateParameters): Promise<ITasksCreateResult | null> {
        await simulateBackend();
        const template = this._templates.find(candidate => candidate.id === parameters.templateId);
        if (!template) {
            return null;
        }
        const provider = this._taskRuntime.getProvider();
        const fieldMapping = provider.getFieldMapping();
        const tree: ICreateTaskTree = { data: { ...template.data, [fieldMapping.subject]: template.name }, children: template.children };
        return { records: this._database.createTasks([tree], parameters, { fieldMapping, columns: provider.getColumns() }) };
    }

    public async createTemplate(template: ITemplate): Promise<void> {
        await simulateBackend();
        this._templates.push({ id: crypto.randomUUID(), name: template.name, ...structuredClone(template.tree) });
    }
}
