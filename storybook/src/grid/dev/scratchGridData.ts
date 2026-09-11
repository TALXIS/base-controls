import { AggregationFunction, DataType, DataTypes, IColumn, IRawRecord, Operators } from '@talxis/client-libraries'

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

/** What the aggregation module offers in a number column's menu. */
const SUPPORTED_AGGREGATIONS: AggregationFunction[] = ['sum', 'avg', 'max', 'min']

export const STATUS_OPTIONS = [
    { Value: 1, Label: 'Not started', Color: '#a4262c' },
    { Value: 2, Label: 'In progress', Color: '#c19c00' },
    { Value: 3, Label: 'Done', Color: '#107c10' },
    { Value: 4, Label: 'Blocked', Color: '#d13438' },
    { Value: 5, Label: 'In review', Color: '#0078d4' },
    { Value: 6, Label: 'Deferred', Color: '#605e5c' },
]

/**
 * Enough of them, in enough colours, to see a row of options run out of room.
 *
 * The palette is deliberately uneven - a fluorescent green and a washed-out grey among the rest - since
 * what a tag does with an arbitrary colour is the thing worth looking at. `Onboarding` carries no colour
 * at all, which is the neutral tag.
 */
export const TAG_OPTIONS = [
    { Value: 10, Label: 'Backend', Color: '#0078d4' },
    { Value: 20, Label: 'Frontend', Color: '#8764b8' },
    { Value: 30, Label: 'Docs', Color: '#498205' },
    { Value: 40, Label: 'Design', Color: '#e3008c' },
    { Value: 50, Label: 'Infrastructure', Color: '#005b70' },
    { Value: 60, Label: 'Testing', Color: '#ca5010' },
    { Value: 70, Label: 'Accessibility', Color: '#00ff7f' },
    { Value: 80, Label: 'Performance', Color: '#b146c2' },
    { Value: 90, Label: 'Security', Color: '#d13438' },
    { Value: 100, Label: 'Internationalization', Color: '#c8c6c4' },
    { Value: 110, Label: 'Analytics', Color: '#038387' },
    { Value: 120, Label: 'Release engineering', Color: '#986f0b' },
    { Value: 130, Label: 'Onboarding', Color: '' },
]

const BILLABLE_OPTIONS = [
    { Value: 0, Label: 'No', Color: '#605e5c' },
    { Value: 1, Label: 'Yes', Color: '#107c10' },
]

/**
 * One column per data type, so the grid can be seen rendering every one of them.
 *
 * `DataTypes.GetAll()` is the list this is kept against, plus `Lookup.Regarding`, which the list omits.
 * The first columns are the ones worth grouping, sorting and totalling by; the rest are here to be looked
 * at. Widen the story or scroll sideways — there are more columns than fit.
 */
