import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import type { IGridExampleFile } from '../../grid/GridLivePreview'
import { VIEWS_FILE, withFiles } from './shared'

const USER_VIEWS_CODE = `import { loadDeals, saveDealViewData } from './views'

//keeps the user's views in this browser's localStorage
const userViews = createLocalStorageUserQueriesModule({ storageKey: 'docs.dealViews' })

//saveDealViewData, in views.ts, saves the sorting, filter and search with every view and puts them back
const GridExample = () => <DatasetControl modules={[userViews]} onLoad={loadDeals} onSetup={saveDealViewData} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher>
                {/* the Manage views panel the module's command opens */}
                <DatasetControl.UserQueries />
            </DatasetControl.ViewSwitcher>
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            <DatasetControl.EditColumns />
            <DatasetControl.QuickFind />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <ClientSideGrid modules={[createSortingModule()]} />
    </DatasetControl.Body>
</DatasetControl>
`

const OWN_STORE_CODE = `import { loadDeals } from './views'

interface IStoredView {
    id: string
    name: string
    view: IUserQueryView
}

//Manage views renames through onRecordSave and deletes through onRecordsDelete
class ManageViewsProvider extends MemoryDataProvider {
    constructor(private _views: IStoredView[], private _log: (line: string) => void) {
        super({
            dataSource: _views.map(({ id, name }) => ({ id, name })),
            metadata: { PrimaryIdAttribute: 'id', PrimaryNameAttribute: 'name' },
            columns: [{ name: 'name', displayName: 'Name', dataType: DataTypes.SingleLineText, isPrimary: true }],
        })
    }

    public async onRecordSave(record: IRecord) {
        this._log(\`rename '\${record.getValue('name')}'\`)
        this._views.find(stored => stored.id === record.getRecordId())!.name = record.getValue('name')
        return super.onRecordSave(record)
    }

    public async onRecordsDelete(recordIds: string[]) {
        this._log(\`delete \${recordIds.length} view(s)\`)
        this._views.splice(0, this._views.length, ...this._views.filter(stored => !recordIds.includes(stored.id)))
        return super.onRecordsDelete(recordIds)
    }
}

//stands in for your server, logging every call
class MemoryViewsStore implements IUserQueriesStore {
    private _views: IStoredView[] = []

    constructor(private _log: (line: string) => void) { }

    public async getViews() {
        this._log('getViews()')
        return this._views.map(({ id, name }) => ({ id, name }))
    }

    public async getView(viewId: string) {
        this._log(\`getView('\${viewId}')\`)
        return this._views.find(stored => stored.id === viewId)!.view
    }

    public async createView(name: string, view: IUserQueryView) {
        this._log(\`createView('\${name}')\`)
        const id = crypto.randomUUID()
        this._views.push({ id, name, view })
        return id
    }

    public async updateView(viewId: string, view: IUserQueryView) {
        this._log(\`updateView('\${viewId}')\`)
        this._views.find(stored => stored.id === viewId)!.view = view
    }

    public createManageProvider() {
        return new ManageViewsProvider(this._views, this._log)
    }
}

const GridExample = () => {
    const [log, setLog] = React.useState<string[]>([])

    //one store across renders and mounts
    const modules = React.useMemo(() => {
        const store = new MemoryViewsStore(line => setLog(log => [line, ...log].slice(0, 6)))
        return [createUserQueriesModule({ createStore: () => store })]
    }, [])

    return <Stack tokens={{ childrenGap: 8 }}>
        <DatasetControl modules={modules} onLoad={loadDeals} height='400px'>
            <DatasetControl.Header>
                <DatasetControl.Header.Start>
                    <DatasetControl.ViewSwitcher>
                        <DatasetControl.UserQueries />
                    </DatasetControl.ViewSwitcher>
                </DatasetControl.Header.Start>
            </DatasetControl.Header>
            <DatasetControl.Body>
                <ClientSideGrid />
            </DatasetControl.Body>
        </DatasetControl>
        {log.map((line, index) => <Text key={index}>{line}</Text>)}
    </Stack>
}
`

//the deal views, plus the values saved with every user view
const USER_VIEWS_VIEWS_FILE: IGridExampleFile = {
    name: 'views.ts',
    code: `${VIEWS_FILE.code}
//the keys saveDealViewData saves, declared once in your project
declare module '@talxis/base-controls' {
    interface IUserQuerySavedValueMap {
        sorting: ComponentFramework.PropertyHelper.DataSetApi.SortStatus[]
        filtering: ComponentFramework.PropertyHelper.DataSetApi.FilterExpression | null
        searchQuery: string
    }
}

/** Saves the sorting, filter and search with every user view and puts them back as it opens. */
export const saveDealViewData = (control: IDatasetControl) => {
    const provider = () => control.getProvider()!
    control.modules.observe('userQueries', userQueries => {
        userQueries.saveWithView('sorting', () => provider().getSorting(), (sorting, provider) => provider.setSorting(sorting))
        userQueries.saveWithView('filtering', () => provider().getFiltering(), (filtering, provider) => provider.setFiltering(filtering))
        userQueries.saveWithView('searchQuery', () => provider().getSearchQuery(), (searchQuery, provider) => provider.setSearchQuery(searchQuery))
    })
}
`,
}

const USER_VIEWS_DATAVERSE_FILE: IGridExampleFile = {
    name: 'dataverse.ts',
    code: `//in a model-driven app, use one of these modules instead of the localStorage one in GridExample.tsx
import { createDataverseUserQueriesModule, createTalxisUserQueriesModule } from '@talxis/base-controls'

//as talxis_userquery records
export const createTalxisViewsModule = (context: ComponentFramework.Context) => createTalxisUserQueriesModule({ entityName: 'deal', ownerId: context.userSettings.userId })

//as records of a table of your own
export const createDataverseViewsModule = (context: ComponentFramework.Context) => createDataverseUserQueriesModule({
    entityName: 'deal',
    ownerId: context.userSettings.userId,
    table: { name: 'new_savedview', fieldMapping: { name: 'new_name', layout: 'new_layout', returnedTypeCode: 'new_entity' } },
})
`,
}

export const UserViewsExample = () => <GridExampleRunner seedCode={withFiles(USER_VIEWS_CODE, USER_VIEWS_VIEWS_FILE, USER_VIEWS_DATAVERSE_FILE)} tabs={['preview', 'code']} />
export const OwnStoreExample = () => <GridExampleRunner seedCode={withFiles(OWN_STORE_CODE, VIEWS_FILE)} tabs={['preview', 'code']} />
