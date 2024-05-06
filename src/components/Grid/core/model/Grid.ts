import { IDatasetProperty } from "../../../../interfaces";
import { StringProps } from "../../../../types";
import { Filtering } from "../../filtering/model/Filtering";
import { IEntityRecord, IGrid, IGridTranslations } from "../../interfaces";
import { Sorting } from "../../sorting/Sorting";
import { DataType } from "../enums/DataType";
import { IGridColumn } from "../interfaces/IGridColumn";
import { RecordUpdateService } from "../services/model/RecordUpdateService";
import { Metadata } from "./Metadata";

export class Grid {
    private _props: IGrid;
    private _dataset: IDatasetProperty
    private _pcfContext: ComponentFramework.Context<any>;
    private _columns: IGridColumn[] = [];
    private _records: IEntityRecord[] = [];
    private _labels: Required<StringProps<IGridTranslations>>;
    private _dependencies = {
        recordUpdateService: new RecordUpdateService(this),
        filtering: new Filtering(this),
        sorting: new Sorting(this),
        metadata: new Metadata(this)
    }
    constructor(props: IGrid, labels: Required<StringProps<IGridTranslations>>) {
        this._props = props;
        this._dataset = props.parameters.Grid;
        this._pcfContext = props.context;
        this._labels = labels;
    };

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

    public updateDependencies(props: IGrid): void {
        this._props = props;
        this._dataset = props.parameters.Grid;
        this._pcfContext = props.context;
        
        for(const [key, dependency] of Object.entries(this._dependencies)) {
            dependency.onDependenciesUpdated()
        }
    }
    public async refreshColumns(): Promise<IGridColumn[]> {
        const gridColumns: IGridColumn[] = [];
        for(const column of this._dataset.columns) {
            const sorted = this._dataset.sorting?.find(sort => sort.name === column.name);
            const entityAliasName = column.alias?.includes('.') ? column.alias.split('.')[0] : null;
            const attributeName = entityAliasName ? column.name.split('.')[1] : column.name;
            const gridColumn = {
                entityAliasName: entityAliasName,
                attributeName: attributeName,
                key: entityAliasName ? `${entityAliasName}.${attributeName}` : attributeName,
                isPrimary: column.isPrimary,
                dataType: column.dataType as DataType,
                displayName: column.displayName,
                //comes from extended
                isFilterable: column.isFilterable ?? true,
                isSortable: !column.disableSorting,
                isSorted: sorted ? true : false,
                isSortedDescending: sorted?.sortDirection === 1 ? true : false,
                width: column.visualSizeFactor,
                //comes from extended
                isResizable: column.isResizable ?? true,
            } as IGridColumn;
            gridColumn.isFiltered = this._dependencies.filtering.condition(gridColumn).isAppliedToDataset
            gridColumn.isEditable = await this._isColumnEditable(gridColumn);
            gridColumns.push(gridColumn);
        }
        if(this.props.parameters.SelectableRows.raw === 'multiple') {
            gridColumns.unshift({
                key: '__checkbox',
                attributeName: '__checkbox',
                width: 45,
            })
        }
        if(false) {
            gridColumns.push({
                key: '__ribbon',
                attributeName: '__ribbon',
                displayName: 'Actions',
                isPrimary: false,
                width: 600,
                isEditable: false
            })
        }
        this._columns = gridColumns;
        return gridColumns;
    }
    private async _isColumnEditable(column: IGridColumn): Promise<boolean> {
         //we are not supporting editing for linked entities
        if(column.entityAliasName) {
            return false;
        }
        //this column is only present in change editor dialog
        if(column.key === '__label') {
            return false;
        }
        //these field types do not support editing
        switch(column.dataType) {
            case DataType.FILE:
            case DataType.IMAGE: {
                return false;
            }
        }
        const metadata = await this._pcfContext.utils.getEntityMetadata(this._dataset.getTargetEntityType(), [column.attributeName]);
        //IsEditable is not available in Power Apps
        return metadata.Attributes.get(column.attributeName).attributeDescriptor.IsValidForUpdate
    }
    public refreshRecords(): IEntityRecord[] {
        const records = [];
            for (const [_, record] of Object.entries(this._dataset.records)) {
                records.push(record);
        }
        this._records = records;
        return records
    }

}