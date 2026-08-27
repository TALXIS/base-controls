import { DatasetControl, IDatasetControl } from "@utils/dataset-control";
import { IDataset, IDataProvider } from "@talxis/client-libraries";
import { IDatasetControlParameters } from "@components/DatasetControl";
import { ILocalizationService } from "@utils";
import { ICheckListLabels } from "./labels";

/** Maps the checklist's three concepts onto columns in the provider's data. */
export interface ICheckListFieldMapping {
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
export interface ICheckListDatasetControl extends IDatasetControl {
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
        //not here: a provider such as FetchXmlDataProvider only knows its columns once it has preloaded,
        //so the mapping waits for the initialization to get that far
        this.setInterceptor('onInitialize', async (parameters, defaultAction) => {
            //the default action is the preload, so the columns exist by the time it resolves
            await defaultAction(parameters);
            this._applyFieldMapping();
        });
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
        columnsMap[name].order = 0;
        provider.setColumns(provider.getColumns());
        provider.setSorting([{
            name: stackRank,
            sortDirection: 0
        }]);
    }

    private _assertColumnExists(columnsMap: { [columnName: string]: any }, field: keyof ICheckListFieldMapping, columnName: string): void {
        if (!columnsMap[columnName]) {
            throw new Error(`CheckList field mapping points "${field}" at column "${columnName}", which the data provider does not have. Available columns: ${Object.keys(columnsMap).join(', ')}.`);
        }
    }
}
