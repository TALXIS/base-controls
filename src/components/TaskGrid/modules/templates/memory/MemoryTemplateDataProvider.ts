import { IRawRecord, IRecord, MemoryDataProvider } from "@talxis/client-libraries";
import { ICreateTasksFromTemplateParams, ITaskDataProvider, ITemplateDataProviderParams, TemplateDataProviderBase } from "@components/TaskGrid/providers";
import { StackRank } from "@components/TaskGrid/stack-rank";
import { IMemoryTaskTemplateNode, IMemoryTemplateSource } from "./interfaces";

/** Constructor parameters for {@link MemoryTemplateDataProvider}. */
export interface IMemoryTemplateDataProviderParams extends ITemplateDataProviderParams {
    /**
     * The template entity plus the child hierarchy each template expands into.
     *
     * Deep-cloned on the way in, records and children map alike, so the provider never writes into it. To keep a template captured at runtime, take a
     * {@link MemoryTemplateDataProvider.getTemplateSource} snapshot from the grid's `onBeforeDestroy` prop;
     * otherwise it goes with the provider.
     */
    templates: IMemoryTemplateSource;
}

/** Where one built task lands: what it hangs off, and which ranks it sorts between. */
interface ITaskPlacement {
    /** The parent lookup value, or `null` for a task at the grid's root. */
    parentReference: ComponentFramework.EntityReference[] | null;
    /** The rank it sorts after — the sibling built before it, when there is one. */
    previousStackRank?: string;
    /** The rank it sorts before — the first task already under the parent, when there is one. */
    nextStackRank?: string;
}

/**
 * {@link ITemplateDataProvider} implementation backed entirely by in-memory records.
 *
 * Lists the templates the picker offers, resolves what one expands into, and captures new ones from a
 * task, without any server or Dataverse dependency. Intended for local development, tests, Storybook
 * and demos.
 *
 * Everything it needs to describe a task — the columns, the metadata, the hierarchy — it reads off the
 * task provider it was constructed with. It never creates anything there: the task provider listens for
 * what an expansion resolved and adds those records itself.
 *
 * It writes into nothing it was handed either. The template source is copied at construction, a capture
 * lands in that copy, and keeping it is the consumer's call — listen for `onAfterTemplateCreated` and
 * store what {@link MemoryTemplateDataProvider.getTemplateSource} returns.
 *
 * Normally created by {@link MemoryTaskGridDescriptor}; construct it directly when you supply your
 * own descriptor, or subclass it to override either direction.
 */
export class MemoryTemplateDataProvider extends TemplateDataProviderBase(MemoryDataProvider) {
    private _params: IMemoryTemplateDataProviderParams;
    //copies, and the source of truth from here on: what the provider was handed belongs to whoever
    //handed it over, so a capture is reported rather than written back
    private _records: IRawRecord[];
    private _children: Record<string, IMemoryTaskTemplateNode[]>;

    constructor(params: IMemoryTemplateDataProviderParams) {
        super({
            dataSource: structuredClone(params.templates.records),
            metadata: params.templates.metadata,
        });
        this.setColumns(params.templates.columns);
        this._params = params;
        this._records = structuredClone(params.templates.records);
        //?? {} because the source may omit it, where the previous spread produced an empty map
        this._children = structuredClone(params.templates.children ?? {});
    }

    /**
     * The template source as this provider currently holds it, including anything captured since it was
     * built. Take a snapshot when {@link ITemplateDataProviderEvents.onAfterTemplateCreated} reports a
     * capture and templates outlive the grid; ignore it and they do not.
     */
    public getTemplateSource(): IMemoryTemplateSource {
        return {
            ...this._params.templates,
            records: [...this._records],
            children: { ...this._children },
        };
    }

    // ── Template expansion ───────────────────────────────────────────────────

    /**
     * Resolves the tasks the template expands into: the one built from the template record itself,
     * followed by its whole subtree, depth-first and in template order.
     *
     * They come back finished — the task provider adds exactly these records to the grid.
     */
    protected async onCreateTasksFromTemplate(params: ICreateTasksFromTemplateParams): Promise<IRawRecord[] | null> {
        const { templateId, parentRecord } = params;
        const template = this.getRecordsMap()[templateId];
        if (!template) {
            return null;
        }
        const taskDataProvider = this._getTaskDataProvider();
        //before every task already under the parent, filtered out of the view or not
        const nextStackRank = taskDataProvider.getRecordTree().structure.getChildren(parentRecord?.getRecordId() ?? null)[0]
            ?.getValue(taskDataProvider.getNativeColumns().stackRank) as string | undefined;
        const rootTask = this._buildTask(this._getTaskFieldsFromTemplate(template), {
            parentReference: parentRecord ? [parentRecord.getNamedReference()] : null,
            nextStackRank,
        });
        const tasks = [rootTask];
        this._buildChildren(this._children[templateId] ?? [], rootTask, tasks);
        return tasks;
    }

