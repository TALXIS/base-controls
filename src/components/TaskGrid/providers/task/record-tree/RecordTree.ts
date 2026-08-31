import { IRecord, MemoryDataProvider } from "@talxis/client-libraries";
import { ITaskDataProvider } from "../TaskDataProvider";
import { patchDataBuilderPrepare } from "./patchDataBuilderPrepare";

/**
 * The hierarchy as the grid shows it: the active filter and quick find applied, flat-list mode and root
 * scoping honoured.
 *
 * Every answer here is about the view. Ask {@link IRecordStructure} when something has to be true of the
 * data instead.
 */
export interface IRecordTreeView {
    /** The children rendered under a record, in display order. Omit the argument for the top level. */
    getChildren(parentRecordId?: string | null): IRecord[];
    /** `true` when the record has at least one *visible* child — this is what draws the expander. */
    hasChildren(recordId: string): boolean;
    /**
     * The record's position among its visible siblings, or `-1` when it is not rendered. A row-store index
     * for AG Grid transactions, never a data position.
     */
    getPosition(recordId: string): number;
    /** `true` when the record itself matches the active filter and quick find. */
    isMatching(recordId: string): boolean;
    /** How many records the view can show. */
    getCount(): number;
    /** Every visible record id, in display order. */
    getOrderedIds(): string[];
    /** `true` when no visible record has visible children — the grid then renders a flat list. */
    isFlat(): boolean;
}

/**
 * The complete hierarchy: every loaded record, with the filter, the quick find, flat-list mode and root
 * scoping all ignored. A child the active view hides is still a child.
 *
 * Ask this for anything that must be true of the data — reordering, cascading a delete, checking for a
 * cycle.
 */
export interface IRecordStructure {
    /** The children of a record, in order — or the true top level when the argument is omitted. */
    getChildren(parentRecordId?: string | null): IRecord[];
    /** The parent record, or `null` at the top level. */
    getParent(recordId: string): IRecord | null;
    /** Root-to-self ids, the record itself included. The cycle guard for a move. */
    getAncestorIds(recordId: string): string[];
    /** The same chain as records, nearest ancestor last, the record itself excluded. */
    getAncestors(recordId: string): IRecord[];
    /** Every descendant, depth-first in order. */
    getDescendants(recordId: string): IRecord[];
    /** `true` when the record has a child in the data, visible or not. */
    hasChildren(recordId: string): boolean;
    /** The records sharing this record's parent, in order, the record itself excluded. */
    getSiblings(recordId: string, options?: { exclude?: string }): IRecord[];
    /**
     * The records either side of this one among its siblings. Pass `exclude` when a record is being moved,
     * so it is not ranked against the position it is leaving.
     */
    getNeighbours(recordId: string, options?: { exclude?: string }): { previous?: IRecord; next?: IRecord };
}

/** The two questions a task hierarchy answers: what the grid shows, and what is actually there. */
export interface IRecordTree {
    /** What the grid renders. */
    readonly view: IRecordTreeView;
    /** What is actually there. */
    readonly structure: IRecordStructure;
}

/** Constructor parameters for {@link RecordTree}. */
interface IRecordTreeParameters {
    taskDataProvider: ITaskDataProvider;
}

/** The filter-independent facts one build resolves. Both surfaces read from it. */
interface IHierarchyIndex {
    records: IRecord[];
    recordsMap: { [recordId: string]: IRecord };
    /** Parent id — `null` for the top level — to its children, in display order. */
    childrenByParent: Map<string | null, IRecord[]>;
    parentById: Map<string, string | null>;
    /** Root-to-self ids per record. */
    ancestorIds: Map<string, string[]>;
    /** The same chains as display names, for the path column. */
    ancestorNames: Map<string, string[]>;
    /**
     * Records no root can reach: a parent chain that loops, and anything hanging below one. Both surfaces
     * treat them as childless, so a descendant walk terminates.
     */
    unreachable: Set<string>;
}

/** What the display pass produces. */
interface IViewProjection {
    childrenByParent: Map<string | null, IRecord[]>;
    positionById: Map<string, number>;
    matchingIds: Set<string>;
    orderedIds: string[];
    count: number;
    isFlat: boolean;
}

