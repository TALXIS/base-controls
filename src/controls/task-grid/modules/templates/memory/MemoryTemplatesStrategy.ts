import { DataTypes, IMemoryProviderEntityMetadata, IRecord, MemoryDataProvider } from "@talxis/client-libraries";
import type { ITaskDataProvider } from "../../../provider";
import type { ICreateTasksFromTemplateParameters, ICreateTemplateFromTaskParameters, ITemplatesStrategy } from "../Templates";

/** One task of a memory template, with its subtree. */
export interface IMemoryTemplateTask {
    /** Column values of the task; its id, parent and position are always the grid's. */
    data?: { [columnName: string]: unknown };
    children?: IMemoryTemplateTask[];
}

/** The template's own task, named after it, with its subtree. */
export interface IMemoryTemplate extends IMemoryTemplateTask {
    id: string;
    name: string;
}

export interface IMemoryTemplatesStrategyParameters {
    /** Copied in; a template captured later is kept in the copy. */
    templates: IMemoryTemplate[];
}

const TEMPLATE_METADATA: IMemoryProviderEntityMetadata = {
    PrimaryIdAttribute: 'id',
    PrimaryNameAttribute: 'name',
    LogicalName: 'template',
    QuickFindColumns: ['name'],
};

/** Templates held in memory, expanded through the task provider like tasks the user creates. */
export class MemoryTemplatesStrategy implements ITemplatesStrategy {
    private _templates: IMemoryTemplate[];

    constructor(parameters: IMemoryTemplatesStrategyParameters) {
        this._templates = structuredClone(parameters.templates);
    }

    /** The templates as they are now, the captured ones included. */
    public getTemplates(): IMemoryTemplate[] {
        return structuredClone(this._templates);
    }

    public onCreateTemplatesProvider(): MemoryDataProvider {
        const provider = new MemoryDataProvider({ dataSource: this._templates.map(template => ({ id: template.id, name: template.name })), metadata: TEMPLATE_METADATA });
        provider.setColumns([{ name: 'name', displayName: 'Name', dataType: DataTypes.SingleLineText, isPrimary: true, visualSizeFactor: 200 }]);
        return provider;
    }

    public async onCreateTasksFromTemplate({ templateId, parentId, taskDatasetControl }: ICreateTasksFromTemplateParameters): Promise<void> {
        const template = this._templates.find(candidate => candidate.id === templateId);
        if (!template) {
            return;
        }
        const provider = taskDatasetControl.getProvider();
        const root = await provider.createTask(parentId, { data: { ...template.data, [provider.getFieldMapping().subject]: template.name } });
        if (root) {
            await this._createChildren(provider, template.children ?? [], root.getRecordId());
        }
    }

    public async onCreateTemplateFromTask({ task, taskDatasetControl }: ICreateTemplateFromTaskParameters): Promise<void> {
        const provider = taskDatasetControl.getProvider();
        const { data, children } = this._toTemplateTask(provider, task);
        const subject = provider.getFieldMapping().subject;
        const { [subject]: name, ...rootData } = data ?? {};
        this._templates.push({ id: crypto.randomUUID(), name: (name as string | null) ?? '', data: rootData, children });
    }

    //each after the sibling created before it, so the template's order holds
    private async _createChildren(provider: ITaskDataProvider, tasks: IMemoryTemplateTask[], parentId: string): Promise<void> {
        let previousTaskId: string | undefined;
        for (const task of tasks) {
            const created = await provider.createTask(parentId, { data: task.data, previousTaskId });
            if (!created) {
                return;
            }
            previousTaskId = created.getRecordId();
            await this._createChildren(provider, task.children ?? [], previousTaskId);
        }
    }

    //the whole subtree, whatever the view hides
    private _toTemplateTask(provider: ITaskDataProvider, task: IRecord): IMemoryTemplateTask {
        const { parentId, stackRank } = provider.getFieldMapping();
        const excluded = new Set([provider.getMetadata().PrimaryIdAttribute, parentId, stackRank]);
        const rawData = task.getRawData();
        const data = Object.fromEntries(provider.getColumns().filter(column => !column.isHidden && !excluded.has(column.name)).map(column => [column.name, rawData[column.name] ?? null]));
        const children = provider.getRecordTree().structure.getChildren(task.getRecordId()).map(child => this._toTemplateTask(provider, child));
        return { data, children };
    }
}
