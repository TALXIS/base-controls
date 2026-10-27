import { IRecord, MemoryDataProvider } from "@talxis/client-libraries";
import { StackRank } from "@utils/stack-rank";
import type { ITaskColumnMatcher, ITaskDataProvider } from "../interfaces";
import { patchDataBuilderPrepare } from "./patchDataBuilderPrepare";

/** The column a task's ancestor names are written to, when a view has it. */
export const PATH_COLUMN_NAME = 'path__virtual';

/** The tree as the grid shows it: filter, quick find and root scoping applied. */
export interface IRecordTreeView {
    /** The children drawn under a record, in order; the top level without an argument. */
    getChildren(parentRecordId?: string | null): IRecord[];
    /** Whether the record has a child the view shows. */
    hasChildren(recordId: string): boolean;
    /** The record's ancestors the view shows and the record itself, from the top. */
    getPath(recordId: string): string[];
    /** Whether the record itself matches the filter and quick find, or is a task created since the view loaded. */
    isMatching(recordId: string): boolean;
    getCount(): number;
    /** Every record the view shows, in the order it shows them. */
    getOrderedIds(): string[];
}

/** The whole tree, ignoring what the view hides. */
export interface IRecordStructure {
    /** The children of a record, in order; the top level without an argument. */
    getChildren(parentRecordId?: string | null): IRecord[];
    getParent(recordId: string): IRecord | null;
    /** The ids from the top down to the record itself. */
    getAncestorIds(recordId: string): string[];
    /** Every descendant, depth first, in order. */
    getDescendants(recordId: string): IRecord[];
    hasChildren(recordId: string): boolean;
    /** The records either side of this one among its siblings, leaving `exclude` out. */
    getNeighbours(recordId: string, options?: { exclude?: string }): { previous?: IRecord; next?: IRecord };
}

/** What the grid shows, and what is actually there. */
export interface IRecordTree {
    readonly view: IRecordTreeView;
    readonly structure: IRecordStructure;
}

interface IHierarchyIndex {
    records: IRecord[];
    recordsMap: { [recordId: string]: IRecord };
    childrenByParent: Map<string | null, IRecord[]>;
    parentById: Map<string, string | null>;
    ancestorIds: Map<string, string[]>;
    ancestorNames: Map<string, string[]>;
    //records in a parent chain that loops, which no row can show
    unreachable: Set<string>;
}

interface IViewProjection {
    childrenByParent: Map<string | null, IRecord[]>;
    matchingIds: Set<string>;
    orderedIds: string[];
}

const OR_OPERATOR = 1;

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
    matchingIds: new Set(),
    orderedIds: [],
};

export class RecordTree implements IRecordTree {
    private _provider: ITaskDataProvider;
    private _getColumnMatcher: (columnName: string) => ITaskColumnMatcher | undefined;
    private _index: IHierarchyIndex = EMPTY_INDEX;
    private _projection: IViewProjection = EMPTY_PROJECTION;
    private _isBuilt = false;
    private _descendants: Map<string, IRecord[]> = new Map();

    public readonly view: IRecordTreeView;
    public readonly structure: IRecordStructure;

    constructor(provider: ITaskDataProvider, getColumnMatcher: (columnName: string) => ITaskColumnMatcher | undefined) {
        this._provider = provider;
        this._getColumnMatcher = getColumnMatcher;
        this.view = this._createView();
        this.structure = this._createStructure();
    }

    /** Resolves the tree from the provider's records. */
    public build(): void {
        const index = this._buildIndex();
        this._index = index;
        this._descendants.clear();
        //before the sort and the filter below, which may read the path
        this._patchRecordPaths(index);
        const matchingIds = this._buildMatchingIds(index);
        //a new task stays shown whatever the filter
        index.records.map(record => record.getRecordId()).filter(recordId => this._provider.getNewTaskPosition(recordId)).forEach(recordId => matchingIds.add(recordId));
        this._projection = this._project({ ...index, ...this._sortForDisplay(index, this._buildSortingMap(index)) }, matchingIds);
        this._isBuilt = true;
    }

    public isBuilt(): boolean {
        return this._isBuilt;
    }

    private _createView(): IRecordTreeView {
        return {
            getChildren: parentRecordId => this._projection.childrenByParent.get(parentRecordId ?? null) ?? [],
            hasChildren: recordId => (this._projection.childrenByParent.get(recordId)?.length ?? 0) > 0,
            getPath: recordId => this._getPath(recordId),
            isMatching: recordId => this._projection.matchingIds.has(recordId),
            getCount: () => this._projection.orderedIds.length,
            getOrderedIds: () => this._projection.orderedIds,
        };
    }