const EMPTY_INDEX: IHierarchyIndex = {
    records: [],
    recordsMap: {},
    childrenByParent: new Map(),
    parentById: new Map(),
    ancestorIds: new Map(),
    ancestorNames: new Map(),
    unreachable: new Set(),
};

const EMPTY_PROJECTION: IViewProjection = {
    childrenByParent: new Map(),
    positionById: new Map(),
    matchingIds: new Set(),
    orderedIds: [],
    count: 0,
    isFlat: false,
};

/** Builds and serves the task hierarchy, as both a display view and the complete data structure. */
export class RecordTree implements IRecordTree {
    private _taskDataProvider: ITaskDataProvider;
    private _index: IHierarchyIndex = EMPTY_INDEX;
    private _projection: IViewProjection = EMPTY_PROJECTION;
    private _isBuilt = false;
    /** Descendant lists, resolved on demand and dropped on the next build. */
    private _descendants: Map<string, IRecord[]> = new Map();

    public readonly view: IRecordTreeView;
    public readonly structure: IRecordStructure;

    constructor(parameters: IRecordTreeParameters) {
        this._taskDataProvider = parameters.taskDataProvider;
        this.view = this._createView();
        this.structure = this._createStructure();
    }

    // ── Lifecycle: the provider drives this, consumers only read ─────────────

    /**
     * Resolves the hierarchy from the provider's current records. Called on every completed data load, and
     * after an operation that reparents or reorders.
     */
    public build(): void {
        const index = this._buildIndex();
        this._index = index;
        this._descendants.clear();
        //before the throwaway providers below: the path column has to hold its value by the time
        //anything sorts, filters or quick-finds on it
        this._patchRecordPaths(index);
        this._sortChildren(index, this._buildSortingMap(index));
        this._projection = this._project(index, this._buildMatchingIds(index));
        this._isBuilt = true;
    }

    /** `false` until the first {@link build}, so a caller can tell "nothing yet" from "nothing matches". */
    public isBuilt(): boolean {
        return this._isBuilt;
    }

    // ── The two surfaces ────────────────────────────────────────────────────

    private _createView(): IRecordTreeView {
        return {
            getChildren: (parentRecordId?: string | null) => this._projection.childrenByParent.get(parentRecordId ?? null) ?? [],
            hasChildren: (recordId: string) => (this._projection.childrenByParent.get(recordId)?.length ?? 0) > 0,
            getPosition: (recordId: string) => this._projection.positionById.get(recordId) ?? -1,
            isMatching: (recordId: string) => this._projection.matchingIds.has(recordId),
            getCount: () => this._projection.count,
            getOrderedIds: () => this._projection.orderedIds,
            isFlat: () => this._projection.isFlat,
        };
    }

    private _createStructure(): IRecordStructure {
        return {
            getChildren: (parentRecordId?: string | null) => this._getStructuralChildren(parentRecordId ?? null),
            getParent: (recordId: string) => {
                const parentId = this._index.parentById.get(recordId);
                return parentId ? this._index.recordsMap[parentId] ?? null : null;
            },
            getAncestorIds: (recordId: string) => this._index.ancestorIds.get(recordId) ?? [],
            getAncestors: (recordId: string) => (this._index.ancestorIds.get(recordId) ?? [])
                .slice(0, -1)
                .map(ancestorId => this._index.recordsMap[ancestorId])
                .filter(record => !!record),
            getDescendants: (recordId: string) => this._getDescendants(recordId),
            hasChildren: (recordId: string) => this._getStructuralChildren(recordId).length > 0,
            getSiblings: (recordId: string, options?: { exclude?: string }) => this._getSiblings(recordId, options)
                .filter(record => record.getRecordId() !== recordId),
            getNeighbours: (recordId: string, options?: { exclude?: string }) => {
                const siblings = this._getSiblings(recordId, options);
                const position = siblings.findIndex(record => record.getRecordId() === recordId);
                if (position < 0) {
                    return {};
                }
                return { previous: siblings[position - 1], next: siblings[position + 1] };
            },
        };
    }