    /**
     * Builds the nodes beneath `parentTask`, depth-first, appending each to `tasks`.
     *
     * The descendants are ours to rank: they have no siblings in the grid yet, so each one ranks after
     * the one built before it, which preserves the order the template describes.
     */
    private _buildChildren(nodes: IMemoryTaskTemplateNode[], parentTask: IRawRecord, tasks: IRawRecord[]): void {
        const parentReference = this._getNewTaskReference(parentTask);
        const { stackRank } = this._getTaskDataProvider().getNativeColumns();
        let previousStackRank: string | undefined;
        for (const node of nodes) {
            const task = this._buildTask(node.values, { parentReference, previousStackRank });
            previousStackRank = task[stackRank] as string;
            tasks.push(task);
            if (node.children?.length) {
                this._buildChildren(node.children, task, tasks);
            }
        }
    }

    /**
     * Builds one task record from the values it carries.
     *
     * The id, the parent lookup and the stack rank are written last, so a template that happens to carry
     * a column of the same name can never decide what the task is or where it lands.
     */
    private _buildTask(values: Partial<IRawRecord>, placement: ITaskPlacement): IRawRecord {
        const taskDataProvider = this._getTaskDataProvider();
        const { parentId, stackRank, stateCode } = taskDataProvider.getNativeColumns();
        const task: IRawRecord = { ...values };
        task[taskDataProvider.getMetadata().PrimaryIdAttribute] = crypto.randomUUID();
        task[parentId] = placement.parentReference;
        task[stackRank] = StackRank.between(placement.previousStackRank, placement.nextStackRank);
        task[stateCode] ??= 0;
        return task;
    }

    /**
     * The same lookup value for a task this expansion has only just built: the grid has no record for it
     * yet, so it is read off what we wrote.
     */
    private _getNewTaskReference(task: IRawRecord): ComponentFramework.EntityReference[] {
        const taskDataProvider = this._getTaskDataProvider();
        const metadata = taskDataProvider.getMetadata();
        return [{
            id: { guid: task[metadata.PrimaryIdAttribute] as string },
            name: task[taskDataProvider.getNativeColumns().subject] as string,
            //an empty string beats `undefined` when `LogicalName` was not supplied
            etn: metadata.LogicalName ?? '',
        }];
    }

    /** Maps a template record onto the task fields the two entities share, plus the template's name. */
    private _getTaskFieldsFromTemplate(template: IRecord): Partial<IRawRecord> {
        const { templates } = this._params;
        const rawTemplate = template.getRawData();
        const fields: Partial<IRawRecord> = {};
        for (const column of templates.columns) {
            if (column.name !== templates.metadata.PrimaryIdAttribute) {
                fields[column.name] = rawTemplate[column.name];
            }
        }
        fields[this._getTaskDataProvider().getNativeColumns().subject] = template.getNamedReference().name ?? null;
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

        this._records.push(template);
        const children = this._buildTemplateNodes(task);
        if (children.length > 0) {
            this._children[templateId] = children;
        }
        this.setDataSource([...this._records]);
        return template;
    }

    /**
     * Captures a task's subtree as template nodes, depth-first, carrying over every visible column.
     *
     * The children come from the complete hierarchy, so an active quick find does not drop the subtasks it
     * hides.
     */
    private _buildTemplateNodes(task: IRecord): IMemoryTaskTemplateNode[] {
        const visibleColumns = task.getColumns().filter(column => !column.isHidden).map(column => column.name);
        const children = this._getTaskDataProvider().getRecordTree().structure.getChildren(task.getRecordId());
        return children.map(child => {
            const rawChild = child.getRawData();
            return {
                values: Object.fromEntries(visibleColumns.map(columnName => [columnName, rawChild[columnName] ?? null])),
                children: this._buildTemplateNodes(child),
            };
        });
    }

    private _getTaskDataProvider(): ITaskDataProvider {
        return this._params.services.get('taskDataProvider');
    }
}
