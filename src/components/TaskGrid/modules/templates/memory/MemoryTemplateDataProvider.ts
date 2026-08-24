import { IColumn, IRawRecord, IRecord, MemoryDataProvider } from "@talxis/client-libraries";
import { ITaskDataProvider, ITemplateDataProviderParams, TemplateDataProviderBase } from "@components/TaskGrid/providers";
import { IRecordTree } from "@components/TaskGrid/providers/task/record-tree";
import { IMemoryTaskTemplateNode, IMemoryTemplateSource } from "./interfaces";

/** Constructor parameters for {@link MemoryTemplateDataProvider}. */
export interface IMemoryTemplateDataProviderParams extends ITemplateDataProviderParams {
    /**
     * The template entity plus the child hierarchy each template expands into.
     *
     * **`records` is written into.** Creating a template pushes into that array — the same way the
     * memory task strategy writes tasks — which is how templates outlive the grid's remounts.
     */
    templates: IMemoryTemplateSource;
}

/** The task-side data a single capture reads, resolved once from the task data provider. */
interface ITemplateCaptureContext {
    recordTree: IRecordTree;
    /** Non-hidden task column names. */
    visibleColumns: string[];
}

/**
 * {@link ITemplateDataProvider} implementation backed entirely by in-memory records.
 *
 * Lists the templates the picker offers, expands one into a task subtree, and captures new ones from a
 * task, without any server or Dataverse dependency. Intended for local development, tests, Storybook
 * and demos.
 *
 * Normally created by {@link MemoryTaskGridDescriptor}; construct it directly when you supply your
 * own descriptor, or subclass it to override either direction.
 */
export class MemoryTemplateDataProvider extends TemplateDataProviderBase(MemoryDataProvider) {
    private _params: IMemoryTemplateDataProviderParams;

    constructor(params: IMemoryTemplateDataProviderParams) {
        super({
            //a copy: MemoryDataProvider swaps its internal array on delete
            dataSource: [...params.templates.records],
            metadata: params.templates.metadata,
        });
        this.setColumns(params.templates.columns);
        this._params = params;
    }

    // ── Template expansion ───────────────────────────────────────────────────

    /**
     * Recreates the template as a task and its whole subtree, in template order.
     *
     * Every task is created through the task provider's own `createTask`, then the template's values are
     * applied to what came back — the task side is never told a template is involved.
     */
    protected async onCreateTasksFromTemplate(templateId: string, parentTaskId?: string): Promise<IRawRecord[] | null> {
        const template = this.getRecordsMap()[templateId];
        if (!template) {
            return null;
        }
        const tasks: IRawRecord[] = [];
        const rootTaskId = await this._createTask(this._getTaskFieldsFromTemplate(template), parentTaskId, tasks);
        if (!rootTaskId) {
            return null;
        }
        await this._createChildren(this._params.templates.children?.[templateId] ?? [], rootTaskId, tasks);
        return tasks;
    }

    /**
     * Creates the nodes beneath `parentTaskId`, each with its own subtree.
     *
     * Back to front: `createTask` lands a new task before every existing sibling, so creating the last
     * node first is what leaves them in the order the template describes.
     */
    private async _createChildren(nodes: IMemoryTaskTemplateNode[], parentTaskId: string, tasks: IRawRecord[]): Promise<void> {
        for (const node of [...nodes].reverse()) {
            const taskId = await this._createTask(node.values, parentTaskId, tasks);
            if (taskId && node.children?.length) {
                await this._createChildren(node.children, taskId, tasks);
            }
        }
    }

    /**
     * Creates one task and writes `values` onto it, appending what was created to `tasks`.
     *
     * @returns The created task's id, or `null` when the task provider reported a cancellation.
     */
    private async _createTask(values: Partial<IRawRecord>, parentTaskId: string | undefined, tasks: IRawRecord[]): Promise<string | null> {
        const taskDataProvider = this._getTaskDataProvider();
        const createdTask = await taskDataProvider.createTask(parentTaskId);
        if (!createdTask) {
            return null;
        }
        const taskId = createdTask[taskDataProvider.getMetadata().PrimaryIdAttribute] as string;
        const task = { ...createdTask, ...this._getApplicableValues(values, taskDataProvider) };
        //the record the provider just built is the one this updates in place
        taskDataProvider.updateTaskData([task]);
        tasks.push(task);
        return taskId;
    }

