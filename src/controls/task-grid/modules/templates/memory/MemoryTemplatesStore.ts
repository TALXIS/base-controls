import { DataTypes, IMemoryProviderEntityMetadata, MemoryDataProvider } from "@talxis/client-libraries";
import type { ICreateTaskTree } from "../../../provider";
import type { ITemplate, ITemplatesStore } from "../Templates";
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
    private _templates: IMemoryTemplate[];

    constructor(parameters: IMemoryTemplatesStoreParameters) {
        this._templates = structuredClone(parameters.templates);
    }

    public onCreateTemplatesProvider(): MemoryDataProvider {
        const provider = new MemoryDataProvider({ dataSource: this._templates.map(template => ({ id: template.id, name: template.name })), metadata: TEMPLATE_METADATA });
        provider.setColumns([{ name: 'name', displayName: 'Name', dataType: DataTypes.SingleLineText, isPrimary: true, visualSizeFactor: 200 }]);
        return provider;
    }

    public async onGetTemplate(templateId: string): Promise<ITemplate | null> {
        const template = this._templates.find(candidate => candidate.id === templateId);
        return template ? { name: template.name, tree: structuredClone({ data: template.data, children: template.children }) } : null;
    }

    public async onCreateTemplate(template: ITemplate): Promise<void> {
        await simulateBackend();
        this._templates.push({ id: crypto.randomUUID(), name: template.name, ...structuredClone(template.tree) });
    }
}
