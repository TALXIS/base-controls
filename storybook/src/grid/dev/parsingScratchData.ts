import { DataType, DataTypes, IColumn, IFormatting, IRawRecord, Operators } from '@talxis/client-libraries'

export const PRIMARY_ID = 'mem_parseid'

const gridMetadata = (dataType: DataType) => ({
    IsValidForGrid: true,
    IsValidForUpdate: true,
    SupportedFilterConditionOperators: Operators.GetOperatorsForDataType(dataType).map(operator => operator.Value),
})

const dateMetadata = (dataType: DataType, behavior: 1 | 2 | 3) => ({ ...gridMetadata(dataType), Behavior: behavior })

const STAGE_OPTIONS = [
    { Value: 1, Label: 'Qualify', Color: '#0078d4' },
    { Value: 2, Label: 'Develop', Color: '#8764b8' },
    { Value: 3, Label: 'Propose', Color: '#c19c00' },
    { Value: 4, Label: 'Close', Color: '#107c10' },
]

const YES_NO_OPTIONS = [
    { Value: 0, Label: 'No', Color: '' },
    { Value: 1, Label: 'Yes', Color: '' },
]

const CHANNEL_OPTIONS = [
    { Value: 10, Label: 'Email', Color: '' },
    { Value: 20, Label: 'Phone', Color: '' },
    { Value: 30, Label: 'Web', Color: '' },
    { Value: 40, Label: 'Partner', Color: '' },
]

/** The columns a value is parsed into, and what their stored strings are read back with. */
export const DATE_COLUMN_NAMES = ['userlocal', 'userlocaldate', 'tzi', 'tzidate', 'dateonly']

export const COLUMNS: IColumn[] = [
    { name: 'name', dataType: DataTypes.SingleLineText, displayName: 'Case', visualSizeFactor: 420, metadata: gridMetadata(DataTypes.SingleLineText) },
    { name: 'userlocal', dataType: DataTypes.DateAndTimeDateAndTime, displayName: 'User local', visualSizeFactor: 170, metadata: dateMetadata(DataTypes.DateAndTimeDateAndTime, 1) },
    { name: 'userlocaldate', dataType: DataTypes.DateAndTimeDateOnly, displayName: 'User local (date format)', visualSizeFactor: 170, metadata: dateMetadata(DataTypes.DateAndTimeDateOnly, 1) },
    { name: 'tzi', dataType: DataTypes.DateAndTimeDateAndTime, displayName: 'Time zone independent', visualSizeFactor: 170, metadata: dateMetadata(DataTypes.DateAndTimeDateAndTime, 3) },
    { name: 'tzidate', dataType: DataTypes.DateAndTimeDateOnly, displayName: 'TZI (date format)', visualSizeFactor: 150, metadata: dateMetadata(DataTypes.DateAndTimeDateOnly, 3) },
    { name: 'dateonly', dataType: DataTypes.DateAndTimeDateOnly, displayName: 'Date only', visualSizeFactor: 130, metadata: dateMetadata(DataTypes.DateAndTimeDateOnly, 2) },
    { name: 'whole', dataType: DataTypes.WholeNone, displayName: 'Whole number', visualSizeFactor: 120, metadata: gridMetadata(DataTypes.WholeNone) },
    { name: 'decimal', dataType: DataTypes.Decimal, displayName: 'Decimal', visualSizeFactor: 120, metadata: { ...gridMetadata(DataTypes.Decimal), Precision: 2 } },
    { name: 'currency', dataType: DataTypes.Currency, displayName: 'Currency', visualSizeFactor: 130, metadata: { ...gridMetadata(DataTypes.Currency), Precision: 2 } },
    { name: 'duration', dataType: DataTypes.WholeDuration, displayName: 'Duration', visualSizeFactor: 120, metadata: gridMetadata(DataTypes.WholeDuration) },
    { name: 'stage', dataType: DataTypes.OptionSet, displayName: 'Option set', visualSizeFactor: 120, metadata: { ...gridMetadata(DataTypes.OptionSet), OptionSet: STAGE_OPTIONS } },
    { name: 'approved', dataType: DataTypes.TwoOptions, displayName: 'Two options', visualSizeFactor: 110, metadata: { ...gridMetadata(DataTypes.TwoOptions), OptionSet: YES_NO_OPTIONS } },
    { name: 'channels', dataType: DataTypes.MultiSelectOptionSet, displayName: 'Multi select', visualSizeFactor: 170, metadata: { ...gridMetadata(DataTypes.MultiSelectOptionSet), OptionSet: CHANNEL_OPTIONS } },
    { name: 'account', dataType: DataTypes.LookupSimple, displayName: 'Lookup', visualSizeFactor: 140, metadata: { ...gridMetadata(DataTypes.LookupSimple), Targets: ['account'] } },
]

const ACCOUNTS = [
    { id: '00000000-0000-0000-0000-000000000001', name: 'Contoso' },
    { id: '00000000-0000-0000-0000-000000000002', name: 'Fabrikam' },
    { id: '00000000-0000-0000-0000-000000000003', name: 'Northwind' },
]

/** One case: the moment every date column holds, as Dataverse writes it, and a value for the rest. */
interface IParsingCase {
    name: string
    /** What user local and time zone independent columns hold. */
    dateTime: string | null
    /** What a user local column with a date format holds: the instant of a picked day's midnight. */
    userLocalDate: string | null
    /** What a time zone independent column with a date format holds. */
    tziDate: string | null
    dateOnly: string | null
    whole: number | null
    decimal: number | null
    currency: number | null
    duration: number | null
    stage: number | null
    approved: boolean | null
    channels: number[] | null
    account: number | null
}

