import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import { DEAL_LIST_TABS, DEALS_RIBBON_FILE, SYNC_MESSAGE_FILE, withDealList } from '../dealListFiles'

const LAY_IT_OUT_CODE = `import { ClientSideGrid, createEditingModule, createRowSelectionModule, DatasetControl, useCompact } from '@talxis/base-controls'
import { DefaultButton, IconButton, Slider } from '@fluentui/react'
import { loadDeals } from './deals'
import { DealsRibbon } from './DealsRibbon'
import { showSyncMessage } from './syncMessage'

//new: only its icon while the header is compact
const ExportButton = () => {
    const isCompact = useCompact()
    //stands in for exporting the deals
    const exportDeals = () => alert('The deals are on their way to Excel.')
    return isCompact
        ? <IconButton iconProps={{ iconName: 'ExcelDocument' }} title='Export to Excel' ariaLabel='Export to Excel' onClick={exportDeals} />
        : <DefaultButton text='Export to Excel' iconProps={{ iconName: 'ExcelDocument' }} onClick={exportDeals} />
}

//new: a slider narrows the list as a smaller screen would
const GridExample = () => {
    const [width, setWidth] = React.useState(100)

    return <>
        <Slider label='Width (%)' min={30} max={100} value={width} onChange={setWidth} />
        {/* new: height='100%' fills a box with a height of its own */}
        <div style={{ width: \`\${width}%\`, height: 480 }}>
            <DatasetControl onLoad={loadDeals} onSetup={showSyncMessage} height='100%'>
                <DatasetControl.Header>
                    <DatasetControl.Header.Start>
                        <DatasetControl.ViewSwitcher />
                    </DatasetControl.Header.Start>
                    <DatasetControl.Header.End>
                        <DealsRibbon />
                        <DatasetControl.EditColumns />
                        <DatasetControl.QuickFind />
                        {/* new: content of your own in a region */}
                        <ExportButton />
                    </DatasetControl.Header.End>
                </DatasetControl.Header>
                <DatasetControl.Notifications />
                <DatasetControl.Body>
                    <ClientSideGrid modules={[createRowSelectionModule({ mode: 'multiple' }), createEditingModule()]} />
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
        </div>
    </>
}
`

export const LayItOutExample = () => <GridExampleRunner seedCode={withDealList(LAY_IT_OUT_CODE, DEALS_RIBBON_FILE, SYNC_MESSAGE_FILE)} tabs={DEAL_LIST_TABS} />