    /**
     * `values` minus the columns the task side owns: a template that happens to carry a column named
     * like the task's own id, parent lookup or stack rank must not overwrite what the creation resolved.
     */
    private _getApplicableValues(values: Partial<IRawRecord>, taskDataProvider: ITaskDataProvider): Partial<IRawRecord> {
        const nativeColumns = taskDataProvider.getNativeColumns();
        const owned = new Set([taskDataProvider.getMetadata().PrimaryIdAttribute, nativeColumns.parentId, nativeColumns.stackRank]);
        return Object.fromEntries(Object.entries(values).filter(([columnName]) => !owned.has(columnName)));
    }

    /** Maps a template record onto the task fields the two entities share. */
    private _getTaskFieldsFromTemplate(template: IRecord): Partial<IRawRecord> {
        const taskDataProvider = this._getTaskDataProvider();
        const metadata = this.getMetadata();
        const rawTemplate = template.getRawData();
        const fields: Partial<IRawRecord> = {};
        for (const column of taskDataProvider.getColumns()) {
            if (column.name !== metadata?.PrimaryIdAttribute && rawTemplate[column.name] !== undefined) {
                fields[column.name] = rawTemplate[column.name];
            }
        }
        if (metadata?.PrimaryNameAttribute) {
            fields[taskDataProvider.getNativeColumns().subject] = template.getNamedReference().name ?? null;
        }
        return fields;
    }

    // ── Template capture ─────────────────────────────────────────────────────

    protected async onCreateTemplateFromTask(task: IRecord): Promise<IRawRecord | null> {
        const { templates } = this._params;
        const rawTask = task.getRawData();
        const { PrimaryIdAttribute, PrimaryNameAttribute } = templates.metadata;
        const templateId = crypto.randomUUID();
        const template: IRawRecord = { [PrimaryIdAttribute!]: templateId };
        //carry over every field the template entity and the task entity have in common
        for (const column of templates.columns) {
            if (column.name !== PrimaryIdAttribute) {
                template[column.name] = rawTask[column.name] ?? null;
            }
        }
        if (PrimaryNameAttribute) {
            template[PrimaryNameAttribute] = task.getNamedReference().name ?? null;
        }

        templates.records.push(template);
        const children = this._buildTemplateNodes(task, this._getCaptureContext());
        if (children.length > 0) {
            templates.children ??= {};
            templates.children[templateId] = children;
        }
        //already written - this only re-points an open picker at the updated list
        this.setDataSource([...templates.records]);
        return template;
    }

    /**
     * Captures a task's subtree as template nodes, depth-first, carrying over every visible column.
     *
     * The children come from the complete hierarchy, so an active quick find does not drop the subtasks it
     * hides.
     */
    private _buildTemplateNodes(task: IRecord, context: ITemplateCaptureContext): IMemoryTaskTemplateNode[] {
        const children = context.recordTree.structure.getChildren(task.getRecordId());
        return children.map(child => {
            const rawChild = child.getRawData();
            return {
                values: Object.fromEntries(context.visibleColumns.map(columnName => [columnName, rawChild[columnName] ?? null])),
                children: this._buildTemplateNodes(child, context),
            };
        });
    }

    /** Everything the capture needs from the task side: its hierarchy and its visible columns. */
    private _getCaptureContext(): ITemplateCaptureContext {
        const taskDataProvider = this._getTaskDataProvider();
        return {
            recordTree: taskDataProvider.getRecordTree(),
            visibleColumns: taskDataProvider.getColumns().filter((column: IColumn) => !column.isHidden).map((column: IColumn) => column.name),
        };
    }

    private _getTaskDataProvider(): ITaskDataProvider {
        return this._params.onGetTaskDataProvider();
    }
}
