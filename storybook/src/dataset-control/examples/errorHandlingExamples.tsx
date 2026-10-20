import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { VIEWS_FILE, withFiles } from './shared'
import { USER_VIEWS_FILE } from './userViewsExamples'

const FAILED_LOAD_CODE = `import { IDealViewData, loadDeals, loadDealViews } from './views'

let attempt = 0

//every other attempt fails, so Try again loads the deals
const loadDealsOnRetry = async (params: IDatasetControlLoadParameters<IDealViewData>) => {
    attempt++
    if (attempt % 2 === 1) {
        await new Promise(resolve => setTimeout(resolve, 600))
        throw Object.assign(new Error('The deals could not be loaded.'), { cause: 'The deals service did not respond within 30 seconds.' })
    }
    return loadDeals(params)
}

const GridExample = () => <DatasetControl onLoadViews={loadDealViews} stateKey='deals' onLoad={loadDealsOnRetry} height='420px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher />
        </DatasetControl.Header.Start>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <Grid stateKey='grid' modules={{ rowModel: createClientSideRowModelModule() }} />
    </DatasetControl.Body>
</DatasetControl>
`

const FAILED_ACTIONS_CODE = `import { loadDealViews } from './views'
import { DealView, readViewData, loadView, writeViewData, userViews } from './userViews'

//stands in for your server, which the toggle takes down
const server = { isDown: false }

const syncToCrm = async () => {
    await new Promise(resolve => setTimeout(resolve, 800))
    if (server.isDown) {
        throw new Error('The CRM did not respond.')
    }
}

const loadCommands = async (): Promise<IRibbonCommand[]> => [{ id: 'sync', label: 'Sync to CRM', iconName: 'Sync', onExecute: syncToCrm }]

const saveWhileUp = (parameters: IUserQueryWriteParameters<DealView>) => {
    if (server.isDown) {
        throw new Error('The view could not be saved while the server is down.')
    }
    writeViewData(parameters)
}

const GridExample = () => {
    const [isDown, setIsDown] = React.useState(false)
    const modules = React.useMemo(() => [createUserQueriesModule<DealView>({ provider: userViews, onReadViewData: readViewData, onWriteViewData: saveWhileUp })], [])

    const toggleServer = (checked: boolean) => {
        server.isDown = checked
        setIsDown(checked)
    }

    return <Stack tokens={{ childrenGap: 8 }}>
        <Toggle label='Server is down' inlineLabel checked={isDown} onChange={(_, checked) => toggleServer(!!checked)} />
        <DatasetControl modules={modules} onLoadViews={loadDealViews} onLoad={loadView} stateKey='failingDeals' height='420px'>
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
                <Grid stateKey='grid' modules={{ rowModel: createClientSideRowModelModule() }} />
            </DatasetControl.Body>
        </DatasetControl>
    </Stack>
}
`

export const FailedLoadExample = () => <GridExampleRunner seedCode={withFiles(FAILED_LOAD_CODE, VIEWS_FILE)} />
export const FailedActionsExample = () => <GridExampleRunner seedCode={withFiles(FAILED_ACTIONS_CODE, VIEWS_FILE, USER_VIEWS_FILE)} />
