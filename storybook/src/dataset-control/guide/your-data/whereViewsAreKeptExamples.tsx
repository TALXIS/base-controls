import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import type { IGridExampleFile } from '../../../grid/GridLivePreview'
import { DEAL_LIST_TABS, withDealList } from '../dealListFiles'

const WHERE_VIEWS_ARE_KEPT_CODE = `import { ClientSideGrid, createUserQueriesModule, DatasetControl, IUserQueriesStore, IUserQueryView } from '@talxis/base-controls'
import { DataTypes, IRecord, MemoryDataProvider } from '@talxis/client-libraries'
import { Stack, Text, Toggle } from '@fluentui/react'
import { loadDeals } from './deals'

interface IStoredView {
    id: string
    name: string
    view: IUserQueryView
}

//new: stands in for your server
const server = { isDown: false }

//new: Manage views renames through onRecordSave and deletes through onRecordsDelete
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

//new: a store of your own that logs every call
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
        this._throwWhileDown()
        const id = crypto.randomUUID()
        this._views.push({ id, name, view })
        return id
    }

    public async updateView(viewId: string, view: IUserQueryView) {
        this._log(\`updateView('\${viewId}')\`)
        this._throwWhileDown()
        this._views.find(stored => stored.id === viewId)!.view = view
    }

    public createManageProvider() {
        return new ManageViewsProvider(this._views, this._log)
    }

    private _throwWhileDown() {
        if (server.isDown) {
            throw new Error('The view could not be saved while the server is down.')
        }
    }
}

const GridExample = () => {
    const [log, setLog] = React.useState<string[]>([])

    //new: one store across renders and loads
    const modules = React.useMemo(() => {
        const store = new MemoryViewsStore(line => setLog(log => [...log, line].slice(-6)))
        return [createUserQueriesModule({ createStore: () => store })]
    }, [])

    return <Stack tokens={{ childrenGap: 8 }}>
        <Toggle label='Server is down' inlineLabel onChange={(_, checked) => { server.isDown = !!checked }} />
        <DatasetControl modules={modules} onLoad={loadDeals} height='340px'>
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
        {/* new: the last six calls with the newest at the bottom */}
        {log.map((line, index) => <Text key={index}>{line}</Text>)}
    </Stack>
}
`

const DATAVERSE_FILE: IGridExampleFile = {
    name: 'dataverse.ts',
    code: `//in a model-driven app one of these modules replaces the store in GridExample.tsx
import { createDataverseUserQueriesModule, createTalxisUserQueriesModule } from '@talxis/base-controls'

//as each user's own talxis_userquery records
export const createTalxisDealViews = (context: ComponentFramework.Context) => createTalxisUserQueriesModule({ entityName: 'docs_deal', ownerId: context.userSettings.userId })

//as records of a table of your own
export const createDataverseDealViews = (context: ComponentFramework.Context) => createDataverseUserQueriesModule({
    entityName: 'docs_deal',
    ownerId: context.userSettings.userId,
    table: { name: 'new_savedview', fieldMapping: { name: 'new_name', layout: 'new_layout', returnedTypeCode: 'new_entity' } },
})
`,
}

export const WhereViewsAreKeptExample = () => <GridExampleRunner seedCode={withDealList(WHERE_VIEWS_ARE_KEPT_CODE, DATAVERSE_FILE)} tabs={DEAL_LIST_TABS} />
