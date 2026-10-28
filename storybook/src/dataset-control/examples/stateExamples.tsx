import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { VIEWS_FILE, withFiles } from './shared'

const BACK_WHERE_YOU_LEFT_OFF_CODE = `import { loadDeals, loadDealViews } from './views'

const GridExample = () => {
    const [isShown, setIsShown] = React.useState(true)

    return <Stack tokens={{ childrenGap: 8 }}>
        <Toggle label='Show the deals' inlineLabel checked={isShown} onChange={(_, checked) => setIsShown(!!checked)} />
        {isShown && <DatasetControl onLoadViews={loadDealViews} stateKey='deals' onLoad={loadDeals} height='400px'>
            <DatasetControl.Header>
                <DatasetControl.Header.Start>
                    <DatasetControl.ViewSwitcher />
                </DatasetControl.Header.Start>
                <DatasetControl.Header.End>
                    <DatasetControl.QuickFind />
                </DatasetControl.Header.End>
            </DatasetControl.Header>
            <DatasetControl.Body>
                <Grid stateKey='grid' modules={[createClientSideRowModelModule(), createSortingModule(), createRowSelectionModule({ mode: 'multiple' })]} />
            </DatasetControl.Body>
        </DatasetControl>}
    </Stack>
}
`

const INSIDE_THE_STORE_CODE = `import { loadDeals, loadDealViews } from './views'

const styles = mergeStyleSets({
    store: { flex: '0 0 340px', height: 440, margin: 0, padding: 12, overflow: 'auto', boxSizing: 'border-box', fontSize: 12, background: '#faf9f8', border: '1px solid #edebe9', borderRadius: 4 },
})

//shortened to read: each shown column by its name, and the client-side page size as 'all'
const describe = (state: IStateDictionary) => JSON.stringify(state, (key, value) => {
    if (key === 'columns') {
        return value.filter((column: IColumn) => !column.isHidden).map((column: IColumn) => column.name)
    }
    return key === 'pageSize' && value === Number.MAX_SAFE_INTEGER ? 'all' : value
}, 2)

const GridExample = () => {
    //the dictionary the store writes into, as a PCF control's state would be
    const state = React.useMemo<IStateDictionary>(() => ({}), [])
    const store = React.useMemo(() => new StateStore({ state }), [state])
    const [text, setText] = React.useState('{}')

    React.useEffect(() => {
        const interval = setInterval(() => setText(describe(state)), 500)
        return () => clearInterval(interval)
    }, [state])

    return <Stack horizontal tokens={{ childrenGap: 16 }}>
        <Stack.Item grow styles={{ root: { minWidth: 0 } }}>
            <StateProvider store={store}>
                <DatasetControl onLoadViews={loadDealViews} stateKey='deals' onLoad={loadDeals} height='440px'>
                    <DatasetControl.Header>
                        <DatasetControl.Header.Start>
                            <DatasetControl.ViewSwitcher />
                        </DatasetControl.Header.Start>
                        <DatasetControl.Header.End>
                            <DatasetControl.QuickFind />
                        </DatasetControl.Header.End>
                    </DatasetControl.Header>
                    <DatasetControl.Body>
                        <Grid stateKey='grid' modules={[createClientSideRowModelModule(), createSortingModule()]} />
                    </DatasetControl.Body>
                </DatasetControl>
            </StateProvider>
        </Stack.Item>
        <pre className={styles.store}>{text}</pre>
    </Stack>
}
`

export const InsideTheStoreExample = () => <GridExampleRunner seedCode={withFiles(INSIDE_THE_STORE_CODE, VIEWS_FILE)} />

export const BackWhereYouLeftOffExample = () => <GridExampleRunner seedCode={withFiles(BACK_WHERE_YOU_LEFT_OFF_CODE, VIEWS_FILE)} />
