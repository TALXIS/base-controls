import dayjs from 'dayjs'
import { DataTypes, IColumn, IRawRecord, MemoryDataProvider } from '@talxis/client-libraries'
import { createMemoryProvider, metadataFor, numberMetadataFor } from './metadata'

export const TICKET_PRIORITY = { high: 1, normal: 2, low: 3 } as const
export const TICKET_STATUS = { new: 1, inProgress: 2, waiting: 3, resolved: 4 } as const

const PRIORITY_OPTIONS = [
    { Value: TICKET_PRIORITY.high, Label: 'High', Color: '#a4262c' },
    { Value: TICKET_PRIORITY.normal, Label: 'Normal', Color: '#c19c00' },
    { Value: TICKET_PRIORITY.low, Label: 'Low', Color: '#605e5c' },
]

const STATUS_OPTIONS = [
    { Value: TICKET_STATUS.new, Label: 'New', Color: '#0078d4' },
    { Value: TICKET_STATUS.inProgress, Label: 'In progress', Color: '#8764b8' },
    { Value: TICKET_STATUS.waiting, Label: 'Waiting on customer', Color: '#ca5010' },
    { Value: TICKET_STATUS.resolved, Label: 'Resolved', Color: '#107c10' },
]

const CHANNEL_OPTIONS = [
    { Value: 1, Label: 'Email', Color: '#0078d4' },
    { Value: 2, Label: 'Phone', Color: '#038387' },
    { Value: 3, Label: 'Chat', Color: '#8764b8' },
    { Value: 4, Label: 'Portal', Color: '#605e5c' },
]

const ESCALATED_OPTIONS = [
    { Value: 0, Label: 'No', Color: '#605e5c' },
    { Value: 1, Label: 'Yes', Color: '#a4262c' },
]

export const TICKET_COLUMNS: IColumn[] = [
    { name: 'ticketnumber', dataType: DataTypes.SingleLineText, displayName: 'Ticket', visualSizeFactor: 110, metadata: metadataFor(DataTypes.SingleLineText) },
    { name: 'title', dataType: DataTypes.SingleLineText, displayName: 'Subject', visualSizeFactor: 260, metadata: metadataFor(DataTypes.SingleLineText) },
    { name: 'customer', dataType: DataTypes.SingleLineText, displayName: 'Customer', visualSizeFactor: 150, metadata: metadataFor(DataTypes.SingleLineText) },
    { name: 'priority', dataType: DataTypes.OptionSet, displayName: 'Priority', visualSizeFactor: 100, metadata: { ...metadataFor(DataTypes.OptionSet), OptionSet: PRIORITY_OPTIONS } },
    { name: 'status', dataType: DataTypes.OptionSet, displayName: 'Status', visualSizeFactor: 170, metadata: { ...metadataFor(DataTypes.OptionSet), OptionSet: STATUS_OPTIONS } },
    { name: 'channel', dataType: DataTypes.OptionSet, displayName: 'Channel', visualSizeFactor: 100, metadata: { ...metadataFor(DataTypes.OptionSet), OptionSet: CHANNEL_OPTIONS } },
    { name: 'assignee', dataType: DataTypes.SingleLineText, displayName: 'Assigned to', visualSizeFactor: 140, metadata: metadataFor(DataTypes.SingleLineText) },
    { name: 'createdon', dataType: DataTypes.DateAndTimeDateAndTime, displayName: 'Opened', visualSizeFactor: 160, metadata: metadataFor(DataTypes.DateAndTimeDateAndTime) },
    { name: 'duedate', dataType: DataTypes.DateAndTimeDateAndTime, displayName: 'Respond by', visualSizeFactor: 160, metadata: metadataFor(DataTypes.DateAndTimeDateAndTime) },
    { name: 'timespent', dataType: DataTypes.WholeDuration, displayName: 'Time spent', visualSizeFactor: 110, metadata: numberMetadataFor(DataTypes.WholeDuration) },
    { name: 'escalated', dataType: DataTypes.TwoOptions, displayName: 'Escalated', visualSizeFactor: 100, metadata: { ...metadataFor(DataTypes.TwoOptions), OptionSet: ESCALATED_OPTIONS } },
]

const SUBJECTS = [
    'Cannot sign in after password reset',
    'Invoice shows the wrong VAT rate',
    'Export to Excel times out',
    'Request: add a field to the order form',
    'Dashboard loads slowly in the morning',
    'Duplicate contacts after the import',
    'Mobile app crashes on startup',
    'Question about the renewal price',
]
const CUSTOMERS = ['Contoso', 'Fabrikam', 'Northwind', 'Adventure Works', 'Litware', 'Tailspin Toys', 'Woodgrove Bank']
const AGENTS = ['Eva Horák', 'Frank Li', 'Grace Okafor']
const PRIORITIES = [TICKET_PRIORITY.high, TICKET_PRIORITY.normal, TICKET_PRIORITY.normal, TICKET_PRIORITY.low, TICKET_PRIORITY.high]
const STATUSES = [TICKET_STATUS.new, TICKET_STATUS.inProgress, TICKET_STATUS.waiting, TICKET_STATUS.resolved, TICKET_STATUS.inProgress, TICKET_STATUS.resolved]
//in minutes, as a duration column holds them
const TIME_SPENT = [15, 45, 90, 30, 240, 60, 120]
//how long each priority has to get a first answer, in hours
const RESPONSE_HOURS: { [priority: number]: number } = { 1: 4, 2: 24, 3: 72 }

const now = dayjs().startOf('hour')

export const TICKET_ROWS: IRawRecord[] = Array.from({ length: 36 }, (_, index) => {
    const priority = PRIORITIES[index % PRIORITIES.length]
    const createdOn = now.subtract(2 + index * 5, 'hour')
    const status = STATUSES[index % STATUSES.length]
    return {
        docs_ticketid: `ticket-${index + 1}`,
        ticketnumber: `CAS-${String(1040 + index).padStart(5, '0')}`,
        title: SUBJECTS[index % SUBJECTS.length],
        customer: CUSTOMERS[index % CUSTOMERS.length],
        priority,
        status,
        channel: (index % CHANNEL_OPTIONS.length) + 1,
        assignee: status === TICKET_STATUS.new ? '' : AGENTS[index % AGENTS.length],
        createdon: createdOn.toISOString(),
        duedate: createdOn.add(RESPONSE_HOURS[priority], 'hour').toISOString(),
        timespent: status === TICKET_STATUS.new ? 0 : TIME_SPENT[index % TIME_SPENT.length],
        escalated: index % 7 === 2,
    }
})

/** A support desk's ticket queue, opened over the last week, not yet loaded. */
export const createTicketsProvider = (): MemoryDataProvider => createMemoryProvider({
    primaryIdAttribute: 'docs_ticketid',
    primaryNameAttribute: 'title',
    logicalName: 'docs_ticket',
    rows: TICKET_ROWS,
    columns: TICKET_COLUMNS,
})
