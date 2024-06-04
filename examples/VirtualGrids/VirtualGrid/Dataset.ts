import { IDatasetProperty } from "../../../src/interfaces";
import { DataType } from "../../../src/components/Grid/core/enums/DataType";
import { IEntityColumn, IEntityRecord } from "../../../src/components/Grid/interfaces";

let exampleValue = "Val";

export class Dataset implements IDatasetProperty {
    paging: Paging = new Paging();
    error?: boolean | undefined;
    errorMessage?: string | undefined;
    security?: ComponentFramework.PropertyHelper.SecurityValues | undefined;
    raw?: any;
    type?: string | undefined;
    addColumn?: ((name: string, entityAlias?: string | undefined) => void) | undefined;
    filtering: ComponentFramework.PropertyHelper.DataSetApi.Filtering = new Filtering();
    linking: ComponentFramework.PropertyHelper.DataSetApi.Linking = new Linking();
    loading: boolean = false;
    sortedRecordIds: string[] = [];
    sorting: ComponentFramework.PropertyHelper.DataSetApi.SortStatus[] = [];
    private _selectedRecordIds: string[] = [];
    private _context: ComponentFramework.Context<any, any>;

    constructor(context: ComponentFramework.Context<any, any>) {
        this._context = context;
    }
    
    clearSelectedRecordIds(): void {
        this._selectedRecordIds = [];
    }
    getSelectedRecordIds(): string[] {
        return this._selectedRecordIds;
    }
    getTargetEntityType(): string {
        return 'testEntity';
    }
    getTitle(): string {
        throw new Error("Method not implemented.");
    }
    getViewId(): string {
        throw new Error("Method not implemented.");
    }
    openDatasetItem(entityReference: ComponentFramework.EntityReference): void {
        throw new Error("Method not implemented.");
    }
    refresh(): void {
        throw new Error("Method not implemented.");
    }
    setSelectedRecordIds(ids: string[]): void {
        this._selectedRecordIds = ids;
        this._context.factory.requestRender();
    }
    retrieveRecordCommand(recordIds: string[], specificCommands?: string[] | undefined, filterByPriority?: boolean | undefined, useNestedFormat?: boolean | undefined, refreshAllRules?: boolean | undefined) {
        return [];
    }
    public get records() {
        return {
            "000": new Record(this._context)
        };
    }
    public get columns(): IEntityColumn[] {
        return [
            {
                alias: "",
                dataType: DataType.SINGLE_LINE_TEXT,
                isRequired: false,
                isEditable: true,
                displayName: 'Sloupec',
                name: 'col',
                order: 1,
                visualSizeFactor: 300
            }
        ];
    }
}

class Paging implements ComponentFramework.PropertyHelper.DataSetApi.Paging {
    totalResultCount: number = 1;
    firstPageNumber: number = 1;
    lastPageNumber: number = 1;
    pageSize: number = 5;
    hasNextPage: boolean = false;
    hasPreviousPage: boolean = false;
    pageNumber: number = 1;

    loadNextPage(loadOnlyNewPage?: boolean | undefined): void {
        throw new Error("Method not implemented.");
    }
    loadPreviousPage(loadOnlyNewPage?: boolean | undefined): void {
        throw new Error("Method not implemented.");
    }
    reset(): void {
        throw new Error("Method not implemented.");
    }
    setPageSize(pageSize: number): void {
        throw new Error("Method not implemented.");
    }
    loadExactPage(pageNumber: number): void {
        throw new Error("Method not implemented.");
    }

}

class Filtering implements ComponentFramework.PropertyHelper.DataSetApi.Filtering {
    getFilter(): ComponentFramework.PropertyHelper.DataSetApi.FilterExpression {
        return {
            conditions: [],
            filterOperator: 0
        };
    }
    setFilter(expression: ComponentFramework.PropertyHelper.DataSetApi.FilterExpression): void {
        throw new Error("Method not implemented.");
    }
    clearFilter(): void {
        throw new Error("Method not implemented.");
    }

}

class Linking implements ComponentFramework.PropertyHelper.DataSetApi.Linking {
    getLinkedEntities(): ComponentFramework.PropertyHelper.DataSetApi.LinkEntityExposedExpression[] {
        throw new Error("Method not implemented.");
    }
    addLinkedEntity(expression: ComponentFramework.PropertyHelper.DataSetApi.LinkEntityExposedExpression): void {
        throw new Error("Method not implemented.");
    }
    
}

class Record implements IEntityRecord {
    private _context: ComponentFramework.Context<any, any>;
    constructor(context: ComponentFramework.Context<any, any>) {
        this._context = context;
    }
    getFormattedValue(columnName: string): string {
        return exampleValue;
    }
    getRecordId(): string {
        return "000"
    }
    getValue(columnName: string): string | number | boolean | ComponentFramework.EntityReference | Date | number[] | ComponentFramework.EntityReference[] | ComponentFramework.LookupValue | ComponentFramework.LookupValue[] {
        return exampleValue;
    }
    getNamedReference(): ComponentFramework.EntityReference {
        throw new Error("Method not implemented.");
    }
    async save(): Promise<void> {

    }
    setValue(columnName: string, value: any) {
        exampleValue = value;
        this._context.factory.requestRender();
    }
    
}