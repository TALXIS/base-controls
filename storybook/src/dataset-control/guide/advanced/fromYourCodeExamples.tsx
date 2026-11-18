import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import type { IGridExampleFile } from '../../../grid/GridLivePreview'
import { DEAL_LIST_TABS, DEALS_RIBBON_FILE, USER_VIEW_TYPES_FILE, USER_VIEWS_FILE, withDealList } from '../dealListFiles'

const FROM_YOUR_CODE_CODE = `import { ClientSideGrid, createEditingModule, createRowSelectionModule, createSortingModule, DatasetControl, IDatasetControlModule, IDatasetControlView, useDatasetControl } from '@talxis/base-controls'
import { Operators, Type } from '@talxis/client-libraries'
import { DefaultButton, Stack } from '@fluentui/react'
import { columns, loadDeals } from './deals'
import { DealsRibbon } from './DealsRibbon'
import { dealViews, saveDealViewData } from './userViews'

//new: the deals closing in the next 30 days by close date
const CLOSING_SOON: IDatasetControlView = {
    id: 'closingSoon',
    name: 'Closing soon',
    group: { id: 'reports', name: 'Reports' },
    resolve: provider => {
        provider.setFiltering({ filterOperator: Type.And.Value, conditions: [{ attributeName: 'closedate', conditionOperator: Operators.NextXDays.Value, value: '30' }] })
        //sortDirection 0 is ascending
        provider.setSorting([{ name: 'closedate', sortDirection: 0 }])
        return { columns: columns('name', 'owner', 'closedate', 'value') }
    },
}

//new: a module of your own loads on every load before onLoad
const closingSoonModule: IDatasetControlModule<'closingSoon'> = {
    name: 'closingSoon',
    onLoad: control => {
        //runs on the views onLoad returns
        control.hooks.views.add((views: IDatasetControlView[]) => { views.push(CLOSING_SOON) })
        //what control.modules.get('closingSoon') returns
        return CLOSING_SOON
    },
}

//new: inside the control, useDatasetControl() returns the control of this load
const Shortcuts = () => {
    const control = useDatasetControl()

    const searchContoso = () => {
        const quickFind = control.parts.get('quickFind')
        quickFind.setQuery('Contoso')
        quickFind.search()
    }

    return <Stack horizontal tokens={{ childrenGap: 8 }}>
        <DefaultButton text='Won deals' onClick={() => control.loadView('won')} />
        <DefaultButton text='Search Contoso' onClick={searchContoso} />
        <DefaultButton text='Columns' onClick={() => control.parts.get('editColumns').open()} />
    </Stack>
}

const GridExample = () => <DatasetControl modules={[dealViews, closingSoonModule]} onLoad={loadDeals} onSetup={saveDealViewData} height='480px'>
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
    <DatasetControl.Notifications messages={[{ text: 'Deals are synced from the CRM every night.', level: 'INFO' }]} />
    <DatasetControl.Body>
        <ClientSideGrid modules={[createRowSelectionModule({ mode: 'multiple' }), createEditingModule(), createSortingModule()]} />
    </DatasetControl.Body>
    <DatasetControl.Footer>
        <DatasetControl.Footer.Start>
            <DatasetControl.PageSizeSwitcher />
            {/* new: your own buttons in the footer */}
            <Shortcuts />
        </DatasetControl.Footer.Start>
        <DatasetControl.Footer.End>
            <DatasetControl.Pagination />
        </DatasetControl.Footer.End>
    </DatasetControl.Footer>
</DatasetControl>
`

const CLOSING_SOON_TYPES_FILE: IGridExampleFile = {
    name: 'types.ts',
    code: USER_VIEW_TYPES_FILE.code.replace('        searchQuery: string\n    }\n', `        searchQuery: string
    }
    //new: what closingSoonModule's onLoad returns
    interface IDatasetControlModuleMap {
        closingSoon: IDatasetControlView
    }
`),
}