const CASES: IParsingCase[] = [
    { name: 'Morning', dateTime: '2023-10-15T07:30:00Z', userLocalDate: '2023-10-14T22:00:00Z', tziDate: '2023-10-15T00:00:00Z', dateOnly: '2023-10-15', whole: 1234, decimal: 1234.5, currency: 98765.43, duration: 45, stage: 1, approved: true, channels: [10, 30], account: 0 },
    { name: 'Late evening UTC', dateTime: '2023-10-14T23:30:00Z', userLocalDate: '2023-10-14T07:00:00Z', tziDate: '2023-10-14T00:00:00Z', dateOnly: '2023-10-14', whole: -5, decimal: -0.5, currency: -12, duration: 90, stage: 2, approved: false, channels: [20], account: 1 },
    { name: 'Just after UTC midnight', dateTime: '2023-10-15T00:30:00Z', userLocalDate: '2023-10-15T00:00:00Z', tziDate: '2023-10-15T00:00:00Z', dateOnly: '2023-10-15', whole: 0, decimal: 0, currency: 0, duration: 0, stage: 3, approved: true, channels: [], account: 2 },
    { name: 'Midnight UTC', dateTime: '2024-01-01T00:00:00Z', userLocalDate: '2023-12-31T23:00:00Z', tziDate: '2024-01-01T00:00:00Z', dateOnly: '2024-01-01', whole: 1000000, decimal: 1000000.25, currency: 1000000, duration: 1440, stage: 4, approved: false, channels: [10, 20, 30, 40], account: 0 },
    { name: 'Europe DST starts (no such time in Prague)', dateTime: '2023-03-26T02:30:00Z', userLocalDate: '2023-03-25T23:00:00Z', tziDate: '2023-03-26T00:00:00Z', dateOnly: '2023-03-26', whole: 7, decimal: 7.25, currency: 7.5, duration: 2880, stage: 1, approved: true, channels: [40], account: 1 },
    { name: 'Europe DST ends (twice in Prague)', dateTime: '2023-10-29T02:30:00Z', userLocalDate: '2023-10-28T22:00:00Z', tziDate: '2023-10-29T00:00:00Z', dateOnly: '2023-10-29', whole: 8, decimal: 8.75, currency: 8, duration: 30, stage: 2, approved: false, channels: [10], account: 2 },
    { name: 'US DST starts (no such time in LA)', dateTime: '2023-03-12T02:30:00Z', userLocalDate: '2023-03-12T08:00:00Z', tziDate: '2023-03-12T00:00:00Z', dateOnly: '2023-03-12', whole: 9, decimal: 9.99, currency: 9.99, duration: 600, stage: 3, approved: true, channels: [20, 40], account: 0 },
    { name: 'Leap day', dateTime: '2024-02-29T12:00:00Z', userLocalDate: '2024-02-28T23:00:00Z', tziDate: '2024-02-29T00:00:00Z', dateOnly: '2024-02-29', whole: 29, decimal: 2.29, currency: 229, duration: 120, stage: 4, approved: false, channels: [30], account: 1 },
    { name: 'Written with milliseconds', dateTime: '2023-10-15T07:30:00.000Z', userLocalDate: '2023-10-14T22:00:00.000Z', tziDate: '2023-10-15T00:00:00.000Z', dateOnly: '2023-10-15', whole: 1, decimal: 1.1, currency: 1.1, duration: 1, stage: 1, approved: true, channels: [10], account: 2 },
    { name: 'Empty', dateTime: null, userLocalDate: null, tziDate: null, dateOnly: null, whole: null, decimal: null, currency: null, duration: null, stage: null, approved: null, channels: null, account: null },
]

const toLookup = (index: number | null) => {
    if (index === null) {
        return {}
    }
    const account = ACCOUNTS[index]
    return {
        _account_value: account.id,
        '_account_value@Microsoft.Dynamics.CRM.lookuplogicalname': 'account',
        '_account_value@OData.Community.Display.V1.FormattedValue': account.name,
    }
}

//the moment the row stands for, written out in the formatting's language
const describe = (parsingCase: IParsingCase, formatting: IFormatting): string => {
    if (!parsingCase.dateTime) {
        return parsingCase.name
    }
    const wallClock = formatting.parsing.date.toLocalDate({ value: parsingCase.dateTime, behavior: 3 }).value as Date
    return `${formatting.formatDateLong(wallClock)} ${parsingCase.dateTime.slice(11, 16)} UTC · ${parsingCase.name}`
}

export const getDataSource = (formatting: IFormatting): IRawRecord[] => CASES.map((parsingCase, index) => ({
    [PRIMARY_ID]: `case-${index + 1}`,
    name: describe(parsingCase, formatting),
    userlocal: parsingCase.dateTime,
    userlocaldate: parsingCase.userLocalDate,
    tzi: parsingCase.dateTime,
    tzidate: parsingCase.tziDate,
    dateonly: parsingCase.dateOnly,
    whole: parsingCase.whole,
    decimal: parsingCase.decimal,
    currency: parsingCase.currency,
    duration: parsingCase.duration,
    stage: parsingCase.stage,
    approved: parsingCase.approved,
    channels: parsingCase.channels,
    ...toLookup(parsingCase.account),
}))
