import { DataType, DataTypes, IColumn, IRawRecord, Operators } from '@talxis/client-libraries'

export const PRIMARY_ID = 'mem_taskid'

/**
 * What a provider would say about a column, for a column the grid should be able to sort and filter.
 *
 * The sorting module asks for `IsValidForGrid` and the filtering module for the operators a column
 * supports, so a fixture without them renders a header that offers nothing.
 */
const gridMetadata = (dataType: DataType, canBeGrouped: boolean = false) => ({
    IsValidForGrid: true,
    IsValidForUpdate: true,
    SupportedFilterConditionOperators: Operators.GetOperatorsForDataType(dataType).map(operator => operator.Value),
    //the grouping module offers a column in its menu only if the provider says it can be grouped, so the
    //ones that would make sense to group by are the ones that say so
    CanBeGrouped: canBeGrouped,
})

export const COLUMNS: IColumn[] = [
    {
        name: 'name', dataType: DataTypes.SingleLineText, displayName: 'Name', visualSizeFactor: 260,
        metadata: gridMetadata(DataTypes.SingleLineText),
    },
    {
        name: 'owner', dataType: DataTypes.SingleLineText, displayName: 'Owner', visualSizeFactor: 160,
        metadata: gridMetadata(DataTypes.SingleLineText, true),
    },
    {
        name: 'status', dataType: DataTypes.OptionSet, displayName: 'Status', visualSizeFactor: 140,
        metadata: {
            ...gridMetadata(DataTypes.OptionSet, true),
            OptionSet: [
                { Value: 1, Label: 'Not started', Color: '#a4262c' },
                { Value: 2, Label: 'In progress', Color: '#c19c00' },
                { Value: 3, Label: 'Done', Color: '#107c10' },
            ],
        },
    },
    {
        name: 'estimate', dataType: DataTypes.Decimal, displayName: 'Estimate', visualSizeFactor: 110,
        metadata: {
            ...gridMetadata(DataTypes.Decimal),
            //what the aggregation module offers in this column's menu
            SupportedAggregations: ['sum', 'avg', 'max', 'min'],
        },
    },
    {
        name: 'due', dataType: DataTypes.DateAndTimeDateOnly, displayName: 'Due', visualSizeFactor: 130,
        metadata: gridMetadata(DataTypes.DateAndTimeDateOnly),
    },
]

const OWNERS = ['Ada', 'Grace', 'Alan', 'Edsger']
const STATUSES = [1, 2, 3]

export const DATA_SOURCE: IRawRecord[] = Array.from({ length: 40 }, (_, index) => ({
    [PRIMARY_ID]: `task-${index + 1}`,
    name: `Task ${index + 1}`,
    owner: OWNERS[index % OWNERS.length],
    status: STATUSES[index % STATUSES.length],
    estimate: (index % 8) + 1,
    due: new Date(2026, index % 12, (index % 27) + 1).toISOString(),
}))
