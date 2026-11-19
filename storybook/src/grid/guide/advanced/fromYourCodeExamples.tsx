import React from 'react'
import { GridExampleRunner } from '../../GridExampleRunner'
import { DEAL_LIST_TABS, DEALS_RIBBON_FILE, withDealGrid } from '../dealGridFiles'

const FROM_YOUR_CODE_CODE = `import { ClientSideGrid, createEditingModule, createFilteringModule, createRowSelectionModule, createSortingModule, DatasetControl, IGrid } from '@talxis/base-controls'
import { IRecord } from '@talxis/client-libraries'
import { DefaultButton, Stack, Text } from '@fluentui/react'
import { loadDeals } from './deals'
import { DealsRibbon } from './DealsRibbon'

const GridExample = () => {
    //new: the grid of the current mount, for the footer's buttons
    const gridRef = React.useRef<IGrid>()
    //new: the deal of the focused cell
    const [focusedDeal, setFocusedDeal] = React.useState<IRecord>()

    //new: called with each new grid before it loads
    const onSetup = (grid: IGrid) => {
        gridRef.current = grid
        //new: undefined once the focus leaves the rows
        grid.services.get('cells').events.addEventListener('onFocusedCellChanged', deal => setFocusedDeal(deal))
    }

    //new: a module, found by its name
    const sortByCloseDate = () => gridRef.current?.modules.get('sorting').sortColumn('closedate')

    //new: a field sets a value as an edit in its cell does
    const discountSelectedDeals = () => {
        const provider = gridRef.current!.services.get('provider')
        const fields = gridRef.current!.services.get('fields')
        provider.getSelectedRecordIds().forEach(id => fields.get(provider.getRecordsMap()[id], 'discount').setValue(5))
    }

    return <DatasetControl onLoad={loadDeals} height='480px'>
        <DatasetControl.Header>
            <DatasetControl.Header.End>
                <DealsRibbon />
            </DatasetControl.Header.End>
        </DatasetControl.Header>
        <DatasetControl.Body>
            <ClientSideGrid modules={[createRowSelectionModule({ mode: 'multiple' }), createEditingModule(), createSortingModule(), createFilteringModule()]} onSetup={onSetup} />
        </DatasetControl.Body>
        {/* new: buttons of your own, and the focused deal */}
        <DatasetControl.Footer>
            <DatasetControl.Footer.Start>
                <Stack horizontal tokens={{ childrenGap: 8 }}>
                    <DefaultButton text='Closing soonest' onClick={sortByCloseDate} />
                    <DefaultButton text='5% off' onClick={discountSelectedDeals} />
                </Stack>
            </DatasetControl.Footer.Start>
            <DatasetControl.Footer.End>
                <Text>{focusedDeal ? \`\${focusedDeal.getFormattedValue('name')}: \${focusedDeal.getFormattedValue('nextstep')}\` : 'Click a deal to see its next step.'}</Text>
            </DatasetControl.Footer.End>
        </DatasetControl.Footer>
    </DatasetControl>
}
`

const WATCH_IT_LOAD_CODE = `import { ClientSideGrid, createEditingModule, createFilteringModule, createRowSelectionModule, createSortingModule, DatasetControl, IGrid } from '@talxis/base-controls'
import { mergeStyleSets, Stack, Toggle } from '@fluentui/react'
import { loadDeals } from './deals'
import { DealsRibbon } from './DealsRibbon'

const styles = mergeStyleSets({
    log: { flex: '0 0 280px', height: 480, margin: 0, overflow: 'auto', fontSize: 12 },
})

const GridExample = () => {
    //new: the log, kept to its last 30 lines
    const [log, setLog] = React.useState<string[]>([])
    const write = (line: string) => setLog(lines => [...lines, line].slice(-30))
    //new: stands in for leaving the page and coming back
    const [isShown, setIsShown] = React.useState(true)

    //new: called with each new grid before it loads
    const onSetup = (grid: IGrid) => {
        write('onSetup')
        grid.lifecycle.events.addEventListener('onStatusChanged', status => write(\`onStatusChanged: \${status}\`))
        grid.services.observe('gridApi', () => {
            write('gridApi')
            //new: the cleanup runs as AG Grid goes
            return () => write('gridApi cleanup')
        })
        grid.events.addEventListener('onDataLoaded', () => write('onDataLoaded'))
        //new: the provider outlives the grid
        const provider = grid.services.get('provider')
        const removeListeners = [
            provider.addEventListener('onBeforeRecordSaved', deal => write(\`onBeforeRecordSaved: \${deal.getFormattedValue('name')}\`)),
            provider.addEventListener('onAfterRecordSaved', result => write(\`onAfterRecordSaved: \${result.success ? 'saved' : 'refused'}\`)),
            provider.addEventListener('onAfterSaved', results => write(\`onAfterSaved: \${results.filter(result => result.success).length} saved\`)),
        ]
        grid.lifecycle.events.addEventListener('onDestroyed', () => {
            removeListeners.forEach(remove => remove())
            write('onDestroyed')
        })
    }

    return <Stack horizontal tokens={{ childrenGap: 16 }}>
        <Stack.Item grow styles={{ root: { minWidth: 0 } }}>
            <DatasetControl onLoad={loadDeals} height='480px'>
                <DatasetControl.Header>
                    <DatasetControl.Header.Start>
                        <Toggle inlineLabel label='Show the deals' checked={isShown} onChange={(_, checked) => setIsShown(!!checked)} />
                    </DatasetControl.Header.Start>
                    <DatasetControl.Header.End>
                        <DealsRibbon />
                    </DatasetControl.Header.End>
                </DatasetControl.Header>
                <DatasetControl.Body>
                    {isShown && <ClientSideGrid
                        modules={[createRowSelectionModule({ mode: 'multiple' }), createEditingModule(), createSortingModule(), createFilteringModule()]}
                        onSetup={onSetup}
                        //new: awaited after the modules load
                        onLoad={() => write('onLoad')}
                        //new: called once the grid has loaded and is drawn
                        onReady={() => write('onReady')} />}
                </DatasetControl.Body>
            </DatasetControl>
        </Stack.Item>
        {/* new: the log, the newest line at the bottom */}
        <pre className={styles.log}>{log.join('\\n')}</pre>
    </Stack>
}
`

export const FromYourCodeExample = () => <GridExampleRunner seedCode={withDealGrid(FROM_YOUR_CODE_CODE, DEALS_RIBBON_FILE)} tabs={DEAL_LIST_TABS} />

export const WatchItLoadExample = () => <GridExampleRunner seedCode={withDealGrid(WATCH_IT_LOAD_CODE, DEALS_RIBBON_FILE)} tabs={DEAL_LIST_TABS} />
