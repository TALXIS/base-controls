import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import type { IGridExampleFile } from '../../grid/GridLivePreview'
import { VIEWS_FILE, withFiles } from './shared'

const USER_VIEWS_CODE = `import { loadDealViews } from './views'
import { DealView, getViewData, loadView, onBeforeSave, userViews } from './userViews'

const GridExample = () => {
    const modules = React.useMemo(() => ({ userQueries: createUserQueriesModule<DealView>({ provider: userViews, getViewData, onBeforeSave }) }), [])

    return <DatasetControl modules={modules} onLoadViews={loadDealViews} onLoad={loadView} stateKey='userViews' height='480px'>
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                <DatasetControl.ViewSwitcher>
                    <DatasetControl.UserQueries />
                </DatasetControl.ViewSwitcher>
            </DatasetControl.Header.Start>
            <DatasetControl.Header.End>
                <DatasetControl.QuickFind />
            </DatasetControl.Header.End>
        </DatasetControl.Header>
        <DatasetControl.Body>
            <Grid stateKey='grid' modules={{ rowModel: createClientSideRowModelModule(), sorting: createSortingModule() }} />
        </DatasetControl.Body>
    </DatasetControl>
}
`

/** The user's own views, with how a user view loads and saves; imports the deal views. */
export const USER_VIEWS_FILE: IGridExampleFile = {
    name: 'userViews.ts',
    code: `import { IDealViewData, loadDeals, loadDealViews } from './views'

/** What a user view keeps: the deal view it was saved from, and how the user had set it up. */
export interface ISavedView {
    viewId: string
    sorting?: ComponentFramework.PropertyHelper.DataSetApi.SortStatus[]
    filtering?: ComponentFramework.PropertyHelper.DataSetApi.FilterExpression | null
    searchQuery?: string
}

const save = (view: ISavedView) => JSON.stringify(view)

/** The user's views, one record each; stands in for a table on your server. */
export const userViews = new MemoryDataProvider({
    dataSource: [
        { id: 'contoso', name: 'Contoso deals', description: 'Searched for Contoso', definition: save({ viewId: 'all', searchQuery: 'Contoso' }) },
        { id: 'bigWins', name: 'Biggest wins', description: 'Won deals, biggest first', definition: save({ viewId: 'won', sorting: [{ name: 'value', sortDirection: 1 }] }) },
    ],
    metadata: { PrimaryIdAttribute: 'id', PrimaryNameAttribute: 'name', QuickFindColumns: ['name', 'description'] },
    columns: [
        { name: 'name', displayName: 'View name', dataType: DataTypes.SingleLineText, isPrimary: true, visualSizeFactor: 200 },
        { name: 'description', displayName: 'Description', dataType: DataTypes.SingleLineText, visualSizeFactor: 260 },
        { name: 'definition', displayName: 'Definition', dataType: DataTypes.Multiple, isHidden: true },
    ],
})

/** What a deal view or a user view carries in its data. */
export type DealView = IDealViewData | ISavedView

const isSaved = (data: DealView | undefined): data is ISavedView => !!data && 'viewId' in data

/** What a user view keeps, read from its record. */
export const getViewData = (record: IRecord): ISavedView => JSON.parse(record.getValue('definition'))

//a user view loads the deal view it was saved from, as the user had set it up
export const loadView = async ({ view }: IDatasetControlLoadParameters<DealView>) => {
    const saved = view?.data
    if (!isSaved(saved)) {
        return loadDeals({ view: view && { ...view, data: saved } })
    }
    const views = await loadDealViews()
    const result = await loadDeals({ view: views.find(view => view.id === saved.viewId) })
    //what the user view leaves out stays as the deal view has it
    if (saved.sorting) {
        result.provider.setSorting(saved.sorting)
    }
    if (saved.filtering !== undefined) {
        result.provider.setFiltering(saved.filtering)
    }
    result.provider.setSearchQuery(saved.searchQuery)
    return result
}

//keeps what the control shows on the view being saved, new or changed
export const onBeforeSave = ({ record, datasetControl }: IUserQuerySaveParameters<DealView>) => {
    const provider = datasetControl.getProvider()!
    const current = datasetControl.getViews().find(view => view.id === datasetControl.getViewId())
    const currentData = current?.data
    const viewId = record.isNew() ? (isSaved(currentData) ? currentData.viewId : current?.id) : getViewData(record).viewId
    record.setValue('definition', JSON.stringify({ viewId, sorting: provider.getSorting(), filtering: provider.getFiltering(), searchQuery: provider.getSearchQuery() }))
}
`,
}

export const UserViewsExample = () => <GridExampleRunner seedCode={withFiles(USER_VIEWS_CODE, VIEWS_FILE, USER_VIEWS_FILE)} />
