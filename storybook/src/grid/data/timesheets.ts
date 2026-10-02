import dayjs from 'dayjs'
import { DataTypes, IColumn, IRawRecord, MemoryDataProvider } from '@talxis/client-libraries'
import { createMemoryProvider, metadataFor, numberMetadataFor } from './metadata'

export const TIMESHEET_STATUS = { draft: 1, submitted: 2, approved: 3, rejected: 4 } as const

const STATUS_OPTIONS = [
    { Value: TIMESHEET_STATUS.draft, Label: 'Draft', Color: '#605e5c' },
    { Value: TIMESHEET_STATUS.submitted, Label: 'Submitted', Color: '#0078d4' },
    { Value: TIMESHEET_STATUS.approved, Label: 'Approved', Color: '#107c10' },
    { Value: TIMESHEET_STATUS.rejected, Label: 'Rejected', Color: '#a4262c' },
]

const PROJECT_OPTIONS = [
    { Value: 1, Label: 'Contoso CRM rollout', Color: '#038387' },
    { Value: 2, Label: 'Fabrikam data migration', Color: '#8764b8' },
    { Value: 3, Label: 'Northwind support', Color: '#ca5010' },
    { Value: 4, Label: 'Internal', Color: '#605e5c' },
]

const BILLABLE_OPTIONS = [
    { Value: 0, Label: 'No', Color: '#605e5c' },
    { Value: 1, Label: 'Yes', Color: '#107c10' },
]

export const TIMESHEET_COLUMNS: IColumn[] = [
    { name: 'description', dataType: DataTypes.SingleLineText, displayName: 'Work done', visualSizeFactor: 240, metadata: metadataFor(DataTypes.SingleLineText) },
    { name: 'employee', dataType: DataTypes.SingleLineText, displayName: 'Employee', visualSizeFactor: 150, metadata: metadataFor(DataTypes.SingleLineText) },
    { name: 'project', dataType: DataTypes.OptionSet, displayName: 'Project', visualSizeFactor: 200, metadata: { ...metadataFor(DataTypes.OptionSet), OptionSet: PROJECT_OPTIONS } },
    { name: 'date', dataType: DataTypes.DateAndTimeDateOnly, displayName: 'Date', visualSizeFactor: 120, metadata: metadataFor(DataTypes.DateAndTimeDateOnly) },
    { name: 'hours', dataType: DataTypes.Decimal, displayName: 'Hours', visualSizeFactor: 90, metadata: { ...numberMetadataFor(DataTypes.Decimal), Precision: 2 } },
    { name: 'billable', dataType: DataTypes.TwoOptions, displayName: 'Billable', visualSizeFactor: 90, metadata: { ...metadataFor(DataTypes.TwoOptions), OptionSet: BILLABLE_OPTIONS } },
    { name: 'rate', dataType: DataTypes.Currency, displayName: 'Hourly rate', visualSizeFactor: 110, metadata: numberMetadataFor(DataTypes.Currency) },
    { name: 'status', dataType: DataTypes.OptionSet, displayName: 'Status', visualSizeFactor: 120, metadata: { ...metadataFor(DataTypes.OptionSet), OptionSet: STATUS_OPTIONS } },
    { name: 'comment', dataType: DataTypes.Multiple, displayName: 'Comment', visualSizeFactor: 240, metadata: metadataFor(DataTypes.Multiple) },
]

const EMPLOYEES = ['Anna Novak', 'Ben Carter', 'Chloé Martin', 'David Kim']
const WORK = [
    { description: 'Requirements workshop', project: 1, billable: true },
    { description: 'Data mapping', project: 2, billable: true },
    { description: 'Incident triage', project: 3, billable: true },
    { description: 'Team stand-up', project: 4, billable: false },
    { description: 'Configure sales forms', project: 1, billable: true },
    { description: 'Migration dry run', project: 2, billable: true },
    { description: 'Patch deployment', project: 3, billable: true },
    { description: 'Training', project: 4, billable: false },
]
const HOURS = [7.5, 2, 4, 0.5, 6, 3.5, 8, 1.5]
const RATES: { [project: number]: number } = { 1: 120, 2: 110, 3: 95, 4: 0 }
const STATUSES = [TIMESHEET_STATUS.approved, TIMESHEET_STATUS.submitted, TIMESHEET_STATUS.submitted, TIMESHEET_STATUS.draft, TIMESHEET_STATUS.approved, TIMESHEET_STATUS.rejected]
const COMMENTS = ['', 'Client asked for a follow-up session.', '', 'Overran because of a failed import.', '', 'Please split this across two projects.']

//dated last week whenever the page is read
const lastMonday = dayjs().startOf('day').subtract((dayjs().day() + 6) % 7 + 7, 'day')

export const TIMESHEET_ROWS: IRawRecord[] = Array.from({ length: 24 }, (_, index) => {
    const work = WORK[index % WORK.length]
    return {
        docs_timesheetid: `entry-${index + 1}`,
        description: work.description,
        employee: EMPLOYEES[index % EMPLOYEES.length],
        project: work.project,
        date: lastMonday.add(Math.floor(index / 5) % 5, 'day').toISOString(),
        hours: HOURS[index % HOURS.length],
        billable: work.billable,
        rate: RATES[work.project],
        status: STATUSES[index % STATUSES.length],
        comment: COMMENTS[index % COMMENTS.length],
    }
})

/** A team's timesheet entries for last week, not yet loaded. */
export const createTimesheetsProvider = (): MemoryDataProvider => createMemoryProvider({
    primaryIdAttribute: 'docs_timesheetid',
    primaryNameAttribute: 'description',
    logicalName: 'docs_timesheet',
    rows: TIMESHEET_ROWS,
    columns: TIMESHEET_COLUMNS,
})
