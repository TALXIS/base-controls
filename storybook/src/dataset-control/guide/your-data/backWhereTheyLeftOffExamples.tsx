import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import { DEAL_LIST_TABS, DEALS_RIBBON_FILE, SYNC_MESSAGE_FILE, USER_VIEW_TYPES_FILE, USER_VIEWS_FILE, withDealList } from '../dealListFiles'

const BACK_WHERE_THEY_LEFT_OFF_CODE = `import { ClientSideGrid, createEditingModule, createRowSelectionModule, createSortingModule, DatasetControl } from '@talxis/base-controls'
import { Stack, Toggle } from '@fluentui/react'
import { loadDeals } from './deals'
import { DealsRibbon } from './DealsRibbon'
import { dealViews, saveDealViewData } from './userViews'
import { showSyncMessage } from './syncMessage'

const GridExample = () => {
    //new: stands in for leaving the page and coming back
    const [isShown, setIsShown] = React.useState(true)

    return <Stack tokens={{ childrenGap: 8 }}>
        <Toggle label='Show the deals' inlineLabel checked={isShown} onChange={(_, checked) => setIsShown(!!checked)} />
        {/* new: the key the control keeps its state under in the page's store */}
        {isShown && <DatasetControl modules={[dealViews]} onLoad={loadDeals} onSetup={control => { showSyncMessage(control); saveDealViewData(control) }} stateKey='guide.back' height='440px'>
            <DatasetControl.Header>
                <DatasetControl.Header.Start>
                    <DatasetControl.ViewSwitcher>
                        <DatasetControl.UserQueries />
                    </DatasetControl.ViewSwitcher>
                </DatasetControl.Header.Start>
                <DatasetControl.Header.End>
                    <DealsRibbon />
                    <DatasetControl.EditColumns />
                    <DatasetControl.QuickFind />
                </DatasetControl.Header.End>
            </DatasetControl.Header>
            <DatasetControl.Notifications />
            <DatasetControl.Body>
                {/* new: the grid keeps its scroll per view under a key of its own */}
                <ClientSideGrid stateKey='grid' modules={[createRowSelectionModule({ mode: 'multiple' }), createEditingModule(), createSortingModule()]} />
            </DatasetControl.Body>
            <DatasetControl.Footer>
                <DatasetControl.Footer.Start>
                    <DatasetControl.PageSizeSwitcher />
                </DatasetControl.Footer.Start>
                <DatasetControl.Footer.End>
                    <DatasetControl.Pagination />
                </DatasetControl.Footer.End>
            </DatasetControl.Footer>
        </DatasetControl>}
    </Stack>
}
`

const INSIDE_THE_STORE_CODE = `import { ClientSideGrid, createSortingModule, DatasetControl, IStateDictionary, StateProvider, StateStore } from '@talxis/base-controls'
import { IColumn } from '@talxis/client-libraries'
import { mergeStyleSets, Stack } from '@fluentui/react'
import { loadDeals } from './deals'

const styles = mergeStyleSets({
    store: { flex: '0 0 340px', height: 440, margin: 0, overflow: 'auto', fontSize: 12 },
})

//each column shortened to its name
const describe = (state: IStateDictionary) => JSON.stringify(state, (key, value) => key === 'columns' ? value.map((column: IColumn) => column.name) : value, 2)

//stands in for a PCF control's state dictionary
const state: IStateDictionary = {}
const store = new StateStore({ state })

const GridExample = () => {
    const [text, setText] = React.useState('{}')

    //the store raises no events
    React.useEffect(() => {
        const interval = setInterval(() => setText(describe(state)), 500)
        return () => clearInterval(interval)
    }, [])

    return <Stack horizontal tokens={{ childrenGap: 16 }}>
        <Stack.Item grow styles={{ root: { minWidth: 0 } }}>
            <StateProvider store={store}>
                <DatasetControl stateKey='deals' onLoad={loadDeals} height='440px'>
                    <DatasetControl.Header>
                        <DatasetControl.Header.Start>
                            <DatasetControl.ViewSwitcher />
                        </DatasetControl.Header.Start>
                        <DatasetControl.Header.End>
                            <DatasetControl.QuickFind />
                        </DatasetControl.Header.End>
                    </DatasetControl.Header>
                    <DatasetControl.Body>
                        <ClientSideGrid stateKey='grid' modules={[createSortingModule()]} />
                    </DatasetControl.Body>
                </DatasetControl>
            </StateProvider>
        </Stack.Item>
        <pre className={styles.store}>{text}</pre>
    </Stack>
}
`

export const BackWhereTheyLeftOffExample = () => <GridExampleRunner seedCode={withDealList(BACK_WHERE_THEY_LEFT_OFF_CODE, DEALS_RIBBON_FILE, SYNC_MESSAGE_FILE, USER_VIEWS_FILE, USER_VIEW_TYPES_FILE)} tabs={DEAL_LIST_TABS} />
export const InsideTheStoreExample = () => <GridExampleRunner seedCode={withDealList(INSIDE_THE_STORE_CODE)} tabs={DEAL_LIST_TABS} />
