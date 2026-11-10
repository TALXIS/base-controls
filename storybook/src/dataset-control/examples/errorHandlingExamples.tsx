import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { VIEWS_FILE, withFiles } from './shared'

const FAILED_LOAD_CODE = `let attempt = 0

//every other attempt fails, so Try again loads the deals
const loadDealsOnRetry = async () => {
    attempt++
    if (attempt % 2 === 1) {
        await new Promise(resolve => setTimeout(resolve, 600))
        throw Object.assign(new Error('The deals could not be loaded.'), { cause: 'The deals service did not respond within 30 seconds.' })
    }
    return { provider: createDealsProvider() }
}

const GridExample = () => {
    const [failures, setFailures] = React.useState(0)

    //counts each failed load beside what the control shows
    const onSetup = (control: IDatasetControl) => {
        control.lifecycle.events.addEventListener('onInitFailed', () => setFailures(count => count + 1))
    }

    return <Stack tokens={{ childrenGap: 8 }}>
        <DatasetControl onLoad={loadDealsOnRetry} onSetup={onSetup} height='420px'>
            <DatasetControl.Body>
                <ClientSideGrid />
            </DatasetControl.Body>
        </DatasetControl>
        <Text>Failed loads: {failures}</Text>
    </Stack>
}
`

const FAILED_ACTIONS_CODE = `import { loadDeals } from './views'

//stands in for your server, which the toggle takes down
const server = { isDown: false }

const callServer = async (failure: string) => {
    await new Promise(resolve => setTimeout(resolve, 800))
    if (server.isDown) {
        throw new Error(failure)
    }
}

const loadCommands = async (): Promise<IRibbonCommand[]> => [{ id: 'sync', label: 'Sync to CRM', iconName: 'Sync', onExecute: () => callServer('The CRM did not respond.') }]

//the views are kept in this browser, but saving a new one goes through the server first
class DealViewsStore extends LocalStorageUserQueriesStore {
    public async createView(name: string, view: IUserQueryView): Promise<string> {
        await callServer('The view could not be saved while the server is down.')
        return super.createView(name, view)
    }
}

const userViews = createUserQueriesModule({ createStore: () => new DealViewsStore({ storageKey: 'docs.failingDealViews' }) })

const GridExample = () => {
    const [log, setLog] = React.useState<string[]>([])
    const write = (line: string) => setLog(log => [line, ...log].slice(0, 3))

    //logs each failure beside the error dialog
    const onSetup = (control: IDatasetControl) => {
        //a failed user view
        control.executor.events.addEventListener('onExecuteFailed', error => write(\`views: \${(error as Error).message}\`))
        //a failed command, on the ribbon's own executor
        control.parts.observe('ribbon', ribbon => ribbon.executor.events.addEventListener('onExecuteFailed', error => write(\`ribbon: \${(error as Error).message}\`)))
    }

    return <Stack tokens={{ childrenGap: 8 }}>
        <Toggle label='Server is down' inlineLabel onChange={(_, checked) => { server.isDown = !!checked }} />
        <DatasetControl modules={[userViews]} onLoad={loadDeals} onSetup={onSetup} height='420px'>
            <DatasetControl.Header>
                <DatasetControl.Header.Start>
                    <DatasetControl.ViewSwitcher>
                        <DatasetControl.UserQueries />
                    </DatasetControl.ViewSwitcher>
                </DatasetControl.Header.Start>
                <DatasetControl.Header.End>
                    <DatasetControl.Ribbon onLoad={loadCommands} />
                </DatasetControl.Header.End>
            </DatasetControl.Header>
            <DatasetControl.Body>
                <ClientSideGrid />
            </DatasetControl.Body>
        </DatasetControl>
        {log.map((line, index) => <Text key={index}>{line}</Text>)}
    </Stack>
}
`

export const FailedLoadExample = () => <GridExampleRunner seedCode={FAILED_LOAD_CODE} tabs={['preview', 'code']} />
export const FailedActionsExample = () => <GridExampleRunner seedCode={withFiles(FAILED_ACTIONS_CODE, VIEWS_FILE)} tabs={['preview', 'code']} />
