import { DatasetControl, IDatasetControl } from "@utils/dataset-control";
import { EventEmitter, IDataset, IDataProvider, IRawRecord, IRecordSaveOperationResult } from "@talxis/client-libraries";
import { IDatasetControlParameters } from "@components/DatasetControl";
import { ILocalizationService } from "@utils";
import { ICheckListLabels } from "./labels";

/** Maps the checklist's concepts onto columns in the data it was given. */
export interface ICheckListFieldMapping {
    /**
     * Column each item is identified by. The checklist builds the entity's metadata from this and
     * {@link ICheckListFieldMapping.name}, which is why it asks for no metadata of its own.
     */
    id: string;
    /** Column holding the item's label. */
    name: string;
    /** Column the list is ordered by. Hidden from the grid. */
    stackRank: string;
    /**
     * Boolean column the item's completion is stored in. Hidden from the grid - the checklist's own
     * checkbox column is what shows and changes it.
     */
    completed: string;
}

/** What {@link CheckListDatasetControl} is built from. */
export interface ICheckListDatasetControlParameters {
    dataset: IDataset;
    fieldMapping: ICheckListFieldMapping;
    controlId: string;
    localizationService: ILocalizationService<ICheckListLabels>;
    onGetPcfContext: () => ComponentFramework.Context<any, any>;
    onGetParameters: () => IDatasetControlParameters;
}

/** The checklist's dataset control. Adds the field mapping to the generic {@link IDatasetControl}. */
/**
 * What only a checklist raises, forwarded to the matching props on `ICheckListProps`. Everything on the
 * inherited `addEventListener` is the generic dataset control's.
 */
export interface ICheckListDatasetControlEvents {
    onItemCreated: (item: IRawRecord) => void;
    onItemDeleted: (itemId: string) => void;
    onItemMoved: (itemId: string) => void;
    onItemCompletionChanged: (itemId: string, isCompleted: boolean) => void;
    onItemSaved: (result: IRecordSaveOperationResult) => void;
    /** Raised alongside every one of the above that left the list different. */
    onDataChanged: (items: IRawRecord[]) => void;
    onError: (error: any, message: string) => void;
}

export interface ICheckListDatasetControl extends IDatasetControl {
    /** The checklist's own events. */
    readonly events: EventEmitter<ICheckListDatasetControlEvents>;
    /** The items as they stand. A copy — writing to it changes nothing. */
    getData(): IRawRecord[];
    /** The id this control was built with. */
    getControlId(): string;
    /** Which columns carry the label, the order and the completion state. */
    getFieldMapping(): ICheckListFieldMapping;
    /** Resolves every string the checklist renders. */
    getLocalizationService(): ILocalizationService<ICheckListLabels>;
}

/**
 * A deliberately stripped-down dataset control: no command bar, no quick find, no edit columns and no
 * pagination — the grid and the new-record row are the whole surface. The flags are decided here rather
 * than read off the parameters, so a caller cannot turn one of them back on.
 *
 * Also the one owner of the {@link ICheckListFieldMapping} — it applies it to the provider once the
 * provider has preloaded, and hands it out through `getFieldMapping`.
 */
export class CheckListDatasetControl extends DatasetControl implements ICheckListDatasetControl {
    public readonly events = new EventEmitter<ICheckListDatasetControlEvents>();
    private _dataProvider: IDataProvider;
    private _fieldMapping: ICheckListFieldMapping;
    private _controlId: string;
    private _localizationService: ILocalizationService<ICheckListLabels>;

    constructor(parameters: ICheckListDatasetControlParameters) {
        super({
            state: {},
            controlId: parameters.controlId,
            onGetPcfContext: parameters.onGetPcfContext,
            onGetParameters: parameters.onGetParameters,
        });
        this._fieldMapping = parameters.fieldMapping;
        this._controlId = parameters.controlId;
        this._localizationService = parameters.localizationService;
        this._dataProvider = parameters.dataset.getDataProvider();
        this._registerDataProviderEvents(this._dataProvider);
        //not here: a provider such as FetchXmlDataProvider only knows its columns once it has preloaded,
        //so the mapping waits for the initialization to get that far
        this.setInterceptor('onInitialize', async (parameters, defaultAction) => {
            //the default action is the preload, so the columns exist by the time it resolves
            await defaultAction(parameters);
            this._applyFieldMapping();
        });
    }

