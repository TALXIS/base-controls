import { IColumn, IDataProvider, ILinkEntityExposedExpression } from "@talxis/client-libraries";
import { IStateStore } from "@utils";

/** What the control keeps of a view's provider, for the next time the view is loaded. */
export interface IDatasetControlProviderState {
    /** The columns, as Edit columns left them. */
    columns: IColumn[];
    /** The related entities the columns come from. */
    linking: ILinkEntityExposedExpression[];
    /** The sort the user applied. */
    sorting: ComponentFramework.PropertyHelper.DataSetApi.SortStatus[];
    /** The filter the user applied. */
    filtering: ComponentFramework.PropertyHelper.DataSetApi.FilterExpression | null;
    /** The page size the user picked. */
    pageSize: number;
    /** The page the user was on. */
    pageNumber: number;
    /** What the user searched for. */
    searchQuery: string;
    /** The records the user selected. */
    selectedRecordIds: string[];
}

export interface IDatasetControlStateParameters {
    /** The control's entry in the state store. */
    store: IStateStore;
}

const VIEW_ID_KEY = 'viewId';
const VIEWS_KEY = 'views';
const PROVIDER_KEY = 'provider';
const PARTS_KEY = 'parts';
//the entry of a control whose onLoad returns no views
const NO_VIEW_KEY = '';

/** Keeps the view the control was on, and for each view the provider's setup and what the parts keep. */
export class DatasetControlState {
    private _store: IStateStore;

    constructor(parameters: IDatasetControlStateParameters) {
        this._store = parameters.store;
    }

    /** The view the control is on, to load first. */
    public getViewId(): string | undefined {
        return this._store.get<string>(VIEW_ID_KEY);
    }

    public setViewId(viewId: string | undefined): void {
        this._store.set(VIEW_ID_KEY, viewId);
    }

    /** What the parts keep while the view is shown. */
    public getViewStore(viewId: string | undefined): IStateStore {
        return this._getView(viewId).scope(PARTS_KEY);
    }

    /** Puts the setup kept for the view onto its provider, before it loads. */
    public restore(provider: IDataProvider, viewId: string | undefined): void {
        const state = this._getView(viewId).get<IDatasetControlProviderState>(PROVIDER_KEY);
        if (!state) {
            return;
        }
        provider.setColumns(state.columns);
        provider.setLinking(state.linking);
        provider.setSorting(state.sorting);
        provider.setFiltering(state.filtering);
        provider.getPaging().setPageSize(state.pageSize);
        provider.getPaging().setPageNumber(state.pageNumber);
        provider.setSearchQuery(state.searchQuery);
        provider.setSelectedRecordIds(state.selectedRecordIds);
    }

    /** Keeps the provider's setup for the view it shows. */
    public save(provider: IDataProvider, viewId: string | undefined): void {
        this._getView(viewId).set<IDatasetControlProviderState>(PROVIDER_KEY, {
            columns: provider.getColumns(),
            linking: provider.getLinking(),
            sorting: provider.getSorting(),
            filtering: provider.getFiltering(),
            pageSize: provider.getPaging().pageSize,
            pageNumber: provider.getPaging().pageNumber,
            searchQuery: provider.getSearchQuery(),
            selectedRecordIds: provider.getSelectedRecordIds(),
        });
    }

    private _getView(viewId: string | undefined): IStateStore {
        return this._store.scope(VIEWS_KEY).scope(viewId ?? NO_VIEW_KEY);
    }
}
