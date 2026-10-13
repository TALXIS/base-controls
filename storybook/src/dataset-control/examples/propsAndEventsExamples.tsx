import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { VIEWS_FILE, withFiles } from './shared'

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
        <DatasetControl stateKey='deals' key={mountKey} onLoad={loadDeals} onReady={onReady} onDestroyed={() => write('onDestroyed')} height='380px'>
            <DatasetControl.Header>
                <DatasetControl.Header.Start>
                    <DatasetControl.ViewSwitcher onLoad={loadDealViews} />
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

export const WatchControlExample = () => <GridExampleRunner seedCode={withFiles(WATCH_CONTROL_CODE, VIEWS_FILE)} />
