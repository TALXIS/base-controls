import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { VIEWS_FILE, withFiles } from './shared'

const WATCH_RUNTIME_CODE = `import { loadDeals, loadDealViews } from './views'

const GridExample = () => {
    const [log, setLog] = React.useState<string[]>([])
    const [mountKey, setMountKey] = React.useState(0)
    const runtimeRef = React.useRef<IDatasetControlRuntime>()
    const write = (line: string) => setLog(log => [line, ...log].slice(0, 8))

    const onReady = (runtime: IDatasetControlRuntime) => {
        runtimeRef.current = runtime
        write('onReady')
        runtime.events.addEventListener('onLoadStarted', () => write('onLoadStarted'))
        runtime.events.addEventListener('onLoaded', () => write(\`onLoaded, view \${runtime.getViewId()}\`))
        runtime.events.addEventListener('onLoadFailed', () => write('onLoadFailed'))
    }

    return <Stack tokens={{ childrenGap: 8 }}>
        <Stack horizontal tokens={{ childrenGap: 8 }}>
            <DefaultButton text='Show won deals' onClick={() => runtimeRef.current?.reload({ viewId: 'won' })} />
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

export const WatchRuntimeExample = () => <GridExampleRunner seedCode={withFiles(WATCH_RUNTIME_CODE, VIEWS_FILE)} />
