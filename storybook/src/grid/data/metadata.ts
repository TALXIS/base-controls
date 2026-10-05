import { AggregationFunction, DataType, DataTypes, IColumn, MemoryDataProvider, Operators } from '@talxis/client-libraries'

export const SUPPORTED_AGGREGATIONS: AggregationFunction[] = ['sum', 'avg', 'max', 'min']

const isFileType = (dataType: DataType) => dataType === DataTypes.File || dataType === DataTypes.Image

/** The keys sorting, filtering, grouping and editing read off a column, switched on where the type allows. */
export const metadataFor = (dataType: DataType) => ({
    IsValidForGrid: true,
    IsValidForUpdate: !isFileType(dataType),
    CanBeGrouped: !isFileType(dataType),
    SupportedFilterConditionOperators: Operators.GetOperatorsForDataType(dataType).map(operator => operator.Value),
})

/** The same keys, with the totals a number column offers. */
export const numberMetadataFor = (dataType: DataType) => ({ ...metadataFor(dataType), SupportedAggregations: SUPPORTED_AGGREGATIONS })

export interface IDocsProviderOptions {
    primaryIdAttribute: string
    primaryNameAttribute: string
    logicalName: string
    rows: { [columnName: string]: any }[]
    columns: IColumn[]
}

/** An in-memory provider over a copy of the rows, every row on one page, not yet loaded. */
export const createMemoryProvider = (options: IDocsProviderOptions): MemoryDataProvider => {
    return new MemoryDataProvider({
        dataSource: options.rows.map(row => ({ ...row })),
        metadata: {
            PrimaryIdAttribute: options.primaryIdAttribute,
            PrimaryNameAttribute: options.primaryNameAttribute,
            LogicalName: options.logicalName,
            EntitySetName: options.logicalName + 's',
        },
        columns: options.columns,
    })
}