    private _createStructure(): IRecordStructure {
        return {
            getChildren: parentRecordId => this._getStructuralChildren(parentRecordId ?? null),
            getParent: recordId => {
                const parentId = this._index.parentById.get(recordId);
                return parentId ? this._index.recordsMap[parentId] ?? null : null;
            },
            getAncestorIds: recordId => this._index.ancestorIds.get(recordId) ?? [],
            getDescendants: recordId => this._getDescendants(recordId),
            hasChildren: recordId => this._getStructuralChildren(recordId).length > 0,
            getNeighbours: (recordId, options) => {
                const siblings = this._getStructuralChildren(this._index.parentById.get(recordId) ?? null)
                    .filter(record => record.getRecordId() === recordId || record.getRecordId() !== options?.exclude);
                const position = siblings.findIndex(record => record.getRecordId() === recordId);
                return position < 0 ? {} : { previous: siblings[position - 1], next: siblings[position + 1] };
            },
        };
    }

    private _getPath(recordId: string): string[] {
        const ancestorIds = this._index.ancestorIds.get(recordId) ?? [recordId];
        const rootTaskId = this._provider.getRootTaskId();
        return rootTaskId ? ancestorIds.slice(ancestorIds.indexOf(rootTaskId) + 1) : ancestorIds;
    }

