import { MemoryStrategy } from '@talxis/base-controls/components/Form'
import { DataTypes, type IColumn } from '@talxis/client-libraries'
import { createModelColumn, formMetadata } from '../shared/overviewShared'
import { createModelStore } from '../shared/modelStore'

const overviewColumns: IColumn[] = [
    {
        name: 'id',
        alias: 'id',
        isHidden: true,
        displayName: 'ID',
        dataType: DataTypes.SingleLineText,
    },
    createModelColumn(DataTypes.SingleLineText, {
        name: 'company',
        alias: 'company',
        displayName: 'Company',
        isPrimary: true,
    }),
    createModelColumn(DataTypes.SingleLineText, {
        name: 'contact',
        alias: 'contact',
        displayName: 'Primary contact',
    }),
    createModelColumn(DataTypes.SingleLineText, {
        name: 'owner',
        alias: 'owner',
        displayName: 'Owner',
    }),
    createModelColumn(DataTypes.SingleLinePhone, {
        name: 'phone',
        alias: 'phone',
        displayName: 'Phone',
    }),
    createModelColumn(DataTypes.SingleLineUrl, {
        name: 'workspace',
        alias: 'workspace',
        displayName: 'Workspace URL',
    }),
    createModelColumn(DataTypes.OptionSet, {
        name: 'engagementStage',
        alias: 'engagementStage',
        displayName: 'Engagement stage',
        metadata: {
            IsValidForUpdate: true,
            OptionSet: [
                { Label: 'Discover', Value: 1, Color: '#2563EB' },
                { Label: 'Design', Value: 2, Color: '#7C3AED' },
                { Label: 'Deliver', Value: 3, Color: '#059669' },
            ],
        },
    }),
    createModelColumn(DataTypes.OptionSet, {
        name: 'priority',
        alias: 'priority',
        displayName: 'Priority',
        metadata: {
            IsValidForUpdate: true,
            OptionSet: [
                { Label: 'Low', Value: 1, Color: '#059669' },
                { Label: 'Medium', Value: 2, Color: '#D97706' },
                { Label: 'High', Value: 3, Color: '#DC2626' },
            ],
        },
    }),
    createModelColumn(DataTypes.TwoOptions, {
        name: 'needsApproval',
        alias: 'needsApproval',
        displayName: 'Needs approval',
        metadata: {
            IsValidForUpdate: true,
            OptionSet: [
                { Label: 'Yes', Value: 1, Color: '#DC2626' },
                { Label: 'No', Value: 0, Color: '#059669' },
            ],
        },
    }),
    createModelColumn(DataTypes.Multiple, {
        name: 'summary',
        alias: 'summary',
        displayName: 'Summary',
    }),
    createModelColumn(DataTypes.Multiple, {
        name: 'scope',
        alias: 'scope',
        displayName: 'Scope',
    }),
    createModelColumn(DataTypes.Currency, {
        name: 'estimatedValue',
        alias: 'estimatedValue',
        displayName: 'Estimated value',
    }),
    createModelColumn(DataTypes.Currency, {
        name: 'approvedBudget',
        alias: 'approvedBudget',
        displayName: 'Approved budget',
    }),
    createModelColumn(DataTypes.DateAndTimeDateOnly, {
        name: 'targetDate',
        alias: 'targetDate',
        displayName: 'Target date',
    }),
    createModelColumn(DataTypes.DateAndTimeDateOnly, {
        name: 'kickoffDate',
        alias: 'kickoffDate',
        displayName: 'Kickoff date',
    }),
    createModelColumn(DataTypes.SingleLineText, {
        name: 'accountManager',
        alias: 'accountManager',
        displayName: 'Account manager',
    }),
    createModelColumn(DataTypes.SingleLineText, {
        name: 'deliveryRegion',
        alias: 'deliveryRegion',
        displayName: 'Delivery region',
    }),
    createModelColumn(DataTypes.SingleLineUrl, {
        name: 'trackerUrl',
        alias: 'trackerUrl',
        displayName: 'Tracker URL',
    }),
]

const overviewRecord = {
    id: 'form-overview-demo',
    company: 'Northwind Expansion Program',
    contact: 'Alicia Turner',
    owner: 'Pavel Hruby',
    phone: '+420 777 100 200',
    workspace: 'https://github.com/',
    engagementStage: 2,
    priority: 3,
    needsApproval: 1,
    summary: 'A sales-to-delivery handoff form that shows how the runtime keeps validation, dirty tracking, and extensibility together.',
    scope: 'Roll out the shared intake, qualification, and delivery workflow for the expansion program across three regions.',
    estimatedValue: 185000,
    approvedBudget: 150000,
    targetDate: '2026-09-15',
    kickoffDate: '2026-08-20',
    accountManager: 'Patrik Novak',
    deliveryRegion: 'Central Europe',
    trackerUrl: 'https://example.com',
}

export const overviewModelStore = createModelStore(overviewColumns)

const overviewStrategy = new MemoryStrategy({
    onGetData: () => overviewRecord,
    onGetColumns: () => overviewModelStore.getRuntimeColumns(),
    onGetMetadata: () => formMetadata,
})

export const getOverviewStrategy = () => overviewStrategy