export const COLUMNS: IColumn[] = [
    {
        name: 'name', dataType: DataTypes.SingleLineText, displayName: 'Name', visualSizeFactor: 220,
        metadata: gridMetadata(DataTypes.SingleLineText),
    },
    {
        name: 'owner', dataType: DataTypes.SingleLineText, displayName: 'Owner', visualSizeFactor: 130,
        metadata: gridMetadata(DataTypes.SingleLineText, true),
    },
    {
        name: 'status', dataType: DataTypes.OptionSet, displayName: 'Status', visualSizeFactor: 140,
        metadata: { ...gridMetadata(DataTypes.OptionSet, true), OptionSet: STATUS_OPTIONS },
    },
    {
        name: 'estimate', dataType: DataTypes.Decimal, displayName: 'Estimate', visualSizeFactor: 110,
        metadata: { ...gridMetadata(DataTypes.Decimal), SupportedAggregations: SUPPORTED_AGGREGATIONS },
    },
    {
        name: 'due', dataType: DataTypes.DateAndTimeDateOnly, displayName: 'Due', visualSizeFactor: 120,
        metadata: gridMetadata(DataTypes.DateAndTimeDateOnly),
    },
    {
        name: 'summary', dataType: DataTypes.SingleLineTextArea, displayName: 'Summary', visualSizeFactor: 220,
        metadata: gridMetadata(DataTypes.SingleLineTextArea),
    },
    {
        name: 'email', dataType: DataTypes.SingleLineEmail, displayName: 'Email', visualSizeFactor: 190,
        metadata: gridMetadata(DataTypes.SingleLineEmail),
    },
    {
        name: 'phone', dataType: DataTypes.SingleLinePhone, displayName: 'Phone', visualSizeFactor: 150,
        metadata: gridMetadata(DataTypes.SingleLinePhone),
    },
    {
        name: 'url', dataType: DataTypes.SingleLineUrl, displayName: 'Url', visualSizeFactor: 200,
        metadata: gridMetadata(DataTypes.SingleLineUrl),
    },
    {
        name: 'notes', dataType: DataTypes.Multiple, displayName: 'Notes', visualSizeFactor: 240, autoHeight: true,
        metadata: gridMetadata(DataTypes.Multiple),
    },
    {
        name: 'priority', dataType: DataTypes.WholeNone, displayName: 'Priority', visualSizeFactor: 100,
        metadata: {
            ...gridMetadata(DataTypes.WholeNone, true),
            SupportedAggregations: SUPPORTED_AGGREGATIONS,
        },
    },
    {
        name: 'budget', dataType: DataTypes.Currency, displayName: 'Budget', visualSizeFactor: 120,
        metadata: { ...gridMetadata(DataTypes.Currency), SupportedAggregations: SUPPORTED_AGGREGATIONS },
    },
    {
        name: 'createdon', dataType: DataTypes.DateAndTimeDateAndTime, displayName: 'Created On', visualSizeFactor: 180,
        metadata: gridMetadata(DataTypes.DateAndTimeDateAndTime),
    },
    {
        name: 'tags', dataType: DataTypes.MultiSelectOptionSet, displayName: 'Tags', visualSizeFactor: 200,
        metadata: { ...gridMetadata(DataTypes.MultiSelectOptionSet), OptionSet: TAG_OPTIONS },
    },
    {
        name: 'billable', dataType: DataTypes.TwoOptions, displayName: 'Billable', visualSizeFactor: 110,
        metadata: { ...gridMetadata(DataTypes.TwoOptions, true), OptionSet: BILLABLE_OPTIONS },
    },
    {
        name: 'project', dataType: DataTypes.LookupSimple, displayName: 'Project', visualSizeFactor: 160,
        metadata: { ...gridMetadata(DataTypes.LookupSimple), Targets: ['mem_project'] },
    },
    {
        name: 'assignedto', dataType: DataTypes.LookupOwner, displayName: 'Assigned To', visualSizeFactor: 160,
        metadata: { ...gridMetadata(DataTypes.LookupOwner), Targets: ['systemuser'] },
    },
    {
        name: 'customer', dataType: DataTypes.LookupCustomer, displayName: 'Customer', visualSizeFactor: 160,
        metadata: { ...gridMetadata(DataTypes.LookupCustomer), Targets: ['account', 'contact'] },
    },
    {
        name: 'regarding', dataType: DataTypes.LookupRegarding, displayName: 'Regarding', visualSizeFactor: 160,
        metadata: { ...gridMetadata(DataTypes.LookupRegarding), Targets: ['mem_task'] },
    },
    {
        name: 'duration', dataType: DataTypes.WholeDuration, displayName: 'Duration', visualSizeFactor: 120,
        metadata: {
            ...gridMetadata(DataTypes.WholeDuration),
            SupportedAggregations: SUPPORTED_AGGREGATIONS,
        },
    },
    {
        name: 'language', dataType: DataTypes.WholeLanguage, displayName: 'Language', visualSizeFactor: 120,
        metadata: gridMetadata(DataTypes.WholeLanguage),
    },
    {
        name: 'timezone', dataType: DataTypes.WholeTimeZone, displayName: 'Time Zone', visualSizeFactor: 120,
        metadata: gridMetadata(DataTypes.WholeTimeZone),
    },
    {
        name: 'attachment', dataType: DataTypes.File, displayName: 'Attachment', visualSizeFactor: 170,
        metadata: gridMetadata(DataTypes.File),
    },
    {
        name: 'photo', dataType: DataTypes.Image, displayName: 'Photo', visualSizeFactor: 140,
        metadata: gridMetadata(DataTypes.Image),
    },
    {
        name: 'kind', dataType: DataTypes.Enum, displayName: 'Kind', visualSizeFactor: 120,
        metadata: gridMetadata(DataTypes.Enum),
    },
    {
        name: 'payload', dataType: DataTypes.Object, displayName: 'Payload', visualSizeFactor: 160,
        metadata: gridMetadata(DataTypes.Object),
    },
]

