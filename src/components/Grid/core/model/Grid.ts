import { Attribute, Constants, DataTypes, IColumn, IDataset, IRecord } from "@talxis/client-libraries";
import { Filtering } from "../../filtering/model/Filtering";
import { IGrid } from "../../interfaces";
import { Paging } from "../../paging/model/Paging";
import { Selection } from "../../selection/model/Selection";
import { Sorting } from "../../sorting/Sorting";
import { DataType } from "../enums/DataType";
import { KeyHoldListener } from "../services/KeyListener";
import { Metadata } from "./Metadata";
import { CHECKBOX_COLUMN_KEY } from "../../constants";
import { IGridColumn } from "../interfaces/IGridColumn";

const DEFAULT_ROW_HEIGHT = 42;

export class Grid {
    private _props: IGrid;
    private _dataset: IDataset
    private _pcfContext: ComponentFramework.Context<any>;
    private _columns: IGridColumn[] = [];
    //used for optimization
    private _previousRecordsReference: {
        [id: string]: IRecord;
    } = {};
    //TODO: fix types
    private _labels: any;
    private _shouldRerender: boolean = false;
    private _records: IRecord[] = [];
    //TODO: the dependencies might not have fully loaded grid
    //need to make sure that the grid is initialized before creating them
    private _dependencies: {
        filtering: Filtering,
        sorting: Sorting,
        metadata: Metadata,
        selection: Selection,
        paging: Paging,
    };
    private _maxHeight: number;
    private _minHeight: number = 150;
    private _initialPageSize: number;
    //this is temp, should be moved to AgGrid class, useAgGridInstance should also be created, similar to useGridInstance
    private _refreshGlobalCheckBox: () => void = () => {};
    public readonly keyHoldListener: KeyHoldListener;

