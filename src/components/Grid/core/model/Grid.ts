import { IDatasetProperty } from "../../../../interfaces";
import { StringProps } from "../../../../types";
import { RIBBON_COLUMN_KEY } from "../../constants";
import { Filtering } from "../../filtering/model/Filtering";
import { IEntityColumn, IEntityRecord, IGrid, IGridTranslations } from "../../interfaces";
import { Paging } from "../../paging/model/Paging";
import { Selection } from "../../selection/model/Selection";
import { Sorting } from "../../sorting/Sorting";
import { DataType } from "../enums/DataType";
import { IGridColumn } from "../interfaces/IGridColumn";
import { RecordUpdateService } from "../services/RecordUpdateService/model/RecordUpdateService";
import { Metadata } from "./Metadata";

export class Grid {
    private _props: IGrid;
    private _dataset: IDatasetProperty
    private _pcfContext: ComponentFramework.Context<any>;
    private _columns: IGridColumn[] = [];
    private _records: IEntityRecord[] = [];
    private _labels: Required<StringProps<IGridTranslations>>;
    private _shouldRerender: boolean = false;
    //TODO: the dependencies might not have fully loaded grid
    //need to make sure that the grid is initialized before creating them
    private _dependencies: {
        recordUpdateService: RecordUpdateService,
        filtering: Filtering,
        sorting: Sorting,
        metadata: Metadata,
        selection: Selection,
        paging: Paging
    };
    constructor(props: IGrid, labels: Required<StringProps<IGridTranslations>>) {
        this._props = props;
        this._dataset = props.parameters.Grid;
        this._pcfContext = props.context;
        this._labels = labels;

        this._dependencies = {
            recordUpdateService: new RecordUpdateService(this),
            filtering: new Filtering(this),
            selection: new Selection(this),
            metadata: new Metadata(this),
            sorting: new Sorting(this),
            paging: new Paging(this)
        }

    };
    public get isNavigationEnabled() {
        //enabled by default
        return this.parameters.EnableNavigation?.raw !== false;
    }
    public get isEditable() {
        return this._columns.find(x => x.isEditable) ? true : false;
    }
    public get parameters() {
        return this._props.parameters
    }
    public get error() {
        return this._dataset.error;
    }
    public get errorMessage() {
        return this._dataset.errorMessage
    }
    public get labels() {
        return this._labels;
    }
    public get dataset() {
        return this._dataset;
    }
    public get pcfContext() {
        return this._pcfContext;
    }
    public get props() {
        return this._props;
    }
    public get columns() {
        return this._columns;
    }
    public get records() {
        return this._records;
    }
    public get recordUpdateService() {
        return this._dependencies.recordUpdateService;
    }
    public get sorting() {
        return this._dependencies.sorting;
    }
    public get metadata() {
        return this._dependencies.metadata;
    }
    public get filtering() {
        return this._dependencies.filtering;
    }
    public get selection() {
        return this._dependencies.selection;
    }
    public get paging() {
        return this._dependencies.paging;
    }
    public get shouldRerender() {
        return this._shouldRerender;
    }
    public get loading() {
        return this._dataset.loading;
    }
    public get state() {
        return this._props.state;
    }
    public get useContainerAsHeight() {
        return this.parameters.UseContainerAsHeight?.raw === true;
    }
    public get enableOptionSetColors() {
        return this.parameters.EnableOptionSetColors?.raw === true;
    }
    public get linking() {
        return this.dataset.linking;
    }
    public get inlineRibbonButtonIds() {
        const idString = this.parameters.InlineRibbonButtonIds?.raw;
        if (!idString) {
            return undefined;
        }
        return idString.split(',');
    }

    public openDatasetItem(entityReference: ComponentFramework.EntityReference) {
        this._dataset.openDatasetItem(entityReference);
        const clickedRecord = this._records.find(x => x.getRecordId() === entityReference.id.guid);
        //we need to make sure the item we are opening gets selected in order for the
        //OnOpenRecord ribbon scripts to work correctly
        //if no record found we have clicked a lookup, no selection should be happening in that case
        if (clickedRecord) {
            this.selection.toggle(clickedRecord, true, true, true);
        }
    }

