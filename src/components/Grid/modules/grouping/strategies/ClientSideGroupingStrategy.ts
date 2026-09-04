import { GridApi } from "@ag-grid-community/core";
import { IDataProvider, IRecord } from "@talxis/client-libraries";
import { IGridGroupingServiceLocator } from "../services";
import { IGroupingStrategy, IGroupingStrategyParameters } from "./interfaces";

/**
 * Grouping where every level is in the grid at once, as a tree.
 *
 * The client-side model has no way to ask for a level, so the levels are fetched here instead: a load of
 * the records is followed by a walk that creates and refreshes every group's child provider, and the rows
 * are handed over again once it is done. Two pushes rather than one, so the groups paint immediately
 * instead of after the whole tree has been fetched.
 *
 * The child providers are what is walked rather than a flat list from the provider: selection drill-down,
 * the group counts and the dataset's own group aggregates are all read off that topology.
 */
export class ClientSideGroupingStrategy implements IGroupingStrategy {
    private _services: IGridGroupingServiceLocator;
    /** Which load the walk in flight belongs to, so a load that has been overtaken drops its rows. */
    private _loadToken: number = 0;

    constructor(parameters: IGroupingStrategyParameters) {
        this._services = parameters.services;
        //ahead of the push the grid makes on the same event, because the rows about to be pushed are a
        //hierarchy only while `treeData` says so
        this._provider.addEventListener('onNewDataLoaded', () => {
            this._applyTreeData();
            this._loadEveryLevel();
        });
    }

    /**
     * Neither option is `@initial`, which is what lets grouping turn the hierarchy on and off as group-bys
     * come and go.
     *
     * No column in this grid carries `aggFunc`, and that is what keeps this safe: under `treeData` AG Grid
     * reads a group row's `aggData` ahead of the column's `valueGetter`, so a column given one would stop
     * going through the cell pipeline on group rows — no formatting, no controls, no notifications.
     */
    public applyGridOptions(gridApi: GridApi<IRecord>): void {
        this._applyTreeData(gridApi);
    }

    /** Nothing: `rowGroup` would have AG Grid group the rows itself, over a tree it was handed grouped. */
    public applyGroupedColumnDefinition(): void { }

    public getRows(): IRecord[] {
        return flattenGroupedRecords(this._provider.getRecords());
    }

    /**
     * A tree only while there is something to nest: a grid whose group-bys are gone is a flat list, and
     * every path would be a record of its own.
     *
     * The path goes on and comes off with `treeData`, not once at the start — the grouping stage reads the
     * two together, and a path left behind on a grid that is no longer a tree breaks it.
     */
    private _applyTreeData(gridApi = this._services.get('gridServices').find('gridApi')): void {
        if (!gridApi) {
            return;
        }
        const isTree = this._provider.grouping.getGroupBys().length > 0;
        //only on a change: `treeData` is a managed property, and setting it runs the grouping stage over
        //the rows - which on a grid that has not been given any yet has nothing to group and throws
        if (!!gridApi.getGridOption('treeData') === isTree) {
            return;
        }
        gridApi.setGridOption('getDataPath', isTree ? getRecordPath : undefined);
        gridApi.setGridOption('treeData', isTree);
    }

    /**
     * Fetches every group's children, depth first, and hands the rows over again.
     *
     * Runs after the group-bys a load was stripped of have been put back, because it is those that decide
     * what a child provider groups its own records by.
     */
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

/**
 * A record's ancestry, which is what `treeData` builds the hierarchy from.
 *
 * The chain of providers is the ancestry: each grouped child provider is keyed by the group record whose
 * children it holds, and the root's is empty. The ids line up with `getRowId`, which is what makes every
 * segment resolve to a row of ours instead of a placeholder AG Grid synthesises — and it has to, because a
 * group row carries the dataset's own aggregate values.
 */
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

/**
 * Fetches the children of every group in this list, and of every group under them.
 *
 * A level at a time rather than one group at a time: the groups of a level are independent, and a wide
 * grouping is otherwise as many round trips as there are groups. A group whose fetch failed is left
 * without children rather than taking the rest of the tree down with it.
 */
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
