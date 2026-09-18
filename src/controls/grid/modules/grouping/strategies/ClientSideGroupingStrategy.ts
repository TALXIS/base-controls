import { GridApi } from "@ag-grid-community/core";
import { IDataProvider, IRecord } from "@talxis/client-libraries";
import { IGridGroupingServiceLocator } from "../services";
import { IGroupingStrategy, IGroupingStrategyParameters } from "./interfaces";

/** Grouping where every level is in the grid at once, as a tree. */
export class ClientSideGroupingStrategy implements IGroupingStrategy {
    private _services: IGridGroupingServiceLocator;
    /** Which load the walk in flight belongs to */
    private _loadToken: number = 0;

    constructor(parameters: IGroupingStrategyParameters) {
        this._services = parameters.services;
        //ahead of the push the grid makes on the same event
        this._provider.addEventListener('onNewDataLoaded', () => {
            this._applyTreeData();
            this._loadEveryLevel();
        });
    }

    /**
     * Neither option is `@initial`, so grouping can turn the hierarchy on and off.
     */
    public applyGridOptions(gridApi: GridApi<IRecord>): void {
        this._applyTreeData(gridApi);
    }

    /** Nothing: `rowGroup` would have AG Grid group the rows itself, over a tree it was handed */
    public applyGroupedColumnDefinition(): void { }

    public getRows(): IRecord[] {
        return flattenGroupedRecords(this._provider.getRecords());
    }

    /** A tree only while there is something to nest. */
    private _applyTreeData(gridApi = this._services.get('gridServices').find('gridApi')): void {
        if (!gridApi) {
            return;
        }
        const isTree = this._provider.grouping.getGroupBys().length > 0;
        //only on a change: `treeData` is a managed property
        if (!!gridApi.getGridOption('treeData') === isTree) {
            return;
        }
        gridApi.setGridOption('getDataPath', isTree ? getRecordPath : undefined);
        gridApi.setGridOption('treeData', isTree);
    }

    /** Fetches every group's children, depth first, and hands the rows over again. */
    private async _loadEveryLevel(): Promise<void> {
        if (!this._provider.grouping.getGroupBys().length) {
            return;
        }
        const loadToken = ++this._loadToken;
        await loadGroupedRecords(this._provider.getRecords());
        const gridApi = this._services.get('gridServices').find('gridApi');
        if (loadToken !== this._loadToken || !gridApi) {
            return;
        }
        this._services.get('gridServices').get('rowModel').refresh(gridApi);
    }

    private get _provider(): IDataProvider {
        return this._services.get('gridServices').get('provider');
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