    private _getStructuralChildren(parentRecordId: string | null): IRecord[] {
        if (parentRecordId && this._index.unreachable.has(parentRecordId)) {
            return [];
        }
        return this._index.childrenByParent.get(parentRecordId) ?? [];
    }

    private _getSiblings(recordId: string, options?: { exclude?: string }): IRecord[] {
        const siblings = this._getStructuralChildren(this._index.parentById.get(recordId) ?? null);
        if (!options?.exclude || options.exclude === recordId) {
            return siblings;
        }
        return siblings.filter(record => record.getRecordId() !== options.exclude);
    }

    private _getDescendants(recordId: string): IRecord[] {
        const cached = this._descendants.get(recordId);
        if (cached) {
            return cached;
        }
        const descendants: IRecord[] = [];
        for (const child of this._getStructuralChildren(recordId)) {
            descendants.push(child, ...this._getDescendants(child.getRecordId()));
        }
        this._descendants.set(recordId, descendants);
        return descendants;
    }

    // ── The index ───────────────────────────────────────────────────────────

    private _buildIndex(): IHierarchyIndex {
        //copied: `getAllRecords` hands back the provider's own records array, and the index is sorted into
        //display order below - which on the original would silently reorder the provider's records as a
        //side effect of building the tree
        const records = [...this._getTaskDataProvider().getAllRecords()];
        const recordsMap = this._getTaskDataProvider().getRecordsMap();
        const parentIdColumn = this._getNativeColumns().parentId;

        const childrenByParent = new Map<string | null, IRecord[]>([[null, []]]);
        const parentById = new Map<string, string | null>();

        for (const record of records) {
            const parentId = record.getValue(parentIdColumn)?.[0]?.id?.guid;
            //a parent that is not loaded cannot be a parent: the record shows at the top level instead
            const resolvedParentId = parentId && recordsMap[parentId] ? parentId : null;
            parentById.set(record.getRecordId(), resolvedParentId);
            const siblings = childrenByParent.get(resolvedParentId);
            if (siblings) {
                siblings.push(record);
            }
            else {
                childrenByParent.set(resolvedParentId, [record]);
            }
        }

        const { ancestorIds, ancestorNames } = this._buildAncestors(records, recordsMap, parentById);
        return {
            records,
            recordsMap,
            childrenByParent,
            parentById,
            ancestorIds,
            ancestorNames,
            unreachable: this._findUnreachable(records, childrenByParent),
        };
    }

    /** Root-to-self ids and names per record, in one pass reusing the chains already resolved. */
    private _buildAncestors(
        records: IRecord[],
        recordsMap: { [recordId: string]: IRecord },
        parentById: Map<string, string | null>,
    ): { ancestorIds: Map<string, string[]>; ancestorNames: Map<string, string[]> } {
        const ancestorIds = new Map<string, string[]>();
        const ancestorNames = new Map<string, string[]>();

        for (const record of records) {
            const recordId = record.getRecordId();
            if (ancestorIds.has(recordId)) {
                continue;
            }
            const ids: string[] = [];
            const names: string[] = [];
            const visited = new Set<string>();
            let current: IRecord | null = record;
            let resolvedIds: string[] | undefined;
            let resolvedNames: string[] | undefined;

            while (current) {
                const currentId: string = current.getRecordId();
                if (visited.has(currentId)) {
                    break;
                }
                visited.add(currentId);
                if (currentId !== recordId) {
                    resolvedIds = ancestorIds.get(currentId);
                    if (resolvedIds) {
                        resolvedNames = ancestorNames.get(currentId);
                        break;
                    }
                }
                ids.unshift(currentId);
                names.unshift(current.getNamedReference().name);
                const parentId: string | null = parentById.get(currentId) ?? null;
                current = parentId ? recordsMap[parentId] ?? null : null;
            }

            ancestorIds.set(recordId, resolvedIds ? [...resolvedIds, ...ids] : ids);
            ancestorNames.set(recordId, resolvedNames ? [...resolvedNames, ...names] : names);
        }
        return { ancestorIds, ancestorNames };
    }

