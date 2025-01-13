import { DataType, IAttributeMetadata, MemoryDataProvider } from "@talxis/client-libraries";

export class FieldValue<T> {
    private _memoryProvider: MemoryDataProvider
    private readonly _columnName = 'column';
    private readonly _idColumnName = 'id';
    constructor(value: any, dataType: DataType, metadata?: any) {
        this._memoryProvider = new MemoryDataProvider([{
            [this._idColumnName]: 'id',
            ...this._getDataSourceValue(dataType, value)
        }]);
        this._memoryProvider.setColumns([
            {
                name: this._columnName,
                dataType: dataType,
                alias: this._columnName,
                displayName: '',
                order: 0,
                visualSizeFactor: 0,
                metadata: metadata
            }
        ])
        this._memoryProvider.setMetadata({
            PrimaryIdAttribute: this._idColumnName
        });
        this._memoryProvider.refresh();
    }

    public getFormattedValue() {
        return this._getValue().getFormattedValue(this._columnName);
    }

    private _getValue() {
        return this._memoryProvider.getRecords()[0];
    }

    private _getDataSourceValue(dataType: DataType, value: any): any {
        if(dataType.includes('Lookup')) {
            const lookupValue: ComponentFramework.LookupValue | undefined = value?.[0] ?? null
            return {
               [`_${this._columnName}_value`]: lookupValue?.id ?? null,
               [`_${this._columnName}_value@Microsoft.Dynamics.CRM.lookuplogicalname`]: lookupValue?.entityType ?? null,
               [`_${this._columnName}_value@OData.Community.Display.V1.FormattedValue`]: lookupValue?.name ?? null
            }
        }
        return {
            [this._columnName]: value
        }
    }
}