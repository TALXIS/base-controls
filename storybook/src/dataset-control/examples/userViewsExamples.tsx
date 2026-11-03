import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { VIEWS_FILE, withFiles } from './shared'

const USER_VIEWS_CODE = `import { IDealViewData, loadDeals, loadDealViews, saveDealViewData } from './views'

const GridExample = () => {
    //keeps the user's views in localStorage; the other stores are under Where views are kept
    const modules = React.useMemo(() => [createLocalStorageUserQueriesModule<IDealViewData>({ storageKey: 'docs.dealViews' })], [])

    //saveDealViewData, in views.ts, saves the sorting, filter and search with every view
    return <DatasetControl modules={modules} onLoadViews={loadDealViews} onLoad={loadDeals} onMounted={saveDealViewData} stateKey='userViews' height='480px'>
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                <DatasetControl.ViewSwitcher>
                    {/* adds Save changes, Save as new view and Manage views to the switcher */}
                    <DatasetControl.UserQueries />
                </DatasetControl.ViewSwitcher>
            </DatasetControl.Header.Start>
            <DatasetControl.Header.End>
                <DatasetControl.EditColumns />
                <DatasetControl.QuickFind />
            </DatasetControl.Header.End>
        </DatasetControl.Header>
        <DatasetControl.Body>
            <Grid stateKey='grid' modules={[createClientSideRowModelModule(), createSortingModule()]} />
        </DatasetControl.Body>
    </DatasetControl>
}
`

const OWN_STORE_CODE = `import { IDealViewData, loadDeals, loadDealViews, saveDealViewData } from './views'

interface IStoredView {
    id: string
    name: string
    view: IUserQueryView<IDealViewData>
}

//Manage views renames through onRecordSave and deletes through onRecordsDelete
class ManageViewsProvider extends MemoryDataProvider {
    constructor(private _views: IStoredView[], private _log: (line: string) => void) {
        super({
            dataSource: _views.map(({ id, name }) => ({ id, name })),
            metadata: { PrimaryIdAttribute: 'id', PrimaryNameAttribute: 'name' },
            columns: [{ name: 'name', displayName: 'Name', dataType: DataTypes.SingleLineText, isPrimary: true, visualSizeFactor: 300 }],
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
class MemoryViewsStore implements IUserQueriesStore<IDealViewData> {
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

    public async createView(name: string, view: IUserQueryView<IDealViewData>) {
        this._log(\`createView('\${name}')\`)
        const id = crypto.randomUUID()
        this._views.push({ id, name, view })
        return id
    }

    public async updateView(viewId: string, view: IUserQueryView<IDealViewData>) {
        this._log(\`updateView('\${viewId}')\`)
        this._views.find(stored => stored.id === viewId)!.view = view
    }

    public createManageProvider() {
        return new ManageViewsProvider(this._views, this._log)
    }
}

const getLogStyles = (theme: ITheme) => mergeStyleSets({
    log: { padding: '8px 12px', minHeight: 132, border: \`1px solid \${theme.semanticColors.bodyDivider}\`, borderRadius: theme.effects.roundedCorner4, fontFamily: 'Consolas, monospace', lineHeight: '22px' },
    line: { color: theme.semanticColors.bodySubtext },
    latest: { color: theme.semanticColors.bodyText, fontWeight: 600 },
})

const GridExample = () => {
    const theme = useTheme()
    const styles = React.useMemo(() => getLogStyles(theme), [theme])
    const [log, setLog] = React.useState<string[]>([])

    //one store across mounts
    const modules = React.useMemo(() => {
        const store = new MemoryViewsStore(line => setLog(log => [line, ...log].slice(0, 6)))
        return [createUserQueriesModule<IDealViewData>({ onCreateStore: () => store })]
    }, [])

    return <Stack tokens={{ childrenGap: 8 }}>
        <DatasetControl modules={modules} onLoadViews={loadDealViews} onLoad={loadDeals} onMounted={saveDealViewData} stateKey='userViewsOwnStore' height='400px'>
            <DatasetControl.Header>
                <DatasetControl.Header.Start>
                    <DatasetControl.ViewSwitcher>
                        <DatasetControl.UserQueries />
                    </DatasetControl.ViewSwitcher>
                </DatasetControl.Header.Start>
            </DatasetControl.Header>
            <DatasetControl.Body>
                <Grid stateKey='grid' modules={[createClientSideRowModelModule(), createSortingModule()]} />
            </DatasetControl.Body>
        </DatasetControl>
        <div className={styles.log}>
            {log.map((line, index) => <div key={index} className={index === 0 ? styles.latest : styles.line}>{line}</div>)}
        </div>
    </Stack>
}
`

export const UserViewsExample = () => <GridExampleRunner seedCode={withFiles(USER_VIEWS_CODE, VIEWS_FILE)} />
export const OwnStoreExample = () => <GridExampleRunner seedCode={withFiles(OWN_STORE_CODE, VIEWS_FILE)} />
