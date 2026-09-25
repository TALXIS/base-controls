import { GridApi, IRowNode } from "@ag-grid-community/core";
import { IDataProvider, IRecord } from "@talxis/client-libraries";
import { IGridServiceLocator } from "../../../services";
import { IGridRowModelGrouping, IGridRowModelGroupingParameters } from "../interfaces";
import { IGridAgGridOptions } from "../../../services/runtime";

export interface IClientSideRowModelGroupingParameters extends IGridRowModelGroupingParameters {
    services: IGridServiceLocator;
    /** Hands the rows to the grid again, once every level has arrived. */
    onRowsLoaded: () => void;
}

/** Grouping where every level is in the grid at once, as a tree. */
export class ClientSideRowModelGrouping implements IGridRowModelGrouping {
    private _services: IGridServiceLocator;
    private _onRowsLoaded: () => void;
    private _isTree: boolean;
    /** Which load the walk in flight belongs to */
    private _loadToken: number = 0;
    public isGroupOpenByDefault: (node: IRowNode<IRecord>) => boolean;

    constructor(parameters: IClientSideRowModelGroupingParameters) {
        this._services = parameters.services;
        this._onRowsLoaded = parameters.onRowsLoaded;
        this.isGroupOpenByDefault = parameters.isGroupOpenByDefault;
        this._isTree = this._getIsTree();
        //ahead of the grid's refresh on the same event
        this._provider.addEventListener('onNewDataLoaded', this._onNewDataLoaded);
        this._services.get('grid').events.addEventListener('onDestroy', this._onDestroy);
    }

    /** Neither option is `@initial`, so grouping can turn the hierarchy on and off. */
    public onAgGridOptions(result: IGridAgGridOptions): void {
        //the path first: AG Grid reads it the moment tree data is switched on
        result.options.getDataPath = this._isTree ? getRecordPath : undefined;
        result.options.treeData = this._isTree;
    }

    /** Nothing: `rowGroup` would have AG Grid group the rows itself, over a tree it was handed */
    public onApplyColumnDefinition(): void { }

    /** Written onto the nodes and drawn in one pass. */
    public onApplyExpandedLevel(gridApi: GridApi<IRecord>): void {
        gridApi.forEachNode(node => {
            if (node.allChildrenCount) {
                node.expanded = this.isGroupOpenByDefault(node);
            }
        });
        gridApi.onGroupExpandedOrCollapsed();
    }

    public onExpansionChanged(): void { }

    /** Every record the tree holds, as far as the child providers have been fetched. */
    public getRows(): IRecord[] {
        return flattenGroupedRecords(this._provider.getRecords());
    }

    //the provider outlives the grid
    private _onDestroy = (): void => {
        this._provider.removeEventListener('onNewDataLoaded', this._onNewDataLoaded);
    };

    private _onNewDataLoaded = (): void => {
        this._isTree = this._getIsTree();
        this._loadEveryLevel();
    };

    /** A tree only while there is something to nest. */
    private _getIsTree(): boolean {
        return this._provider.grouping.getGroupBys().length > 0;
    }

    /** Fetches every group's children, depth first, and hands the rows over again. */
    private async _loadEveryLevel(): Promise<void> {
        if (!this._provider.grouping.getGroupBys().length) {
            return;
        }
        const loadToken = ++this._loadToken;
        await loadGroupedRecords(this._provider.getRecords());
        if (loadToken !== this._loadToken || !this._services.find('gridApi')) {
            return;
        }
        this._onRowsLoaded();
    }

    private get _provider(): IDataProvider {
        return this._services.get('provider');
    }
}

/** A record's ancestry, which is what `treeData` builds the hierarchy from. */
const getRecordPath = (record: IRecord): string[] => {
    const path: string[] = [];
    let provider: IDataProvider | null = record.getDataProvider();
    while (provider?.getParentRecordId()) {
        path.unshift(provider.getParentRecordId());
        provider = provider.getParentDataProvider();
    }
    path.push(record.getRecordId());
    return path;
};

/** Every record under these, in one list, as far as the child providers have been fetched. */
const flattenGroupedRecords = (records: IRecord[]): IRecord[] =>
    records.flatMap(record => {
        const childProvider = record.getDataProvider().getGroupedRecordDataProvider(record.getRecordId());
        return childProvider
            ? [record, ...flattenGroupedRecords(childProvider.getRecords())]
            : [record];
    });

/** Fetches the children of every group in this list, and of every group under them. */
const loadGroupedRecords = async (records: IRecord[]): Promise<void> => {
    const groupRecords = records.filter(record => record.getSummarizationType() === 'grouping');
    if (!groupRecords.length) {
        return;
    }
    await Promise.all(groupRecords.map(async record => {
        const childProvider = record.getDataProvider().createGroupedRecordDataProvider(record);
        try {
            await childProvider.refresh();
        }
        catch {
            return;
        }
        await loadGroupedRecords(childProvider.getRecords());
    }));
};
