import { IRawRecord, IRecord, MemoryDataProvider } from "@talxis/client-libraries";
import { ITaskDataProvider, TemplateDataProviderBase } from "@components/TaskGrid/providers";
import { IRecordTree } from "@components/TaskGrid/providers/task/record-tree";
import { IMemoryTaskTemplateNode, IMemoryTemplateSource } from "./interfaces";

/** Constructor parameters for {@link MemoryTemplateDataProvider}. */
export interface IMemoryTemplateDataProviderParams {
    /**
     * The template entity plus the child hierarchy each template expands into.
     *
     * **`records` is written into.** Creating a template pushes into that array — the same way the
     * memory task strategy writes tasks — which is how templates outlive the grid's remounts.
     */
    templates: IMemoryTemplateSource;
}

/** The task-side data a single capture reads, resolved once from the task's own data provider. */
interface ITemplateCaptureContext {
    recordTree: IRecordTree;
    /** Non-hidden task column names. */
    visibleColumns: string[];
}

/**
 * {@link ITemplateDataProvider} implementation backed entirely by in-memory records.
 *
 * Lists the templates the picker offers and captures new ones from a task, without any server or
 * Dataverse dependency. Intended for local development, tests, Storybook and demos.
 *
 * Normally created by {@link MemoryTaskGridDescriptor}; construct it directly when you supply your
 * own descriptor, or subclass it to override the capture logic.
 */
export class MemoryTemplateDataProvider extends TemplateDataProviderBase(MemoryDataProvider) {
    private _params: IMemoryTemplateDataProviderParams;

    /** @param params — see {@link IMemoryTemplateDataProviderParams}. */
    constructor(params: IMemoryTemplateDataProviderParams) {
        super({
            //a copy of the array holding the same records: MemoryDataProvider swaps its internal
            //array on delete, so it must not be handed the one we persist
            dataSource: [...params.templates.records],
            metadata: params.templates.metadata,
        });
        this.setColumns(params.templates.columns);
        this._params = params;
    }

    // ── Template source ──────────────────────────────────────────────────────

    /** The child task hierarchy the template expands into, empty when it is a single task. */
    public getTemplateChildren(templateId: string): IMemoryTaskTemplateNode[] {
        return this._params.templates.children?.[templateId] ?? [];
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
        const children = this._buildTemplateNodes(task, this._getCaptureContext(task));
        if (children.length > 0) {
            templates.children ??= {};
            templates.children[templateId] = children;
        }
        //already written - this only re-points an open picker at the updated list
        this.setDataSource([...templates.records]);
        return template;
    }

    /**
     * Captures a task's subtree as template nodes, depth-first, in display order. Every visible column
     * is carried over, so whatever the user can see on a task is what the template reproduces.
     *
     * The children come from the complete hierarchy rather than the rendered one: a template is data, and
     * capturing one while a quick find is active should not quietly drop the subtasks it hides.
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

    /**
     * Everything the capture needs, taken off the task itself: the hierarchy of the grid it belongs
     * to, so the children keep the displayed order, and its non-hidden columns — what the user can see
     * is what a template reproduces.
     */
    private _getCaptureContext(task: IRecord): ITemplateCaptureContext {
        return {
            recordTree: (task.getDataProvider() as ITaskDataProvider).getRecordTree(),
            visibleColumns: task.getColumns().filter(column => !column.isHidden).map(column => column.name),
        };
    }
}
