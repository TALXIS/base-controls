import type { IRunnerTab } from '../../grid/GridExampleRunner'
import type { IGridExampleFile } from '../../grid/GridLivePreview'

/** The preview, code and data tabs of a deal list example. */
export const DEAL_LIST_TABS: IRunnerTab[] = ['preview', 'code', 'data']

/** The deals, their provider and views, and the loader every load calls. */
export const DEALS_FILE: IGridExampleFile = {
    name: 'deals.ts',
    code: `import { IDatasetControlLoadResult, IDatasetControlView } from '@talxis/base-controls'
import { IMemoryProviderEntityMetadata, MemoryDataProvider, Operators, Type } from '@talxis/client-libraries'

//the docs dataset's deals, kept outside onLoad
export const deals = DEAL_ROWS.map(row => ({ ...row }))

const metadata: IMemoryProviderEntityMetadata = { PrimaryIdAttribute: DEAL_PRIMARY_ID, PrimaryNameAttribute: 'name', LogicalName: 'docs_deal', QuickFindColumns: ['name'] }

//a view's columns by name, in the order it shows them
export const columns = (...names: string[]) => names.map((name, order) => ({ name, order }))

export const createDealViews = (user: string): IDatasetControlView[] => [
    {
        id: 'my',
        name: 'My deals',
        resolve: provider => {
            provider.setFiltering({ filterOperator: Type.And.Value, conditions: [{ attributeName: 'owner', conditionOperator: Operators.Equal.Value, value: user }] })
            return { columns: [...columns('name', 'stage', 'value', 'closedate'), { name: 'owner', isHidden: true }] }
        },
    },
    { id: 'all', name: 'All deals', resolve: () => ({ columns: columns('name', 'owner', 'stage', 'value', 'probability', 'closedate') }) },
    {
        id: 'won',
        name: 'Won deals',
        resolve: provider => {
            provider.setFiltering({ filterOperator: Type.And.Value, conditions: [{ attributeName: 'stage', conditionOperator: Operators.Equal.Value, value: '4' }] })
            return { columns: [...columns('name', 'owner', 'value', 'closedate'), { name: 'stage', isHidden: true }] }
        },
    },
    {
        id: 'biggest',
        name: 'Biggest deals',
        group: { id: 'reports', name: 'Reports' },
        resolve: provider => {
            //sortDirection 1 is descending
            provider.setSorting([{ name: 'value', sortDirection: 1 }])
            return { columns: columns('name', 'value', 'stage') }
        },
    },
]

//stands in for asking the server who is signed in
const loadSignedInUser = async () => {
    await new Promise(resolve => setTimeout(resolve, 600))
    return 'Anna Novak'
}

//called on every load for the provider the parts work on
export const loadDeals = async (): Promise<IDatasetControlLoadResult> => {
    const user = await loadSignedInUser()
    const provider = new MemoryDataProvider({ dataSource: deals, metadata })
    //offers every deal column to the views and to Edit columns
    provider.hooks.availableColumns.add(columns => columns.push(...DEAL_COLUMNS))
    return { provider, views: createDealViews(user) }
}
`,
}

/** The sync message of Messages and nothing to show, for each step after it. */
export const SYNC_MESSAGE_FILE: IGridExampleFile = {
    name: 'syncMessage.ts',
    code: `import { IDatasetControl } from '@talxis/base-controls'

//adds the sync message to each notification bar the control draws
export const showSyncMessage = (control: IDatasetControl) => control.parts.observe('notifications', notifications => notifications.add({
    id: 'sync',
    text: 'Deals are synced from the CRM every night.',
    level: 'INFO',
    onDismiss: () => notifications.remove('sync'),
}))
`,
}

/** The deal list ribbon, with Mark N as won and the built-in commands. */
export const DEALS_RIBBON_FILE: IGridExampleFile = {
    name: 'DealsRibbon.tsx',
    code: `import { DatasetControl, IRibbon, IRibbonCommand, useDataProvider } from '@talxis/base-controls'

const WON_STAGE = 4

//commands for the selected deals
export const DealsRibbon = () => {
    const provider = useDataProvider()

    //runs again on every selection
    const loadCommands = async (ribbon: IRibbon): Promise<IRibbonCommand[]> => {
        const openDeals = provider.getSelectedRecordIds().map(id => provider.getRecordsMap()[id]).filter(deal => Number(deal.getValue('stage')) !== WON_STAGE)
        const markWon = async () => {
            openDeals.forEach(deal => deal.setValue('stage', WON_STAGE))
            await provider.save(openDeals)
            //the selected deals are won now
            await ribbon.reload()
        }
        return openDeals.length > 0 ? [{ id: 'markWon', label: \`Mark \${openDeals.length} as won\`, iconName: 'Trophy2', onExecute: markWon }] : []
    }

    //Save, Discard changes and Refresh come built in
    return <DatasetControl.Ribbon onLoad={loadCommands} />
}
`,
}

/** The user views module, and the sorting, filter and search saved with every user view. */
export const USER_VIEWS_FILE: IGridExampleFile = {
    name: 'userViews.ts',
    code: `import { createLocalStorageUserQueriesModule, IDatasetControl } from '@talxis/base-controls'

//keeps each user's views in this browser
export const dealViews = createLocalStorageUserQueriesModule({ storageKey: 'docs.dealList.views' })

//saves the sorting, filter and search with every user view
export const saveDealViewData = (control: IDatasetControl) => {
    control.modules.observe('userQueries', userQueries => {
        userQueries.saveWithView('sorting', () => control.getProvider()?.getSorting(), (sorting, provider) => provider.setSorting(sorting))
        userQueries.saveWithView('filtering', () => control.getProvider()?.getFiltering(), (filtering, provider) => provider.setFiltering(filtering))
        userQueries.saveWithView('searchQuery', () => control.getProvider()?.getSearchQuery(), (searchQuery, provider) => provider.setSearchQuery(searchQuery))
    })
}
`,
}

/** The keys `saveDealViewData` saves, declared for `saveWithView`. */
export const USER_VIEW_TYPES_FILE: IGridExampleFile = {
    name: 'types.ts',
    code: `//types the values saveDealViewData saves with every user view
declare module '@talxis/base-controls' {
    interface IUserQuerySavedValueMap {
        sorting: ComponentFramework.PropertyHelper.DataSetApi.SortStatus[]
        filtering: ComponentFramework.PropertyHelper.DataSetApi.FilterExpression | null
        searchQuery: string
    }
}

export { }
`,
}

/** The entry, then the deals, then the files the example reads. */
export const withDealList = (code: string, ...files: IGridExampleFile[]): IGridExampleFile[] => [{ name: 'GridExample.tsx', code }, DEALS_FILE, ...files]