    private _getStructuralChildren(parentRecordId: string | null): IRecord[] {
        if (parentRecordId && this._index.unreachable.has(parentRecordId)) {
            return [];
        }
        return this._index.childrenByParent.get(parentRecordId) ?? [];
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

    private _buildIndex(): IHierarchyIndex {
        const stackRank = this._provider.getFieldMapping().stackRank;
        //a copy in stack order, as the provider's own array must keep its order
        const records = [...this._provider.getAllRecords()].sort((a, b) => StackRank.compare(a.getValue(stackRank), b.getValue(stackRank)));
        const recordsMap = this._provider.getRecordsMap();
        const parentIdColumn = this._provider.getFieldMapping().parentId;
        const childrenByParent = new Map<string | null, IRecord[]>([[null, []]]);
        const parentById = new Map<string, string | null>();

        for (const record of records) {
            const parentId = record.getValue(parentIdColumn)?.[0]?.id?.guid;
            //a parent that is not loaded shows its child at the top level
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

    private _buildAncestors(records: IRecord[], recordsMap: { [recordId: string]: IRecord }, parentById: Map<string, string | null>) {
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
        const unreachable = new Set(records.map(record => record.getRecordId()).filter(recordId => !reachable.has(recordId)));
        if (unreachable.size > 0) {
            console.warn(`${unreachable.size} task(s) have a parent chain that loops, so no row can show them: ${[...unreachable].slice(0, 10).join(', ')}`);
        }
        return unreachable;
    }

    //copies, as the structure keeps the stack order whatever the view sorts by
    private _sortForDisplay(index: IHierarchyIndex, sortingMap: { [recordId: string]: number }): Pick<IHierarchyIndex, 'records' | 'childrenByParent'> {
        //a new task stays at the end it asked for, in stack order among the other new tasks there
        const getGroup = (record: IRecord): number => {
            const position = this._provider.getNewTaskPosition(record.getRecordId());
            return position === 'first' ? 0 : position === 'last' ? 2 : 1;
        };
        const byDisplayOrder = (a: IRecord, b: IRecord): number => {
            const group = getGroup(a);
            return (group - getGroup(b)) || (group === 1 ? (sortingMap[a.getRecordId()] ?? Number.MAX_SAFE_INTEGER) - (sortingMap[b.getRecordId()] ?? Number.MAX_SAFE_INTEGER) : 0);
        };
        const childrenByParent = new Map([...index.childrenByParent].map(([parentId, children]) => [parentId, [...children].sort(byDisplayOrder)]));
        return { records: [...index.records].sort(byDisplayOrder), childrenByParent };
    }

    private _project(index: IHierarchyIndex, matchingIds: Set<string>): IViewProjection {
        const { records, childrenByParent, unreachable } = index;

        //a branch stays while it or anything under it matches
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
            const matches = !unreachable.has(recordId)
                && (childrenByParent.get(recordId) ?? []).some(child => resolveHasMatchingDescendant(child.getRecordId()));
            hasMatchingDescendant.set(recordId, matches);
            return matches;
        };

        const visibleChildrenByParent = new Map<string | null, IRecord[]>();
        for (const [parentId, children] of childrenByParent) {
            visibleChildrenByParent.set(parentId, children.filter(child => resolveHasMatchingDescendant(child.getRecordId())));
        }

        const rootTaskId = this._provider.getRootTaskId();
        const scopedRecords = rootTaskId
            ? this._collectVisibleDescendants(rootTaskId, visibleChildrenByParent)
            : records.filter(record => !unreachable.has(record.getRecordId()) && resolveHasMatchingDescendant(record.getRecordId()));
        visibleChildrenByParent.set(null, visibleChildrenByParent.get(rootTaskId ?? null) ?? []);

        return {
            childrenByParent: visibleChildrenByParent,
            matchingIds,
            orderedIds: scopedRecords.map(record => record.getRecordId()),
        };
    }

    private _collectVisibleDescendants(recordId: string, visibleChildrenByParent: Map<string | null, IRecord[]>): IRecord[] {
        const descendants: IRecord[] = [];
        for (const child of visibleChildrenByParent.get(recordId) ?? []) {
            descendants.push(child, ...this._collectVisibleDescendants(child.getRecordId(), visibleChildrenByParent));
        }
        return descendants;
    }

    //the column matchers answer for their columns, the memory provider for the rest
    private _buildMatchingIds(index: IHierarchyIndex): Set<string> {
        const conditionMatchingIds = this._getConditionMatchingIds(index.records);
        const searchMatchingIds = this._getSearchMatchingIds(index.records);
        return new Set(index.records.map(record => record.getRecordId()).filter(recordId => conditionMatchingIds.has(recordId) && searchMatchingIds.has(recordId)));
    }

    private _getConditionMatchingIds(records: IRecord[]): Set<string> {
        const filtering = this._provider.getFiltering();
        //turning "hide inactive" off leaves an empty expression behind
        if (!filtering || filtering.conditions.length === 0) {
            return new Set(records.map(record => record.getRecordId()));
        }
        const handled = filtering.conditions.filter(condition => this._getColumnMatcher(condition.attributeName));
        const native = filtering.conditions.filter(condition => !handled.includes(condition));
        const isOr = filtering.filterOperator === OR_OPERATOR;
        const nativeMatchingIds = native.length > 0 ? this._filterNatively(records, provider => provider.setFiltering({ ...filtering, conditions: native, filters: [] })) : new Set(isOr ? [] : records.map(record => record.getRecordId()));
        const isHandledMatching = (record: IRecord, condition: ComponentFramework.PropertyHelper.DataSetApi.ConditionExpression) => this._getColumnMatcher(condition.attributeName)!.isMatchingCondition(record, condition);
        return new Set(records.filter(record => isOr
            ? nativeMatchingIds.has(record.getRecordId()) || handled.some(condition => isHandledMatching(record, condition))
            : nativeMatchingIds.has(record.getRecordId()) && handled.every(condition => isHandledMatching(record, condition))
        ).map(record => record.getRecordId()));
    }

    private _getSearchMatchingIds(records: IRecord[]): Set<string> {
        const searchQuery = this._provider.getSearchQuery();
        if (!searchQuery) {
            return new Set(records.map(record => record.getRecordId()));
        }
        const columns = this._provider.getQuickFindColumns();
        const handled = columns.filter(column => this._getColumnMatcher(column.name));
        const native = columns.filter(column => !handled.includes(column));
        const nativeMatchingIds = native.length > 0 ? this._filterNatively(records, provider => {
            provider.onGetQuickFindColumns = () => native;
            provider.setSearchQuery(searchQuery);
        }) : new Set<string>();
        return new Set(records.filter(record => nativeMatchingIds.has(record.getRecordId())
            || handled.some(column => this._getColumnMatcher(column.name)!.isMatchingSearch(record, column.name, searchQuery))
        ).map(record => record.getRecordId()));
    }

    private _filterNatively(records: IRecord[], setUp: (provider: MemoryDataProvider) => void): Set<string> {
        const provider = this._createBaseProvider(records);
        provider.setSorting([]);
        setUp(provider);
        provider.refreshSync();
        return new Set(Object.keys(provider.getRecordsMap()));
    }

    private _buildSortingMap(index: IHierarchyIndex): { [recordId: string]: number } {
        const sortingMap: { [recordId: string]: number } = {};
        let position = -1;
        const provider = this._createBaseProvider(index.records);
        provider.addEventListener('onRecordLoaded', record => {
            sortingMap[record.getRecordId()] = ++position;
        });
        provider.refreshSync();
        return sortingMap;
    }

    private _createBaseProvider(records: IRecord[]): MemoryDataProvider {
        const sorting = this._provider.getSorting();
        const provider = new MemoryDataProvider({
            dataSource: this._provider.getDataSource(),
            metadata: this._provider.getMetadata(),
        });
        patchDataBuilderPrepare({ provider, records });
        provider.getPaging().setPageSize(this._provider.getDataSource().length);
        //siblings keep their own order unless the view sorts by something else
        provider.setSorting(sorting.length > 0 ? sorting : [{ name: this._provider.getFieldMapping().stackRank, sortDirection: 0 }]);
        provider.setColumns(this._provider.getColumns());
        return provider;
    }

    private _patchRecordPaths(index: IHierarchyIndex): void {
        if (!this._provider.getColumnsMap()[PATH_COLUMN_NAME]) {
            return;
        }
        for (const record of index.records) {
            const field: any = record.getField(PATH_COLUMN_NAME);
            const path = (index.ancestorNames.get(record.getRecordId()) ?? []).join('/');
            field._originalValue = path;
            field._currentValue = path;
        }
    }
}
