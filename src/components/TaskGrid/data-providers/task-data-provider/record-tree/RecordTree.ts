import { IRecord, MemoryDataProvider } from "@talxis/client-libraries";
import { ITaskDataProvider } from "../TaskDataProvider";
import { patchDataBuilderPrepare } from "./patchDataBuilderPrepare";

interface ITreeNode {
    directChildren: IRecord[];
    allChildren: IRecord[];
    pathIds: string[];
    pathStrings: string[];
    index: number;
    parent?: IRecord;
}

interface IRecordTreeParameters {
    taskDataProvider: ITaskDataProvider;
}

export interface IRecordTree {
    build(): Map<string, ITreeNode>
    getNodeMap(): Map<string, ITreeNode>;
    getNode(recordId: string | null): ITreeNode;
    getTotalCount(): number;
    isFlat(): boolean;
    hasChildren(recordId: string): boolean;
    getMatchingRecords(): { [recordId: string]: IRecord };
    getSortedIds(): string[];
}

export class RecordTree implements IRecordTree {
    private _nodeMap: Map<string, ITreeNode> = new Map();
    private _sortingMap: { [recordId: string]: number } = {};
    private _matchingRecordsMap: { [recordId: string]: IRecord } = {};
    private _isFlat: boolean = false;
    private _totalUniqueRecords: number = 0;
    private _sortedRecordIds: string[] = [];
    private _records: IRecord[] = [];
    private _recordsMap: { [recordId: string]: IRecord } = {};
    private _taskDataProvider: ITaskDataProvider;

    constructor(parameters: IRecordTreeParameters) {
        this._taskDataProvider = parameters.taskDataProvider;
    }

    public getNodeMap(): Map<string, ITreeNode> {
        return this._nodeMap;
    }
    public getTotalCount(): number {
        return this._totalUniqueRecords;
    }
    public isFlat(): boolean {
        return this._isFlat;
    }
    public getMatchingRecords(): { [recordId: string]: IRecord } {
        return this._matchingRecordsMap;
    }
    public getNode(recordId: string | null): ITreeNode {
        return this._nodeMap.get(recordId as any)!;
    }

    public hasChildren(recordId: string): boolean {
        const children = this._nodeMap.get(recordId)?.directChildren;
        if (children && children.length > 0) {
            return true;
        }
        return false;
    }

    public getSortedIds(): string[] {
        return this._sortedRecordIds;
    }

