import { AggregationFunction, DataType, DataTypes, IColumn, IRawRecord, MemoryDataProvider, Operators } from '@talxis/client-libraries'

export const DOCS_PRIMARY_ID = 'docs_dealid'

const SUPPORTED_AGGREGATIONS: AggregationFunction[] = ['sum', 'avg', 'max', 'min']

const STAGE_OPTIONS = [
    { Value: 1, Label: 'Qualify', Color: '#605e5c' },
    { Value: 2, Label: 'Propose', Color: '#0078d4' },
    { Value: 3, Label: 'Negotiate', Color: '#c19c00' },
    { Value: 4, Label: 'Won', Color: '#107c10' },
]

const RECURRING_OPTIONS = [
    { Value: 0, Label: 'No', Color: '#605e5c' },
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
    { name: 'name', dataType: DataTypes.SingleLineText, displayName: 'Deal', visualSizeFactor: 230, metadata: metadataFor(DataTypes.SingleLineText) },
    { name: 'owner', dataType: DataTypes.SingleLineText, displayName: 'Account manager', visualSizeFactor: 160, metadata: metadataFor(DataTypes.SingleLineText) },
    { name: 'stage', dataType: DataTypes.OptionSet, displayName: 'Stage', visualSizeFactor: 130, metadata: { ...metadataFor(DataTypes.OptionSet), OptionSet: STAGE_OPTIONS } },
    { name: 'value', dataType: DataTypes.Currency, displayName: 'Value', visualSizeFactor: 130, metadata: { ...metadataFor(DataTypes.Currency), SupportedAggregations: SUPPORTED_AGGREGATIONS } },
    { name: 'probability', dataType: DataTypes.WholeNone, displayName: 'Probability (%)', visualSizeFactor: 130, metadata: { ...metadataFor(DataTypes.WholeNone), SupportedAggregations: SUPPORTED_AGGREGATIONS } },
    { name: 'closedate', dataType: DataTypes.DateAndTimeDateOnly, displayName: 'Close date', visualSizeFactor: 120, metadata: metadataFor(DataTypes.DateAndTimeDateOnly) },
    { name: 'timespent', dataType: DataTypes.WholeDuration, displayName: 'Time spent', visualSizeFactor: 120, metadata: { ...metadataFor(DataTypes.WholeDuration), SupportedAggregations: SUPPORTED_AGGREGATIONS } },
    { name: 'recurring', dataType: DataTypes.TwoOptions, displayName: 'Recurring', visualSizeFactor: 100, metadata: { ...metadataFor(DataTypes.TwoOptions), OptionSet: RECURRING_OPTIONS } },
]

const ACCOUNTS = ['Contoso', 'Fabrikam', 'Northwind', 'Adventure Works', 'Litware', 'Tailspin Toys', 'Woodgrove Bank', 'Proseware', 'Alpine Ski House', 'Wide World Importers']
const DEALS = ['CRM rollout', 'Support renewal', 'Data migration', 'Licence upgrade', 'Onboarding package']
const OWNERS = ['Anna Novak', 'Ben Carter', 'Chloé Martin', 'David Kim']
const PROBABILITIES = [20, 45, 70, 100]
//in minutes, as a duration column holds them
const TIME_SPENT = [30, 90, 240, 480, 960, 1440, 2880]

export const DOCS_ROWS: IRawRecord[] = Array.from({ length: 30 }, (_, index) => ({
    [DOCS_PRIMARY_ID]: `deal-${index + 1}`,
    name: `${ACCOUNTS[index % ACCOUNTS.length]}: ${DEALS[index % DEALS.length]}`,
    owner: OWNERS[index % OWNERS.length],
    stage: (index % STAGE_OPTIONS.length) + 1,
    value: 4000 + ((index * 7) % 12) * 2500,
    //a few open deals are lost
    probability: index % 9 === 4 ? 0 : PROBABILITIES[index % PROBABILITIES.length],
    closedate: index % 6 === 0 ? null : new Date(2026, index % 12, (index % 27) + 1).toISOString(),
    timespent: TIME_SPENT[index % TIME_SPENT.length],
    recurring: index % 3 !== 0,
}))

/** A provider over the docs deals, not yet loaded. */
export const createDocsProvider = (): MemoryDataProvider => {
    const provider = new MemoryDataProvider({
        dataSource: DOCS_ROWS.map(row => ({ ...row })),
        metadata: {
            PrimaryIdAttribute: DOCS_PRIMARY_ID,
            PrimaryNameAttribute: 'name',
            LogicalName: 'docs_deal',
            EntitySetName: 'docs_deals',
        },
    })
    provider.setColumns(DOCS_COLUMNS)
    provider.getPaging().setPageSize(DOCS_ROWS.length)
    return provider
}
