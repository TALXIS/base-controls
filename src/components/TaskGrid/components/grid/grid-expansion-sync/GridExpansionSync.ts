import { GridApi, IRowNode, RowGroupOpenedEvent } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";
import { ITaskGridServiceLocator } from "@components/TaskGrid/services";
import { ITaskExpansionDelta, ITaskExpansionProvider } from "@components/TaskGrid/providers/expansion";

export interface IGridExpansionSyncParameters {
    /** Where the grid's api and the expansion authority are reached. */
    services: ITaskGridServiceLocator;
}

/**
 * Keeps the grid's expanded rows and {@link ITaskExpansionProvider} in step.
 *
 * The grid reports what the user did to a row, and draws what the authority says. Rows the grid has not
 * built yet need nothing from here: it answers `isServerSideGroupOpenByDefault` from the same authority
 * as each row arrives, so a branch opens itself when it materialises — which is also what makes a bulk
 * expand cascade through levels the grid had never loaded.
 */
export class GridExpansionSync {
    private _services: ITaskGridServiceLocator;
    private _isApplying = false;
    private _isReporting = false;

    constructor(parameters: IGridExpansionSyncParameters) {
        this._services = parameters.services;
        this._gridApi.addEventListener('rowGroupOpened', (event: RowGroupOpenedEvent<IRecord>) => this._onRowGroupOpened(event));
        this._expansion.events.addEventListener('onExpansionChanged', delta => this._apply(delta));
    }

    private _onRowGroupOpened(event: RowGroupOpenedEvent<IRecord>): void {
        //a row the grid opened because the authority told it to is not news
        if (this._isApplying || !event.node.id) {
            return;
        }
        //the row is already in the state being reported, so the change coming back must not be applied to
        //it again: doing so walks every row the grid holds, per row the user opens
        this._isReporting = true;
        try {
            this._expansion.setExpanded(event.node.id, !!event.expanded);
        }
        finally {
            this._isReporting = false;
        }
    }

    private _apply(delta: ITaskExpansionDelta): void {
        if (this._isReporting) {
            return;
        }
        this._isApplying = true;
        try {
            if (delta.isBulk) {
                //the grid's own bulk calls coalesce into one model update, and every row they reveal
                //answers the authority on its way in
                delta.expanded ? this._gridApi.expandAll() : this._gridApi.collapseAll();
                return;
            }
            this._setNodesExpanded(new Set(delta.recordIds), delta.expanded);
            //the rows a change reveals are worked out in a pass of its own, and setting the state of a row
            //does not ask for one - the bulk calls above do it themselves, a change landing in the same
            //tick as a new row list does not, and then the grid holds the rows without displaying them
            this._gridApi.onGroupExpandedOrCollapsed();
        }
        finally {
            this._isApplying = false;
        }
    }

    //one walk of the rows the grid holds, rather than an id lookup each: asking the grid for a row by id
    //walks all of them, so a lookup per id would be quadratic
    private _setNodesExpanded(recordIds: Set<string>, expanded: boolean): void {
        const nodes: IRowNode<IRecord>[] = [];
        this._gridApi.forEachNode(node => {
            if (node.id && recordIds.has(node.id) && node.expanded !== expanded) {
                nodes.push(node);
            }
        });
        for (const node of nodes) {
            node.setExpanded(expanded);
        }
    }

    private get _gridApi(): GridApi {
        return this._services.get('gridApi');
    }

    private get _expansion(): ITaskExpansionProvider {
        return this._services.get('taskExpansion');
    }
}