/**
 * A lookup as the raw record carries it: an id, the entity it points at, and the name to show.
 *
 * Three keys rather than one object, because that is the shape a record reads a lookup from — the value
 * the grid gets is assembled from them.
 */
const lookup = (columnName: string, entityName: string, id: string, name: string) => ({
    [`_${columnName}_value`]: id,
    [`_${columnName}_value@Microsoft.Dynamics.CRM.lookuplogicalname`]: entityName,
    [`_${columnName}_value@OData.Community.Display.V1.FormattedValue`]: name,
})

const OWNERS = ['Ada', 'Grace', 'Alan', 'Edsger']
const STATUSES = [1, 2, 3, 4, 5, 6]
//sets of every size worth seeing: none, one, a few, more than a narrow column holds, and all of them
const TAGS = [
    [10],
    [20, 30],
    [10, 20, 30, 40],
    [],
    [10, 20, 30, 40, 50, 60, 70],
    [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130],
    [50, 90],
    [100, 120, 130],
]
const KINDS = ['Feature', 'Bug', 'Chore']
const LANGUAGES = [1033, 1029, 1031]
const TIME_ZONES = [85, 105, 190]
//a 1x1 transparent PNG, so the image column has something of its own to show without fetching anything
const PIXEL = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

export const DATA_SOURCE: IRawRecord[] = Array.from({ length: 40 }, (_, index) => {
    const number = index + 1
    return {
        [PRIMARY_ID]: `task-${number}`,
        name: `Task ${number}`,
        owner: OWNERS[index % OWNERS.length],
        status: STATUSES[index % STATUSES.length],
        estimate: (index % 8) + 1,
        //every seventh row leaves it out, so an empty cell is part of what the story shows
        due: index % 7 === 0 ? null : new Date(2026, index % 12, (index % 27) + 1).toISOString(),
        summary: `Short summary of task ${number}`,
        email: `owner${number}@example.com`,
        phone: `+420 777 000 ${`${number}`.padStart(3, '0')}`,
        url: `https://example.com/tasks/${number}`,
        notes: `Line one of the notes for task ${number}.\nLine two, so the column has more than one.`,
        priority: (index % 5) + 1,
        budget: (index % 9) * 1250.5,
        createdon: new Date(2026, index % 12, (index % 27) + 1, index % 24, index % 60).toISOString(),
        tags: TAGS[index % TAGS.length],
        billable: index % 3 !== 0,
        ...lookup('project', 'mem_project', `project-${(index % 4) + 1}`, `Project ${(index % 4) + 1}`),
        ...lookup('assignedto', 'systemuser', `user-${(index % 4) + 1}`, OWNERS[index % OWNERS.length]!),
        ...lookup('customer', index % 2 === 0 ? 'account' : 'contact', `customer-${(index % 3) + 1}`,
            index % 2 === 0 ? `Account ${(index % 3) + 1}` : `Contact ${(index % 3) + 1}`),
        ...lookup('regarding', 'mem_task', `task-${((index + 1) % 40) + 1}`, `Task ${((index + 1) % 40) + 1}`),
        duration: (index % 6) * 30 + 15,
        language: LANGUAGES[index % LANGUAGES.length],
        timezone: TIME_ZONES[index % TIME_ZONES.length],
        attachment: `attachment-${number}`,
        'attachment.filename': `task-${number}.pdf`,
        'attachment.filesizeinbytes': 20480 + index * 512,
        'attachment.mimetype': 'application/pdf',
        'attachment.fileurl': `https://example.com/files/task-${number}.pdf`,
        photo: PIXEL,
        'photo.filename': `task-${number}.png`,
        'photo.filesizeinbytes': 68,
        'photo.mimetype': 'image/png',
        'photo.thumbnailurl': `data:image/png;base64,${PIXEL}`,
        kind: KINDS[index % KINDS.length],
        //serialized rather than an object: a cell renders what it is given, and React refuses an object
        payload: JSON.stringify({ retries: index % 3, source: 'scratch' }),
    }
})