    /**
     * Takes the checklist's own listeners off before the base tears the dataset down, and drops whatever
     * was listening to the checklist's events. Removed one by one rather than cleared: the provider
     * carries the grid's listeners too.
     */
    public destroy(): void {
        this._dataProvider.removeEventListener('onAfterRecordSaved', this._onAfterRecordSaved);
        this._dataProvider.removeEventListener('onError', this._onProviderError);
        this.events.clearEventListeners();
        super.destroy();
    }

    public getData(): IRawRecord[] {
        //a copy: what the checklist hands out is not a way into the provider's own rows
        return structuredClone(this.getDataset().getDataProvider().getRawData());
    }

    public getControlId(): string {
        return this._controlId;
    }

    public getFieldMapping(): ICheckListFieldMapping {
        return this._fieldMapping;
    }

    public getLocalizationService(): ILocalizationService<ICheckListLabels> {
        return this._localizationService;
    }

    public isQuickFindVisible(): boolean {
        return false;
    }
    public isEditColumnsVisible(): boolean {
        return false;
    }
    public isPaginationVisible(): boolean {
        return false;
    }
    public isPageSizeSwitcherVisible(): boolean {
        return false;
    }
    //together with the two above this leaves the footer out entirely
    public isRecordCountVisible(): boolean {
        return false;
    }
    //with quick find, edit columns and the record count all off too, this leaves the header empty
    public isRibbonVisible(): boolean {
        return false;
    }

    /**
     * Orders the list by the stack rank and lays the columns out: the label first, with the stack rank
     * and the completion both hidden - the former is only an ordering, the latter has the checkbox
     * column. Mutating the map and setting the columns back is what triggers the sort.
     *
     * Runs from the `onInitialize` interceptor, after the provider preloaded and before the first page
     * is fetched — so the sorting is already on the provider when the records load.
     */
    private _applyFieldMapping(): void {
        const provider: IDataProvider = this.getDataset().getDataProvider();
        const { name, stackRank, completed } = this._fieldMapping;
        const columnsMap = provider.getColumnsMap();
        this._assertColumnExists(columnsMap, 'name', name);
        this._assertColumnExists(columnsMap, 'stackRank', stackRank);
        this._assertColumnExists(columnsMap, 'completed', completed);

        columnsMap[stackRank].isHidden = true;
        columnsMap[completed].isHidden = true;
        provider.setColumns(provider.getColumns());
        provider.setSorting([{
            name: stackRank,
            sortDirection: 0
        }]);
    }

    /**
     * Saves and errors are the provider's to report, not the checklist's — a rename is committed by the
     * grid's own cell editor, which no checklist code sees.
     *
     * Bound as fields rather than inline, so `destroy` has the same references to take off again.
     */
    private _onAfterRecordSaved = (result: IRecordSaveOperationResult) => {
        this.events.dispatchEvent('onItemSaved', result);
        //a save that failed left the list where it was
        if (result.success) {
            this.events.dispatchEvent('onDataChanged', this.getData());
        }
    }

    private _onProviderError = (errorMessage: string, details?: any) => {
        this.events.dispatchEvent('onError', details, errorMessage);
    }

    private _registerDataProviderEvents(provider: IDataProvider): void {
        provider.addEventListener('onAfterRecordSaved', this._onAfterRecordSaved);
        provider.addEventListener('onError', this._onProviderError);
    }

    private _assertColumnExists(columnsMap: { [columnName: string]: any }, field: keyof ICheckListFieldMapping, columnName: string): void {
        if (!columnsMap[columnName]) {
            throw new Error(`CheckList field mapping points "${field}" at column "${columnName}", which the data provider does not have. Available columns: ${Object.keys(columnsMap).join(', ')}.`);
        }
    }
}