    /** The records no root reaches: a parent chain that loops, plus everything hanging below one. */
    private _findUnreachable(records: IRecord[], childrenByParent: Map<string | null, IRecord[]>): Set<string> {
        const reachable = new Set<string>();
        const queue = [...(childrenByParent.get(null) ?? [])];
        while (queue.length > 0) {
            const record = queue.pop()!;
            const recordId = record.getRecordId();
            if (reachable.has(recordId)) {
                continue;
            }
            reachable.add(recordId);
            queue.push(...(childrenByParent.get(recordId) ?? []));
        }

        const unreachable = new Set<string>();
        for (const record of records) {
            if (!reachable.has(record.getRecordId())) {
                unreachable.add(record.getRecordId());
            }
        }
        if (unreachable.size > 0) {
            console.warn(`Circular reference detected: ${unreachable.size} record(s) have a parent chain that loops back on itself, so no row can display them. Ids: ${[...unreachable].slice(0, 10).join(', ')}${unreachable.size > 10 ? ', …' : ''}`);
        }
        return unreachable;
    }

    private _sortChildren(index: IHierarchyIndex, sortingMap: { [recordId: string]: number }): void {
        const byDisplayOrder = (a: IRecord, b: IRecord): number => {
            const indexA = sortingMap[a.getRecordId()] ?? Number.MAX_SAFE_INTEGER;
            const indexB = sortingMap[b.getRecordId()] ?? Number.MAX_SAFE_INTEGER;
            return indexA - indexB;
        };
        for (const [, children] of index.childrenByParent) {
            children.sort(byDisplayOrder);
        }
        index.records.sort(byDisplayOrder);
    }

    // ── The display projection ──────────────────────────────────────────────

    private _project(index: IHierarchyIndex, matchingIds: Set<string>): IViewProjection {
        const { records, childrenByParent, unreachable } = index;
        const provider = this._getTaskDataProvider();

        //a branch is kept when it, or anything under it, matches - otherwise a matching child would be
        //unreachable in the rendered tree
        const hasMatchingDescendant = new Map<string, boolean>();
        const resolveHasMatchingDescendant = (recordId: string): boolean => {
            const resolved = hasMatchingDescendant.get(recordId);
            if (resolved !== undefined) {
                return resolved;
            }
            if (matchingIds.has(recordId)) {
                hasMatchingDescendant.set(recordId, true);
                return true;
            }
            hasMatchingDescendant.set(recordId, false);
            const matches = unreachable.has(recordId)
                ? false
                : (childrenByParent.get(recordId) ?? []).some(child => resolveHasMatchingDescendant(child.getRecordId()));
            hasMatchingDescendant.set(recordId, matches);
            return matches;
        };

        const visibleChildrenByParent = new Map<string | null, IRecord[]>();
        const positionById = new Map<string, number>();
        for (const [parentId, children] of childrenByParent) {
            const visible = children.filter(child => resolveHasMatchingDescendant(child.getRecordId()));
            visibleChildrenByParent.set(parentId, visible);
            //the position of a rendered row among its rendered siblings, taken as we go rather than looked
            //up per record afterwards
            visible.forEach((child, position) => positionById.set(child.getRecordId(), position));
        }

        const topLevel = visibleChildrenByParent.get(null) ?? [];
        const isFlat = topLevel.every(record => (visibleChildrenByParent.get(record.getRecordId())?.length ?? 0) === 0);
        const rootTaskId = provider.getRootTaskId();
        const isFlatListEnabled = provider.isFlatListEnabled();

        //the rows the grid lists under its virtual root, which is where flat-list mode and root scoping
        //apply. Kept as its own entry: the scoped record keeps its own, truthful children
        const scopedRecords = rootTaskId
            ? this._collectVisibleDescendants(rootTaskId, visibleChildrenByParent)
            //a record in a cycle is unreachable from any root, so no row can show it - counting it is what
            //leaves select-all unable to complete
            : records.filter(record => !unreachable.has(record.getRecordId())
                && resolveHasMatchingDescendant(record.getRecordId()));
        const rootChildren = isFlatListEnabled
            ? scopedRecords.filter(record => matchingIds.has(record.getRecordId()))
            : rootTaskId
                ? visibleChildrenByParent.get(rootTaskId) ?? []
                : topLevel;
        const listedRecords = isFlatListEnabled ? rootChildren : scopedRecords;

        visibleChildrenByParent.set(null, rootChildren);
        if (isFlatListEnabled) {
            rootChildren.forEach((record, position) => positionById.set(record.getRecordId(), position));
        }

        return {
            childrenByParent: visibleChildrenByParent,
            positionById,
            matchingIds,
            orderedIds: listedRecords.map(record => record.getRecordId()),
            count: listedRecords.length,
            isFlat,
        };
    }

