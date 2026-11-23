import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import { DEAL_LIST_TABS, withDealList } from '../dealListFiles'

const ACT_ON_DEALS_CODE = `import { ClientSideGrid, createEditingModule, createRowSelectionModule, DatasetControl, IRibbon, IRibbonCommand, useDataProvider } from '@talxis/base-controls'
import { loadDeals } from './deals'

//new: the stage of a won deal
const WON_STAGE = 4

//new: commands for the selected deals
const DealsRibbon = () => {
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

const GridExample = () => <DatasetControl onLoad={loadDeals} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher />
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            {/* new: the ribbon, before the search field */}
            <DealsRibbon />
            <DatasetControl.QuickFind />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        {/* new: grid modules for ticking rows and editing cells */}
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
`

export const ActOnDealsExample = () => <GridExampleRunner seedCode={withDealList(ACT_ON_DEALS_CODE)} tabs={DEAL_LIST_TABS} />
