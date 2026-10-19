import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { VIEWS_FILE, withFiles } from './shared'

const DRIVE_CODE = `import { loadDeals, loadDealViews } from './views'

//a toolbar of your own: it talks to the control, and through it to the parts
const Shortcuts = () => {
    const control = useDatasetControl()

    const searchFor = (query: string) => {
        const quickFind = control.parts.get('quickFind')
        quickFind.setQuery(query)
        quickFind.search()
    }

    return <Stack horizontal wrap tokens={{ childrenGap: 8 }}>
        <DefaultButton text='Won deals' onClick={() => control.loadView('won')} />
        <DefaultButton text='Reload' onClick={() => control.reload()} />
        <DefaultButton text='Search Contoso' onClick={() => searchFor('Contoso')} />
        <DefaultButton text='Edit columns' onClick={() => control.parts.get('editColumns').open()} />
    </Stack>
}

const GridExample = () => <DatasetControl onLoadViews={loadDealViews} stateKey='deals' onLoad={loadDeals} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher />
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            <DatasetControl.EditColumns />
            <DatasetControl.QuickFind />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <Grid stateKey='grid' modules={{ rowModel: createClientSideRowModelModule() }} />
    </DatasetControl.Body>
    <DatasetControl.Footer>
        <DatasetControl.Footer.Start>
            <Shortcuts />
        </DatasetControl.Footer.Start>
    </DatasetControl.Footer>
</DatasetControl>
`

const WATCH_CONTROL_CODE = `import { loadDeals, loadDealViews } from './views'

const GridExample = () => {
    const [log, setLog] = React.useState<string[]>([])
    const [mountKey, setMountKey] = React.useState(0)
    const controlRef = React.useRef<IDatasetControl>()
    const write = (line: string) => setLog(log => [line, ...log].slice(0, 8))

    const onReady = (control: IDatasetControl) => {
        controlRef.current = control
        write('onReady')
        control.events.addEventListener('onLoadStarted', () => write('onLoadStarted'))
        control.events.addEventListener('onLoaded', () => write(\`onLoaded, view \${control.getViewId()}\`))
        control.events.addEventListener('onLoadFailed', () => write('onLoadFailed'))
    }

    return <Stack tokens={{ childrenGap: 8 }}>
        <Stack horizontal tokens={{ childrenGap: 8 }}>
            <DefaultButton text='Show won deals' onClick={() => controlRef.current?.loadView('won')} />
            <DefaultButton text='Remount' onClick={() => setMountKey(key => key + 1)} />
        </Stack>
        <DatasetControl onLoadViews={loadDealViews} stateKey='deals' key={mountKey} onLoad={loadDeals} onReady={onReady} onDestroyed={() => write('onDestroyed')} height='380px'>
            <DatasetControl.Header>
                <DatasetControl.Header.Start>
                    <DatasetControl.ViewSwitcher />
                </DatasetControl.Header.Start>
            </DatasetControl.Header>
            <DatasetControl.Body>
                <Grid stateKey='grid' modules={{ rowModel: createClientSideRowModelModule() }} />
            </DatasetControl.Body>
        </DatasetControl>
        <Stack>{log.map((line, index) => <Text key={index} variant='small'>{line}</Text>)}</Stack>
    </Stack>
}
`

export const DriveTheControlExample = () => <GridExampleRunner seedCode={withFiles(DRIVE_CODE, VIEWS_FILE)} />
export const WatchTheControlExample = () => <GridExampleRunner seedCode={withFiles(WATCH_CONTROL_CODE, VIEWS_FILE)} />