    private _collectVisibleDescendants(recordId: string, visibleChildrenByParent: Map<string | null, IRecord[]>): IRecord[] {
        const descendants: IRecord[] = [];
        for (const child of visibleChildrenByParent.get(recordId) ?? []) {
            descendants.push(child, ...this._collectVisibleDescendants(child.getRecordId(), visibleChildrenByParent));
        }
        return descendants;
    }

    // ── The throwaway providers ─────────────────────────────────────────────

    /** Which records match the active filter and quick find. Skipped entirely when nothing filters. */
    private _buildMatchingIds(index: IHierarchyIndex): Set<string> {
        const taskDataProvider = this._getTaskDataProvider();
        const filtering = taskDataProvider.getFiltering();
        //`conditions.length` is load-bearing: turning "hide inactive" off leaves an empty expression behind
        const nothingFilters = (!filtering || filtering.conditions.length === 0) && !taskDataProvider.getSearchQuery();
        if (nothingFilters) {
            return new Set(index.records.map(record => record.getRecordId()));
        }
        const provider = this._createBaseProvider(index.records);
        provider.onGetQuickFindColumns = () => taskDataProvider.getQuickFindColumns();
        //membership is all this answers, so the sort is pure waste - DataBuilder skips an empty one
        provider.setSorting([]);
        provider.setFiltering(filtering);
        provider.setSearchQuery(taskDataProvider.getSearchQuery());
        provider.refreshSync();
        return new Set(Object.keys(provider.getRecordsMap()));
    }

    /** Record id to its position in the provider's own sort order. */
    private _buildSortingMap(index: IHierarchyIndex): { [recordId: string]: number } {
        const sortingMap: { [recordId: string]: number } = {};
        let position = -1;
        const provider = this._createBaseProvider(index.records);
        provider.addEventListener('onRecordLoaded', (record) => {
            sortingMap[record.getRecordId()] = ++position;
        });
        provider.refreshSync();
        return sortingMap;
    }

    private _createBaseProvider(records: IRecord[]): MemoryDataProvider {
        const taskDataProvider = this._getTaskDataProvider();
        const provider = new MemoryDataProvider({
            dataSource: taskDataProvider.getDataSource(),
            metadata: taskDataProvider.getMetadata()
        });
        patchDataBuilderPrepare({ provider, records });
        provider.getPaging().setPageSize(taskDataProvider.getDataSource().length);
        provider.setSorting(taskDataProvider.getSorting());
        provider.setColumns(taskDataProvider.getColumns());
        return provider;
    }

    /** Writes each record's ancestor names onto the virtual path column, reusing the resolved chains. */
    private _patchRecordPaths(index: IHierarchyIndex): void {
        const pathColumn = this._getNativeColumns().path;
        if (!this._getTaskDataProvider().getColumnsMap()[pathColumn]) {
            return;
        }
        for (const record of index.records) {
            const field = record.getField(pathColumn);
            const pathString = (index.ancestorNames.get(record.getRecordId()) ?? []).join('/');
            //@ts-ignore
            field._originalValue = pathString;
            //@ts-ignore
            field._currentValue = pathString;
        }
    }

    private _getNativeColumns(): ReturnType<ITaskDataProvider['getNativeColumns']> {
        return this._getTaskDataProvider().getNativeColumns();
    }

    private _getTaskDataProvider(): ITaskDataProvider {
        const provider = this._taskDataProvider;
        if (!provider) {
            throw new Error('TaskDataProvider dependency not provided!');
        }
        return provider;
    }
}
