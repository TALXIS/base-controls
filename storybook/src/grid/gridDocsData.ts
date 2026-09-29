import { AggregationFunction, DataType, DataTypes, IColumn, IRawRecord, MemoryDataProvider, Operators } from '@talxis/client-libraries'

export const DOCS_PRIMARY_ID = 'docs_taskid'

const SUPPORTED_AGGREGATIONS: AggregationFunction[] = ['sum', 'avg', 'max', 'min']

const STATUS_OPTIONS = [
    { Value: 1, Label: 'Not started', Color: '#a4262c' },
    { Value: 2, Label: 'In progress', Color: '#c19c00' },
    { Value: 3, Label: 'In review', Color: '#0078d4' },
    { Value: 4, Label: 'Done', Color: '#107c10' },
]

const BILLABLE_OPTIONS = [
    { Value: 0, Label: 'No', Color: '#a4262c' },
    { Value: 1, Label: 'Yes', Color: '#107c10' },
]

//the keys the sorting, filtering, grouping and editing features read off a column
const metadataFor = (dataType: DataType) => ({
    IsValidForGrid: true,
    IsValidForUpdate: true,
    CanBeGrouped: true,
    SupportedFilterConditionOperators: Operators.GetOperatorsForDataType(dataType).map(operator => operator.Value),
})

export const DOCS_COLUMNS: IColumn[] = [
    { name: 'name', dataType: DataTypes.SingleLineText, displayName: 'Task', visualSizeFactor: 220, metadata: metadataFor(DataTypes.SingleLineText) },
    { name: 'owner', dataType: DataTypes.SingleLineText, displayName: 'Owner', visualSizeFactor: 140, metadata: metadataFor(DataTypes.SingleLineText) },
    { name: 'status', dataType: DataTypes.OptionSet, displayName: 'Status', visualSizeFactor: 140, metadata: { ...metadataFor(DataTypes.OptionSet), OptionSet: STATUS_OPTIONS } },
    { name: 'estimate', dataType: DataTypes.Decimal, displayName: 'Estimate (days)', visualSizeFactor: 140, metadata: { ...metadataFor(DataTypes.Decimal), SupportedAggregations: SUPPORTED_AGGREGATIONS } },
    { name: 'progress', dataType: DataTypes.WholeNone, displayName: 'Progress (%)', visualSizeFactor: 120, metadata: { ...metadataFor(DataTypes.WholeNone), SupportedAggregations: SUPPORTED_AGGREGATIONS } },
    { name: 'due', dataType: DataTypes.DateAndTimeDateOnly, displayName: 'Due', visualSizeFactor: 120, metadata: metadataFor(DataTypes.DateAndTimeDateOnly) },
    { name: 'budget', dataType: DataTypes.Currency, displayName: 'Budget', visualSizeFactor: 130, metadata: { ...metadataFor(DataTypes.Currency), SupportedAggregations: SUPPORTED_AGGREGATIONS } },
    { name: 'billable', dataType: DataTypes.TwoOptions, displayName: 'Billable', visualSizeFactor: 100, metadata: { ...metadataFor(DataTypes.TwoOptions), OptionSet: BILLABLE_OPTIONS } },
]

const TASKS = ['Draft the brief', 'Interview users', 'Sketch the flows', 'Build the prototype', 'Write the API', 'Review the design', 'Plan the release', 'Fix the backlog', 'Update the docs', 'Run the pilot']
const OWNERS = ['Anna Novak', 'Ben Carter', 'Chloé Martin', 'David Kim']

export const DOCS_ROWS: IRawRecord[] = Array.from({ length: 30 }, (_, index) => ({
    [DOCS_PRIMARY_ID]: `task-${index + 1}`,
    name: `${TASKS[index % TASKS.length]} ${Math.floor(index / TASKS.length) + 1}`,
    owner: OWNERS[index % OWNERS.length],
    status: (index % STATUS_OPTIONS.length) + 1,
    estimate: (index % 7) + 0.5,
    progress: (index * 17) % 101,
    due: index % 6 === 0 ? null : new Date(2026, index % 12, (index % 27) + 1).toISOString(),
    budget: 1500 + (index % 9) * 875,
    billable: index % 3 !== 0,
}))

/** A provider over the docs tasks, loaded and ready to hand to `Grid.Root`. */
export const createDocsProvider = (): MemoryDataProvider => {
    const provider = new MemoryDataProvider({
        dataSource: DOCS_ROWS.map(row => ({ ...row })),
        metadata: {
            PrimaryIdAttribute: DOCS_PRIMARY_ID,
            PrimaryNameAttribute: 'name',
            LogicalName: 'docs_task',
            EntitySetName: 'docs_tasks',
        },
    })
    provider.setColumns(DOCS_COLUMNS)
    provider.getPaging().setPageSize(DOCS_ROWS.length)
    return provider
}