    public updateDependencies(props: IGrid): void {
        this._props = props;
        this._dataset = props.parameters.Grid;
        this._pcfContext = props.context;
        for (const [key, dependency] of Object.entries(this._dependencies)) {
            dependency.onDependenciesUpdated()
        }
        this._shouldRerender = !this.shouldRerender;
    }
    public async refreshColumns(): Promise<IGridColumn[]> {
        const gridColumns: IGridColumn[] = [];
        for (const column of this._dataset.columns) {
            const sorted = this._dataset.sorting?.find(sort => sort.name === column.name);
            const entityAliasName = column.name?.includes('.') ? column.name.split('.')[0] : null;
            const attributeName = entityAliasName ? column.name.split('.')[1] : column.name;
            const key = entityAliasName ? `${entityAliasName}.${attributeName}` : attributeName;
            switch (column.dataType) {
                case DataType.FILE:
                case DataType.IMAGE: {
                    if (entityAliasName) {
                        //we do not support file fields with linked entities
                        //the getValue API throws an error in Power Apps
                        continue;
                    }
                }
            }
            const gridColumn = {
                entityAliasName: entityAliasName,
                attributeName: attributeName,
                key: entityAliasName ? `${entityAliasName}.${attributeName}` : attributeName,
                isPrimary: column.isPrimary,
                dataType: column.dataType as DataType,
                displayName: column.displayName,
                isEditable: column.isEditable,
                isFilterable: this._isColumnFilterable(column),
                isRequired: column.isRequired,
                isSortable: this._isColumnSortable(column),
                isSorted: sorted ? true : false,
                isSortedDescending: sorted?.sortDirection === 1 ? true : false,
                width: this.state?.columnSizing?.columnSizingModel?.find((x: any) => x.colId === key).width || column.visualSizeFactor,
                isResizable: column.isResizable ?? true,
            } as IGridColumn;

            const condition = await this.filtering.condition(gridColumn);
            gridColumn.isFiltered = condition.isAppliedToDataset;
            gridColumn.isEditable = await this._isColumnEditable(gridColumn);
            gridColumn.isRequired = await this._isColumnRequired(gridColumn);

            if (gridColumn.key === RIBBON_COLUMN_KEY) {
                gridColumn.isFilterable = false;
                gridColumn.isSortable = false;
            }
            gridColumns.push(gridColumn);
        }
/*         gridColumns.unshift({
            key: RIBBON_COLUMN_KEY,
            attributeName: RIBBON_COLUMN_KEY,
        }) */
        if (this.selection.type !== undefined) {
            gridColumns.unshift({
                key: '__checkbox',
                attributeName: '__checkbox',
                width: 45,
                isResizable: false
            })
        }
        this._columns = gridColumns;
        return gridColumns;
    }

    public refreshRecords(): IEntityRecord[] {
        const records = [];
        for (const [_, record] of Object.entries(this._dataset.records)) {
            records.push(record);
        }
        this._records = records;
        return records
    }

    private async _isColumnEditable(column: IGridColumn): Promise<boolean> {
        //top priority, overriden through props
        if (typeof column.isEditable === 'boolean') {
            return column.isEditable
        }
        //only allow editing if specifically allowed
        if (!this._props.parameters.EnableEditing?.raw) {
            return false;
        }
        //we are not supporting editing for linked entities
        if (column.entityAliasName) {
            return false;
        }
        //these field types do not support editing
        switch (column.dataType) {
            case DataType.FILE:
            case DataType.IMAGE: {
                return false;
            }
        }
        const metadata = await this._pcfContext.utils.getEntityMetadata(this._dataset.getTargetEntityType(), [column.attributeName]);
        //IsEditable is not available in Power Apps
        return metadata.Attributes.get(column.attributeName)?.attributeDescriptor.IsValidForUpdate ?? false;
    }

    private async _isColumnRequired(column: IGridColumn) {
        if (typeof column.isRequired === 'boolean') {
            return column.isRequired;
        }
        if (!this.parameters.EnableEditing?.raw) {
            return false;
        }
        const metadata = await this.metadata.get(column);
        const requiredLevel = metadata.Attributes.get(column.attributeName)?.attributeDescriptor.RequiredLevel;
        if (requiredLevel === 1 || requiredLevel === 2) {
            return true;
        }
        return false;
    }
    private _isColumnSortable(column: IEntityColumn) {
        if (this._props.parameters.EnableSorting?.raw === false) {
            return false;
        }
        switch (column.dataType) {
            case DataType.IMAGE: {
                return false;
            }
        }
        return !column.disableSorting;
    }
    private _isColumnFilterable(column: IEntityColumn) {
        if (this.props.parameters.EnableFiltering?.raw === false) {
            return false;
        }
        return column.isFilterable ?? true;
    }
}