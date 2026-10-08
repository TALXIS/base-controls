import dayjs from 'dayjs'
import { DataTypes, IColumn, MemoryDataProvider } from '@talxis/client-libraries'
import { createMemoryProvider, metadataFor, numberMetadataFor } from './metadata'

const PRIORITY_OPTIONS = [
    { Value: 0, Label: 'Low', Color: '#69797e' },
    { Value: 1, Label: 'Normal', Color: '#0f6cbd' },
    { Value: 2, Label: 'High', Color: '#a4262c' },
]

const YES_NO = [
    { Value: 0, Label: 'No', Color: '' },
    { Value: 1, Label: 'Yes', Color: '' },
]

export const LAUNCH_PLAN_COLUMNS: IColumn[] = [
    { name: 'name', dataType: DataTypes.SingleLineText, displayName: 'Item', visualSizeFactor: 300, metadata: { ...metadataFor(DataTypes.SingleLineText), RequiredLevel: 1 } },
    { name: 'completed', dataType: DataTypes.TwoOptions, displayName: 'Done', visualSizeFactor: 40, metadata: { ...metadataFor(DataTypes.TwoOptions), OptionSet: YES_NO } },
    { name: 'stackrank', dataType: DataTypes.SingleLineText, displayName: 'Rank', visualSizeFactor: 90, metadata: metadataFor(DataTypes.SingleLineText) },
    { name: 'priority', dataType: DataTypes.OptionSet, displayName: 'Priority', visualSizeFactor: 110, metadata: { ...metadataFor(DataTypes.OptionSet), OptionSet: PRIORITY_OPTIONS } },
    { name: 'owner', dataType: DataTypes.SingleLineText, displayName: 'Owner', visualSizeFactor: 150, metadata: metadataFor(DataTypes.SingleLineText) },
    { name: 'duedate', dataType: DataTypes.DateAndTimeDateOnly, displayName: 'Due', visualSizeFactor: 130, metadata: metadataFor(DataTypes.DateAndTimeDateOnly) },
    { name: 'estimate', dataType: DataTypes.WholeDuration, displayName: 'Estimate', visualSizeFactor: 120, metadata: numberMetadataFor(DataTypes.WholeDuration), aggregation: { aggregationFunction: 'sum', alias: 'estimate_sum' } },
]

const inDays = (days: number) => dayjs().startOf('day').add(days, 'day').format('YYYY-MM-DD')

//out of rank order, so the checklist's ordering shows
const LAUNCH_PLAN_ROWS = [
    { itemid: 'item-3', name: 'Ship the first version', completed: false, priority: 2, owner: 'Chloé Martin', duedate: inDays(-1), estimate: 960, stackrank: '0|300000:' },
    { itemid: 'item-1', name: 'Sketch the layout', completed: true, priority: 1, owner: 'Anna Novak', duedate: inDays(-12), estimate: 360, stackrank: '0|100000:' },
    { itemid: 'item-6', name: 'Announce the launch', completed: false, priority: 1, owner: 'Anna Novak', duedate: inDays(7), estimate: 240, stackrank: '0|600000:' },
    { itemid: 'item-4', name: 'Write the release notes', completed: false, priority: 1, owner: '', duedate: inDays(2), estimate: 300, stackrank: '0|400000:' },
    { itemid: 'item-2', name: 'Wire up the data', completed: true, priority: 2, owner: 'Ben Carter', duedate: inDays(-5), estimate: 720, stackrank: '0|200000:' },
    { itemid: 'item-5', name: 'Record the demo video', completed: false, priority: 0, owner: '', duedate: inDays(5), estimate: 480, stackrank: '0|500000:' },
]

/** A product launch's checklist of 6 items, not yet loaded. */
export const createLaunchPlanProvider = (): MemoryDataProvider => createMemoryProvider({
    primaryIdAttribute: 'itemid',
    primaryNameAttribute: 'name',
    logicalName: 'docs_launchitem',
    rows: LAUNCH_PLAN_ROWS,
    columns: LAUNCH_PLAN_COLUMNS,
})
