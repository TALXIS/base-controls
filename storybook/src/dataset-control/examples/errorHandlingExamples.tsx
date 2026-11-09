import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { VIEWS_FILE, withFiles } from './shared'

const FAILED_LOAD_CODE = `import { loadDeals } from './views'

let attempt = 0

//every other attempt fails, so Try again loads the deals
const loadDealsOnRetry = async () => {
    attempt++
    if (attempt % 2 === 1) {
        await new Promise(resolve => setTimeout(resolve, 600))
        throw Object.assign(new Error('The deals could not be loaded.'), { cause: 'The deals service did not respond within 30 seconds.' })
    }
    return loadDeals()
}

const GridExample = () => {
    const [failures, setFailures] = React.useState(0)

    //counts each failed load beside what the control shows
    const onSetup = (control: IDatasetControl) => {
        control.lifecycle.events.addEventListener('onInitFailed', () => setFailures(count => count + 1))
    }

    return <Stack tokens={{ childrenGap: 8 }}>
        <DatasetControl stateKey='deals-error-handling' onLoad={loadDealsOnRetry} onSetup={onSetup} height='420px'>
            <DatasetControl.Header>
                <DatasetControl.Header.Start>
                    <DatasetControl.ViewSwitcher />
                </DatasetControl.Header.Start>
            </DatasetControl.Header>
            <DatasetControl.Body>
                <ClientSideGrid stateKey='grid' />
            </DatasetControl.Body>
        </DatasetControl>
        <Text>Failed loads: {failures}</Text>
    </Stack>
}
`

const FAILED_ACTIONS_CODE = `import { loadDeals, saveDealViewData } from './views'

//stands in for your server, which the toggle takes down
const server = { isDown: false }

const callServer = async (failure: string) => {
    await new Promise(resolve => setTimeout(resolve, 800))
    if (server.isDown) {
        throw new Error(failure)
    }
}

const loadCommands = async (): Promise<IRibbonCommand[]> => [{ id: 'sync', label: 'Sync to CRM', iconName: 'Sync', onExecute: () => callServer('The CRM did not respond.') }]

//the views are kept in this browser, but saving one goes through the server first
class DealViewsStore extends LocalStorageUserQueriesStore {
    public async createView(name: string, view: IUserQueryView): Promise<string> {
        await callServer('The view could not be saved while the server is down.')
        return super.createView(name, view)
    }

    public async updateView(viewId: string, view: IUserQueryView): Promise<void> {
        await callServer('The view could not be saved while the server is down.')
        await super.updateView(viewId, view)
    }
}

const getLogStyles = (theme: ITheme) => mergeStyleSets({
    log: { padding: '8px 12px', minHeight: 66, border: \`1px solid \${theme.semanticColors.bodyDivider}\`, borderRadius: theme.effects.roundedCorner4, fontFamily: 'Consolas, monospace', color: theme.semanticColors.bodySubtext },
})

const GridExample = () => {
    const theme = useTheme()
    const styles = React.useMemo(() => getLogStyles(theme), [theme])
    const [isDown, setIsDown] = React.useState(false)
    const [log, setLog] = React.useState<string[]>([])
    const write = (line: string) => setLog(log => [line, ...log].slice(0, 3))
    const modules = React.useMemo(() => [createUserQueriesModule({ createStore: () => new DealViewsStore({ storageKey: 'docs.failingDealViews' }) })], [])

    const toggleServer = (checked: boolean) => {
        server.isDown = checked
        setIsDown(checked)
    }

    //logs each failure beside the error dialog
    const onSetup = (control: IDatasetControl) => {
        saveDealViewData(control)
        control.parts.observe('ribbon', ribbon => ribbon.events.addEventListener('onExecuteFailed', (command, error) => write(\`\${command.id}: \${(error as Error).message}\`)))
        control.modules.observe('userQueries', userQueries => userQueries.events.addEventListener('onOperationFailed', (error: Error) => write(\`views: \${error.message}\`)))
    }

    return <Stack tokens={{ childrenGap: 8 }}>
        <Toggle label='Server is down' inlineLabel checked={isDown} onChange={(_, checked) => toggleServer(!!checked)} />
        <DatasetControl modules={modules} onLoad={loadDeals} onSetup={onSetup} stateKey='deals-failed-actions' height='420px'>
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
                <ClientSideGrid stateKey='grid' />
            </DatasetControl.Body>
        </DatasetControl>
        <div className={styles.log}>
            {log.map((line, index) => <div key={index}>{line}</div>)}
        </div>
    </Stack>
}
`

export const FailedLoadExample = () => <GridExampleRunner seedCode={withFiles(FAILED_LOAD_CODE, VIEWS_FILE)} tabs={['preview', 'code']} />
export const FailedActionsExample = () => <GridExampleRunner seedCode={withFiles(FAILED_ACTIONS_CODE, VIEWS_FILE)} tabs={['preview', 'code']} />