const WATCH_IT_LOAD_CODE = `import { ClientSideGrid, createEditingModule, createRowSelectionModule, createSortingModule, DatasetControl, IDatasetControl } from '@talxis/base-controls'
import { DefaultButton, mergeStyleSets, Stack } from '@fluentui/react'
import { loadDeals } from './deals'
import { DealsRibbon } from './DealsRibbon'
import { dealViews, saveDealViewData } from './userViews'

const styles = mergeStyleSets({
    log: { flex: '0 0 260px', height: 440, margin: 0, overflow: 'auto', fontSize: 12 },
})

//new: stands in for a call to your CRM that fails
const syncToCrm = async () => {
    await new Promise(resolve => setTimeout(resolve, 600))
    throw new Error('The CRM did not respond.')
}

const GridExample = () => {
    const [log, setLog] = React.useState<string[]>([])
    //new: the latest load's control for the buttons outside it
    const controlRef = React.useRef<IDatasetControl>()
    const write = (line: string) => setLog(log => [...log, line].slice(-24))

    //new: called with the control of every load before its modules load
    const onSetup = (control: IDatasetControl) => {
        controlRef.current = control
        saveDealViewData(control)
        write('onSetup')
        control.lifecycle.events.addEventListener('onStatusChanged', status => write(\`onStatusChanged: \${status}\`))
        control.lifecycle.events.addEventListener('onRemountRequested', () => write('onRemountRequested'))
        control.lifecycle.events.addEventListener('onDestroyed', () => write('onDestroyed'))
        control.executor.events.addEventListener('onExecuteFailed', error => write(\`onExecuteFailed: \${(error as Error).message}\`))
    }

    //new: called once the control and its parts are ready
    const onReady = (control: IDatasetControl) => write(\`onReady: \${control.getView()?.name}\`)

    return <Stack tokens={{ childrenGap: 8 }}>
        <Stack horizontal tokens={{ childrenGap: 8 }}>
            <DefaultButton text='Reload' onClick={() => controlRef.current?.reload()} />
            {/* new: your own work behind the control's spinner and error dialog */}
            <DefaultButton text='Sync to CRM' onClick={() => controlRef.current?.execute(syncToCrm, { error: { rethrow: false } })} />
        </Stack>
        <Stack horizontal tokens={{ childrenGap: 16 }}>
            <Stack.Item grow styles={{ root: { minWidth: 0 } }}>
                <DatasetControl modules={[dealViews]} onLoad={loadDeals} onSetup={onSetup} onReady={onReady} height='440px'>
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
                    <DatasetControl.Notifications messages={[{ text: 'Deals are synced from the CRM every night.', level: 'INFO' }]} />
                    <DatasetControl.Body>
                        <ClientSideGrid modules={[createRowSelectionModule({ mode: 'multiple' }), createEditingModule(), createSortingModule()]} />
                    </DatasetControl.Body>
                    <DatasetControl.Footer>
                        <DatasetControl.Footer.Start>
                            <DatasetControl.PageSizeSwitcher />
                        </DatasetControl.Footer.Start>
                        <DatasetControl.Footer.End>
                            <DatasetControl.Pagination />
                        </DatasetControl.Footer.End>
                    </DatasetControl.Footer>
                </DatasetControl>
            </Stack.Item>
            {/* new: the log with the newest line at the bottom */}
            <pre className={styles.log}>{log.join('\\n')}</pre>
        </Stack>
    </Stack>
}
`

export const FromYourCodeExample = () => <GridExampleRunner seedCode={withDealList(FROM_YOUR_CODE_CODE, DEALS_RIBBON_FILE, USER_VIEWS_FILE, CLOSING_SOON_TYPES_FILE)} tabs={DEAL_LIST_TABS} />
export const WatchItLoadExample = () => <GridExampleRunner seedCode={withDealList(WATCH_IT_LOAD_CODE, DEALS_RIBBON_FILE, USER_VIEWS_FILE, USER_VIEW_TYPES_FILE)} tabs={DEAL_LIST_TABS} />