    constructor(props: IGrid, labels: any, keyHoldListener: KeyHoldListener) {
        this._props = props;
        this._dataset = props.parameters.Grid;
        this._pcfContext = props.context;
        this._labels = labels;
        this.keyHoldListener = keyHoldListener;

        this._dependencies = {
            filtering: new Filtering(this),
            selection: new Selection(this),
            metadata: new Metadata(this),
            sorting: new Sorting(this),
            paging: new Paging(this),
        }
        this._initialPageSize = this.paging.pageSize;
        this._maxHeight = this._getMaxHeight();

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
        return this._records
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

    public get rowHeight() {
        let height = this.parameters.RowHeight?.raw;
        if(!height) {
            height = DEFAULT_ROW_HEIGHT;
        }
        return height;
    }

    public get height() {
        let height = this._maxHeight;
        if (this.parameters.Height?.raw) {
            return this.parameters.Height?.raw;
        }
        if (this._records.length === 0) {
            height = this._minHeight;
        }
        else if (this._records.length <= this._initialPageSize) {
            height = this._records.length * this.rowHeight;
        }
        if (height > this._maxHeight) {
            height = this._maxHeight;
        }
        return `${height}px`;

    }

    public openDatasetItem(entityReference: ComponentFramework.EntityReference) {
        this._dataset.openDatasetItem(entityReference);
        const clickedRecord = this.records.find(x => x.getRecordId() === entityReference.id.guid);
        //we need to make sure the item we are opening gets selected in order for the
        //OnOpenRecord ribbon scripts to work correctly
        //if no record found we have clicked a lookup, no selection should be happening in that case
        if (clickedRecord) {
            this.selection.toggle(clickedRecord, true);
        }
    }

    public updateDependencies(props: IGrid): void {
        this._props = props;
        this._dataset = props.parameters.Grid;
        this._pcfContext = props.context;
        if (this._previousRecordsReference !== this._dataset.records) {
            this._records = Object.values(this._dataset.records);
            this._previousRecordsReference = this._dataset.records;
        }
        Object.values(this._dependencies).map(dep => {
            dep.onDependenciesUpdated()
        })
        this._shouldRerender = !this.shouldRerender;
    }
    public async refreshColumns(): Promise<IGridColumn[]> {
        const gridColumns: IGridColumn[] = [];
        for (const column of this._dataset.columns) {
            const sorted = this._dataset.sorting?.find(sort => sort.name === column.name);
            const gridColumn: IGridColumn = {
                ...column,
                isEditable: await this._isColumnEditable(column),
                isRequired: await this._isColumnRequired(column),
                isFilterable: await this._isColumnFilterable(column),
                disableSorting: !this._isColumnSortable(column),
                isSortedDescending: sorted?.sortDirection === 1 ? true : false,
                isResizable: true,
                isSorted: sorted ? true : false,
                isFiltered: false,
                getEntityName: () => this._getColumnEntityName(column.name)
            }
            const condition = await this.filtering.condition(gridColumn);
            gridColumn.isFiltered = condition.isAppliedToDataset;
            gridColumns.push(gridColumn);
        }
        if (this.selection.type !== undefined) {
            gridColumns.unshift({
                name: CHECKBOX_COLUMN_KEY,
                alias: CHECKBOX_COLUMN_KEY,
                dataType: DataTypes.SingleLineText,
                displayName: '',
                isEditable: false,
                isFilterable: false,
                isFiltered: false,
                isRequired: false,
                isResizable: false,
                disableSorting: true,
                isSorted: false,
                isSortedDescending: false,
                order: 0,
                visualSizeFactor: 45,
                getEntityName: () => this._getColumnEntityName(CHECKBOX_COLUMN_KEY)
            });
        }
        this._columns = gridColumns;
        return gridColumns;
    }

    public getTotalVisibleColumnsWidth(): number {
        let totalWidth = 0;
        this._columns.filter(x => !x.isHidden).map(col => {
            totalWidth = totalWidth + col.visualSizeFactor;
        })
        return totalWidth;
    }

    private async _isColumnEditable(column: IColumn): Promise<boolean> {
        //only allow editing if specifically allowed
        if (!this._props.parameters.EnableEditing?.raw) {
            return false;
        }
        if (column.name === Constants.RIBBON_BUTTONS_COLUMN_NAME) {
            return false;
        }
        //these field types do not support editing
        switch (column.dataType) {
            case DataType.FILE:
            case DataType.IMAGE: {
                return false;
            }
        }
        const attributeName = Attribute.GetNameFromAlias(column.name);
        const metadata = await this.metadata.get(column.name);
        return metadata.Attributes.get(attributeName)?.attributeDescriptor?.IsValidForUpdate ?? false;
    }

    private async _isColumnRequired(column: IColumn): Promise<boolean> {
        if (!this.parameters.EnableEditing?.raw) {
            return false;
        }
        if (column.name === Constants.RIBBON_BUTTONS_COLUMN_NAME) {
            return false;
        }
        const metadata = await this.metadata.get(column.name);
        const attributeName = Attribute.GetNameFromAlias(column.name);
        const requiredLevel = metadata.Attributes.get(attributeName)?.attributeDescriptor?.RequiredLevel;
        if (requiredLevel === 1 || requiredLevel === 2) {
            return true;
        }
        return false;
    }
    private _isColumnSortable(column: IColumn): boolean {
        if (column.name.endsWith('__virtual')) {
            return false;
        }
        if (this._props.parameters.EnableSorting?.raw === false) {
            return false;
        }
        if (column.name === Constants.RIBBON_BUTTONS_COLUMN_NAME) {
            return false;
        }
        switch (column.dataType) {
            case DataType.IMAGE: {
                return false;
            }
        }
        if(column.disableSorting === undefined) {
            return true;
        }
        return !column.disableSorting;
    }
    private async _isColumnFilterable(column: IColumn): Promise<boolean> {
        if (column.name.endsWith('__virtual')) {
            return false;
        }
        if (this.props.parameters.EnableFiltering?.raw === false) {
            return false;
        }
        if (column.name === Constants.RIBBON_BUTTONS_COLUMN_NAME) {
            return false;
        }
        const metadata = await this.metadata.get(column.name);
        const attributeName = Attribute.GetNameFromAlias(column.name);
        return metadata.Attributes.get(attributeName)?.attributeDescriptor?.isFilterable ?? true;
    }
    private _getMaxHeight(): number {
        let maxHeight = this._initialPageSize * this.rowHeight;
        if (maxHeight > 600) {
            maxHeight = 600;
        }
        return maxHeight;
    }
    private _getColumnEntityName(columnName: string) {
        const entityAliasName = Attribute.GetLinkedEntityAlias(columnName);
        if (!entityAliasName) {
            return this.dataset.getTargetEntityType();
        }
        return this.dataset.linking.getLinkedEntities().find(x => x.alias === entityAliasName)!.name;
    }
}