    public build(): Map<string, ITreeNode> {
        this._records = this._taskDataProvider.getAllRecords();
        this._recordsMap = this._taskDataProvider.getRecordsMap();
        // Clear existing record tree map and flat sorted array
        this._nodeMap.clear();
        this._patchRecordPaths();
        this._buildSortingMap();
        this._buildMatchingRecords();

        // Create reusable sort function
        const sortByIndex = (a: IRecord, b: IRecord): number => {
            const indexA = this._sortingMap[a.getRecordId()] ?? Number.MAX_SAFE_INTEGER;
            const indexB = this._sortingMap[b.getRecordId()] ?? Number.MAX_SAFE_INTEGER;
            return indexA - indexB;
        };

        const records = this._records;
        const recordsMap = this._recordsMap;

        const parentToDirectChildren = new Map<string, IRecord[]>();
        const topLevelRecords: IRecord[] = [];

        for (const record of records) {
            const parentRef = record.getValue(this._getNativeColumns().parentId);
            const parentId = parentRef?.[0]?.id?.guid;

            if (parentId && recordsMap[parentId]) {
                if (!parentToDirectChildren.has(parentId)) {
                    parentToDirectChildren.set(parentId, []);
                }
                parentToDirectChildren.get(parentId)!.push(record);
            }
            else {
                topLevelRecords.push(record);
            }
        }

        topLevelRecords.sort(sortByIndex);
        for (const [, children] of parentToDirectChildren) {
            children.sort(sortByIndex);
        }

        const hasMatchingDescendantCache = new Map<string, boolean>();
        const calculateHasMatchingDescendant = (recordId: string): boolean => {
            if (hasMatchingDescendantCache.has(recordId)) {
                return hasMatchingDescendantCache.get(recordId)!;
            }

            if (this._matchingRecordsMap[recordId]) {
                hasMatchingDescendantCache.set(recordId, true);
                return true;
            }

            // Set false sentinel before recursing to break circular reference cycles
            hasMatchingDescendantCache.set(recordId, false);
            const directChildren = parentToDirectChildren.get(recordId) || [];
            const hasMatching = directChildren.some(child =>
                calculateHasMatchingDescendant(child.getRecordId())
            );

            hasMatchingDescendantCache.set(recordId, hasMatching);
            return hasMatching;
        };

        for (const record of records) {
            calculateHasMatchingDescendant(record.getRecordId());
        }

        const recordToAllChildren = new Map<string, IRecord[]>();
        const recordToFilteredDirectChildren = new Map<string, IRecord[]>();
        const inProgressChildren = new Set<string>();

        const getAllChildren = (recordId: string): IRecord[] => {
            if (recordToAllChildren.has(recordId)) {
                return recordToAllChildren.get(recordId)!;
            }

            // Break circular reference cycles
            if (inProgressChildren.has(recordId)) {
                console.warn(`Circular reference detected: record "${recordsMap[recordId]?.getNamedReference().name}" (${recordId}) was encountered twice during tree traversal. All records involved in this cycle and their descendants will be missing from the tree.`);
                return [];
            }
            inProgressChildren.add(recordId);

            const directChildren = parentToDirectChildren.get(recordId) || [];
            const allChildren: IRecord[] = [];

            const filteredDirectChildren: IRecord[] = [];

            for (const child of directChildren) {
                if (hasMatchingDescendantCache.get(child.getRecordId())) {
                    filteredDirectChildren.push(child);
                    allChildren.push(child);
                    allChildren.push(...getAllChildren(child.getRecordId()));
                }
            }

            recordToFilteredDirectChildren.set(recordId, filteredDirectChildren);
            recordToAllChildren.set(recordId, allChildren);
            inProgressChildren.delete(recordId);
            return allChildren;
        };

        const filteredTopLevelRecords: IRecord[] = [];
        const allRecordsWithMatching: IRecord[] = [];

        for (const record of topLevelRecords) {
            if (hasMatchingDescendantCache.get(record.getRecordId())) {
                filteredTopLevelRecords.push(record);
            }
        }

        for (const record of records) {
            if (hasMatchingDescendantCache.get(record.getRecordId())) {
                allRecordsWithMatching.push(record);
            }
            getAllChildren(record.getRecordId());
        }

        allRecordsWithMatching.sort(sortByIndex);
        
        for (const record of records) {
            const recordId = record.getRecordId();
            const isTopLevel = !record.getValue(this._getNativeColumns().parentId);

            const allChildren = getAllChildren(recordId);
            const filteredDirectChildren = recordToFilteredDirectChildren.get(recordId) || [];

            let parentRecord: IRecord | undefined = undefined;

            let index = -1;

            if (!isTopLevel) {
                const parentRef = record.getValue(this._getNativeColumns().parentId);
                const parentId = parentRef?.[0]?.id?.guid;
                if (parentId) {
                    parentRecord = recordsMap[parentId];
                    const parentFilteredChildren = recordToFilteredDirectChildren.get(parentId) || [];
                    index = parentFilteredChildren.findIndex(sibling => sibling.getRecordId() === recordId);
                }
            } else {
                index = filteredTopLevelRecords.findIndex(topRecord => topRecord.getRecordId() === recordId);
            }

            let pathIds: string[] = [];
            let pathStrings: string[] = [];
            const pathCache = new Map<string, { pathIds: string[], pathStrings: string[] }>();
            if (pathCache.has(recordId)) {
                const cached = pathCache.get(recordId)!;
                pathIds = cached.pathIds;
                pathStrings = cached.pathStrings;
            }
            else {
                const pathIdParts: string[] = [];
                const pathStringParts: string[] = [];
                let currentRecord: IRecord | null = record;
                const visited = new Set<string>();

                while (currentRecord) {
                    const currentId = currentRecord.getRecordId();
                    if (visited.has(currentId)) break;
                    visited.add(currentId);

                    pathIdParts.unshift(currentRecord.getRecordId());
                    pathStringParts.unshift(currentRecord.getNamedReference().name);
                    const parentRef: ComponentFramework.EntityReference[] = currentRecord.getValue(this._getNativeColumns().parentId);
                    const parentId = parentRef?.[0]?.id?.guid;
                    currentRecord = parentId ? recordsMap[parentId] : null;
                }

                pathIds = pathIdParts;
                pathStrings = pathStringParts;
                pathCache.set(recordId, { pathIds, pathStrings });
            }

            this._nodeMap.set(recordId, {
                directChildren: filteredDirectChildren,
                allChildren: allChildren,
                pathIds,
                pathStrings,
                parent: parentRecord,
                index
            });
        }
        this._isFlat = filteredTopLevelRecords.every(record => this._nodeMap.get(record.getRecordId())!.directChildren.length === 0);
        const rootTaskId = this._getTaskDataProvider().getRootTaskId();
        if (!rootTaskId) {
            if (this._getTaskDataProvider().isFlatListEnabled()) {
                const directlyMatchingRecords: IRecord[] = allRecordsWithMatching.filter(r => this._matchingRecordsMap[r.getRecordId()]);
                this._nodeMap.set(null as any, {
                    directChildren: directlyMatchingRecords,
                    allChildren: directlyMatchingRecords,
                    pathIds: [],
                    pathStrings: [],
                    index: -1
                });
                this._totalUniqueRecords = directlyMatchingRecords.length;
                this._sortedRecordIds = directlyMatchingRecords.map(r => r.getRecordId());
            }
            else {
                this._nodeMap.set(null as any, {
                    directChildren: filteredTopLevelRecords,
                    allChildren: allRecordsWithMatching,
                    pathIds: [],
                    pathStrings: [],
                    index: -1
                });
                this._totalUniqueRecords = allRecordsWithMatching.length;
                this._sortedRecordIds = allRecordsWithMatching.map(r => r.getRecordId());
            }
        }
        else {
            const topLevelNode = this._nodeMap.get(rootTaskId);
            if (this._getTaskDataProvider().isFlatListEnabled()) {
                const directlyMatchingRecords: IRecord[] = topLevelNode?.allChildren.filter(r => this._matchingRecordsMap[r.getRecordId()]) || [];
                topLevelNode!.directChildren = directlyMatchingRecords;
                topLevelNode!.allChildren = directlyMatchingRecords;
            }
            this._nodeMap.set(null as any, topLevelNode!);
            this._totalUniqueRecords = topLevelNode!.allChildren.length;
            this._sortedRecordIds = topLevelNode!.allChildren.map(r => r.getRecordId());
        }
        return this._nodeMap;
    }


