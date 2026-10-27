import { DataTypes, IMemoryProviderEntityMetadata, MemoryDataProvider } from "@talxis/client-libraries";
import type { ICreateTaskTree, ITasksCreateResult } from "../../../provider";
import type { MemoryTaskDatabase } from "../../../data-sources/memory/MemoryTaskDatabase";
import type { ITemplate, ITemplatesStore, ITemplateTasksCreateParams } from "../Templates";
import { simulateBackend } from "../../../data-sources/memory/simulateBackend";

/** One task of a memory template, with its subtree. */
export interface IMemoryTemplateTask extends ICreateTaskTree {
    /** Column values of the task; its id, parent and position are always the grid's. */
    data?: { [columnName: string]: unknown };
    children?: IMemoryTemplateTask[];
}

/** The template's own task, named after it, with its subtree. */
export interface IMemoryTemplate extends IMemoryTemplateTask {
    id: string;
    name: string;
}

export interface IMemoryTemplatesStoreParameters {
    /** Where a template's tasks are created; the one the grid's memory task store reads. */
    database: MemoryTaskDatabase;
    /** Copied in; a template captured later is kept in the copy. */
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
    private _database: MemoryTaskDatabase;
    private _templates: IMemoryTemplate[];

    constructor(parameters: IMemoryTemplatesStoreParameters) {
        this._database = parameters.database;
        this._templates = structuredClone(parameters.templates);
    }

    public onCreateTemplatesProvider(): MemoryDataProvider {
        const provider = new MemoryDataProvider({ dataSource: this._templates.map(template => ({ id: template.id, name: template.name })), metadata: TEMPLATE_METADATA });
        provider.setColumns([{ name: 'name', displayName: 'Name', dataType: DataTypes.SingleLineText, isPrimary: true, visualSizeFactor: 200 }]);
        return provider;
    }

    public async onCreateTasks(params: ITemplateTasksCreateParams): Promise<ITasksCreateResult | null> {
        await simulateBackend();
        const template = this._templates.find(candidate => candidate.id === params.templateId);
        if (!template) {
            return null;
        }
        const tree: ICreateTaskTree = { data: { ...template.data, [params.fieldMapping.subject]: template.name }, children: template.children };
        return { records: this._database.createTasks([tree], params) };
    }

    public async onCreateTemplate(template: ITemplate): Promise<void> {
        await simulateBackend();
        this._templates.push({ id: crypto.randomUUID(), name: template.name, ...structuredClone(template.tree) });
    }
}
