import React from 'react'
import { DefaultButton } from '@fluentui/react'
import {
    createClientSideRowModelModule, createRowSelectionModule, DatasetControl, Grid, IRibbonCommand, PcfContextProvider,
} from '@talxis/base-controls'
import { loadDeals } from '../dealViews'

export interface ILayoutDatasetControlProps {
    viewSwitcher: boolean
    ribbon: 'none' | 'start' | 'end'
    editColumns: boolean
    quickFind: boolean
    pagination: 'none' | 'start' | 'end'
    pageSizeSwitcher: 'none' | 'start' | 'end'
    /** How many buttons of the consumer's own follow the quick find. */
    extraButtons: number
    /** A CSS width for the control, such as `'100%'` or `'360px'`. */
    width: string
}

const COMMANDS: IRibbonCommand[] = ['New', 'Edit', 'Delete', 'Share', 'Export', 'Assign'].map(label => ({ id: label.toLowerCase(), label, iconName: label === 'New' ? 'Add' : label, onExecute: () => {} }))

const loadCommands = async () => COMMANDS

/** DatasetControl with every part switched on or off, to check the layout of each combination. */
export const LayoutDatasetControl = (props: ILayoutDatasetControlProps) => {
    const modules = React.useMemo(() => ({ rowModel: createClientSideRowModelModule(), rowSelection: createRowSelectionModule({ mode: 'multiple' }) }), [])
    const ribbon = <DatasetControl.Ribbon onLoad={loadCommands} />
    const start = [props.viewSwitcher && <DatasetControl.ViewSwitcher key='viewSwitcher' />, props.ribbon === 'start' && React.cloneElement(ribbon, { key: 'ribbon' })].filter(Boolean)
    const footerIn = (region: 'start' | 'end') => [props.pagination === region && <DatasetControl.Pagination key='pagination' />, props.pageSizeSwitcher === region && <DatasetControl.PageSizeSwitcher key='pageSizeSwitcher' />].filter(Boolean)
    const footerStart = footerIn('start')
    const footerEnd = footerIn('end')
    const end = [props.ribbon === 'end' && React.cloneElement(ribbon, { key: 'ribbon' }), props.editColumns && <DatasetControl.EditColumns key='editColumns' />, props.quickFind && <DatasetControl.QuickFind key='quickFind' />, ...Array.from({ length: props.extraButtons }, (_, index) => <DefaultButton key={`extra${index}`} text={`Button ${index + 1}`} />)].filter(Boolean)

    return <PcfContextProvider>
        <div style={{ width: props.width }}>
            <DatasetControl stateKey='deals' onLoad={loadDeals} height='520px'>
                {(start.length > 0 || end.length > 0) && <DatasetControl.Header>
                    {start.length > 0 && <DatasetControl.Header.Start>{start}</DatasetControl.Header.Start>}
                    {end.length > 0 && <DatasetControl.Header.End>{end}</DatasetControl.Header.End>}
                </DatasetControl.Header>}
                <DatasetControl.Body>
                    <Grid stateKey='grid' modules={modules} />
                </DatasetControl.Body>
                {(footerStart.length > 0 || footerEnd.length > 0) && <DatasetControl.Footer>
                    {footerStart.length > 0 && <DatasetControl.Footer.Start>{footerStart}</DatasetControl.Footer.Start>}
                    {footerEnd.length > 0 && <DatasetControl.Footer.End>{footerEnd}</DatasetControl.Footer.End>}
                </DatasetControl.Footer>}
            </DatasetControl>
        </div>
    </PcfContextProvider>
}