    private _buildMatchingRecords() {
        this._matchingRecordsMap = {};
        const provider = this._createBaseProvider();
        provider.onGetQuickFindColumns = () => this._getTaskDataProvider().getQuickFindColumns();
        provider.setFiltering(this._getTaskDataProvider().getFiltering());
        provider.setSearchQuery(this._getTaskDataProvider().getSearchQuery());
        provider.refreshSync();
        this._matchingRecordsMap = provider.getRecordsMap();
    }

    private _buildSortingMap() {
        this._sortingMap = {};
        let index = -1;
        const provider = this._createBaseProvider();
        provider.addEventListener('onRecordLoaded', (record) => {
            this._sortingMap[record.getRecordId()] = ++index;
        });
        provider.refreshSync();
    }

    private _createBaseProvider(): MemoryDataProvider {
        const taskDataProvider = this._getTaskDataProvider();
        const provider = new MemoryDataProvider({
            dataSource: taskDataProvider.getDataSource(),
            metadata: taskDataProvider.getMetadata()
        });
        patchDataBuilderPrepare({ provider, records: this._records });
        provider.getPaging().setPageSize(taskDataProvider.getDataSource().length);
        provider.setSorting(taskDataProvider.getSorting());
        provider.setColumns(taskDataProvider.getColumns());
        return provider;
    }

    private _buildPathForRecord(recordId: string): string[] {
        const path: string[] = [];
        const recordsMap = this._recordsMap;
        const parentIdName = this._getNativeColumns().parentId;
        let record: IRecord | undefined = recordsMap[recordId];
        const visited = new Set<string>();
        while (record) {
            const currentId = record.getRecordId();
            if (visited.has(currentId)) break;
            visited.add(currentId);
            path.unshift(record.getNamedReference().name);
            const parentId: string = record?.getValue(parentIdName)?.[0]?.id?.guid;
            record = recordsMap[parentId];
        }
        return path;
    }

    private _patchRecordPaths() {
        for (const record of this._records) {
            const path = this._buildPathForRecord(record.getRecordId());
            const field = record.getField(this._getNativeColumns().path);
            const pathString = path.join('/');
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