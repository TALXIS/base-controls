import React from 'react'
import { ContextualMenuItemType, IButtonProps } from '@fluentui/react'
import {
    createClientSideRowModelModule, createRowSelectionModule, createSortingModule, DatasetControl, Grid, IDatasetControlLoadParameters, IDatasetControl,
    IRibbonCommand, PcfContextProvider, useDataProvider, ViewSwitcherUiComponents,
} from '@talxis/base-controls'
import { loadDeals, loadDealViews } from '../dealViews'

interface IScratchDatasetControlProps {
    /** Whether the parts' slots are replaced, to see the overrides take effect. */
    overrideSlots?: boolean
}

const ThrowingPart = () => {
    throw new Error('A part failed to render.')
}

//slow to load, and different for no, one and several selected records
const ScratchRibbon = () => {
    const provider = useDataProvider()
    const onLoad = async (): Promise<IRibbonCommand[]> => {
        await new Promise(resolve => setTimeout(resolve, 400))
        const count = provider.getSelectedRecordIds().length
        const commands: IRibbonCommand[] = [{ id: 'refresh', label: 'Refresh', iconName: 'Refresh', onExecute: async () => { await provider.refresh() } }]
        if (count === 1) {
            commands.push({ id: 'open', label: 'Open', iconName: 'OpenInNewWindow', onExecute: () => new Promise(resolve => setTimeout(resolve, 1500)) })
        }
        if (count > 0) {
            commands.push({ id: 'fail', label: `Fail on ${count}`, iconName: 'Error', onExecute: () => Promise.reject(new Error('The command failed.')) })
        }
        return commands
    }
    return <DatasetControl.Ribbon onLoad={onLoad} />
}

const ViewSwitcherWithCommand = (props: IButtonProps) => ViewSwitcherUiComponents.onRenderButton({
    ...props,
    menuProps: {
        ...props.menuProps!,
        items: [...props.menuProps!.items, { key: 'divider', itemType: ContextualMenuItemType.Divider }, { key: 'manage', text: 'Manage views', iconProps: { iconName: 'Settings' } }],
    },
})

/**
 * The scratch harness for `DatasetControl` over a deals provider with three views. Edit this file to try
 * things against the control.
 */
export const ScratchDatasetControl = (props: IScratchDatasetControlProps) => {
    const [mountKey, setMountKey] = React.useState(0)
    const [isThrowing, setIsThrowing] = React.useState(false)
    const failNextLoadRef = React.useRef(false)
    const modules = React.useMemo(() => ({
        rowModel: createClientSideRowModelModule(),
        rowSelection: createRowSelectionModule({ mode: 'multiple' }),
        sorting: createSortingModule(),
    }), [])

    //parked on window so the control can be poked at from the browser console
    const onReady = (control: IDatasetControl) => Object.assign(window, { datasetControl: control })

    const onLoad = async (params: IDatasetControlLoadParameters) => {
        if (failNextLoadRef.current) {
            failNextLoadRef.current = false
            await new Promise(resolve => setTimeout(resolve, 600))
            throw new Error('The deals could not be loaded.')
        }
        return loadDeals(params)
    }

    return <PcfContextProvider>
        <button onClick={() => setMountKey(key => key + 1)}>Remount</button>
        <button onClick={() => failNextLoadRef.current = true}>Fail next load</button>
        <button onClick={() => setIsThrowing(true)}>Throw while rendering</button>
        <DatasetControl onLoadViews={loadDealViews} key={mountKey} stateKey='scratch-deals' onLoad={onLoad} onReady={onReady} height="640px">
            <DatasetControl.Header>
                <DatasetControl.Header.Start>
                    <DatasetControl.ViewSwitcher components={props.overrideSlots ? { onRenderButton: buttonProps => <ViewSwitcherWithCommand {...buttonProps} /> } : undefined} />
                </DatasetControl.Header.Start>
                <DatasetControl.Header.End>
                    <ScratchRibbon />
                    <DatasetControl.EditColumns
                        components={props.overrideSlots ? {
                            columnList: {
                                onRenderColumn: columnProps => <DatasetControl.Ui.EditColumnsColumn {...columnProps} commands={[{ key: 'info', iconProps: { iconName: 'Info' }, title: columnProps.column.name }, ...columnProps.commands]} />,
                            },
                        } : undefined} />
                    <DatasetControl.QuickFind />
                </DatasetControl.Header.End>
            </DatasetControl.Header>
            <DatasetControl.Notifications messages={props.overrideSlots ? [{ text: 'Deals sync nightly.', level: 'INFO' }] : undefined} />
            {isThrowing && <ThrowingPart />}
            <DatasetControl.Body>
                <Grid stateKey='grid' modules={modules} />
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
    </PcfContextProvider>
}
