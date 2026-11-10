import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'

const DEAL_SUMMARY_CODE = `import { Runtime, RuntimeHost, RuntimeLifecycle, useRuntime } from '@talxis/base-controls'
import { DefaultButton, Text, Toggle } from '@fluentui/react'

const OPEN_DEALS = [4000, 21500, 9000]

//stands in for a server call
const callServer = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

class DealSummaryRuntime extends Runtime {
    //runs onInit when the host starts the mount, and keeps the status, the error and the events
    public readonly lifecycle = new RuntimeLifecycle({ onInit: () => this._init() })
    private _total = 0
    private _isServiceDown: () => boolean

    constructor(isServiceDown: () => boolean) {
        super()
        this._isServiceDown = isServiceDown
    }

    public getTotal(): number {
        return this._total
    }

    //a throw here shows the error with Try again
    private async _init(): Promise<void> {
        await callServer(1000)
        if (this._isServiceDown()) {
            throw new Error('The deals service is not reachable.')
        }
        this._total = OPEN_DEALS.reduce((sum, value) => sum + value, 0)
    }
}

//drawn once the runtime is ready, so it reads what the runtime loaded
const DealSummary = () => {
    const runtime = useRuntime<DealSummaryRuntime>()
    return <>
        <Text>Open deals: {runtime.getTotal().toLocaleString()} USD </Text>
        {/* a new runtime, which loads again */}
        <DefaultButton text='Reload' onClick={() => runtime.lifecycle.remount()} />
    </>
}

const GridExample = () => {
    const isServiceDown = React.useRef(false)
    const [entries, setEntries] = React.useState<string[]>([])
    const log = (entry: string) => setEntries(current => [...current, entry])

    //called with every new runtime, so subscribe here
    const onSetup = (runtime: DealSummaryRuntime) => {
        log('onSetup')
        runtime.lifecycle.events.addEventListener('onReady', () => log('onReady'))
        runtime.lifecycle.events.addEventListener('onInitFailed', error => log(\`onInitFailed: \${(error as Error).message}\`))
        runtime.lifecycle.events.addEventListener('onDestroyed', () => log('onDestroyed'))
    }

    return <>
        <Toggle label='Service unavailable' inlineLabel onChange={(_, checked) => { isServiceDown.current = !!checked }} />
        <RuntimeHost createRuntime={() => new DealSummaryRuntime(() => isServiceDown.current)} onSetup={onSetup}>
            <DealSummary />
        </RuntimeHost>
        <pre>{entries.join('\\n')}</pre>
    </>
}
`

const KEEP_STATE_CODE = `import { IStateStore, Runtime, RuntimeHost, RuntimeLifecycle, Spinner, useControlStateStore, useRuntime } from '@talxis/base-controls'
import { Dropdown, Text } from '@fluentui/react'

const DEALS = [
    { owner: 'Anna Novak', value: 4000 },
    { owner: 'Ben Carter', value: 21500 },
    { owner: 'Anna Novak', value: 9000 },
]

const OWNERS = ['Everyone', 'Anna Novak', 'Ben Carter']

class DealSummaryRuntime extends Runtime {
    public readonly lifecycle = new RuntimeLifecycle({ onInit: () => this._init() })
    private _store: IStateStore
    private _total = 0

    constructor(store: IStateStore) {
        super()
        this._store = store
    }

    public getOwner(): string {
        return this._store.get<string>('owner') ?? 'Everyone'
    }

    //kept in the store, then a new runtime loads that owner's deals
    public setOwner(owner: string): void {
        this._store.set('owner', owner)
        this.lifecycle.remount()
    }

    public getTotal(): number {
        return this._total
    }

    private async _init(): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 800))
        const owner = this.getOwner()
        this._total = DEALS.filter(deal => owner === 'Everyone' || deal.owner === owner).reduce((sum, deal) => sum + deal.value, 0)
    }
}

//shown while the runtime loads; it can read the runtime too
const LoadingDeals = () => {
    const runtime = useRuntime<DealSummaryRuntime>()
    return <Spinner label={\`Loading the deals of \${runtime.getOwner()}...\`} />
}

//drawn once the runtime is ready, so it reads what the runtime loaded
const DealSummary = () => {
    const runtime = useRuntime<DealSummaryRuntime>()
    return <>
        <Dropdown label='Account manager' selectedKey={runtime.getOwner()} options={OWNERS.map(owner => ({ key: owner, text: owner }))} onChange={(_, option) => runtime.setOwner(String(option!.key))} />
        <Text>Open deals: {runtime.getTotal().toLocaleString()} USD</Text>
    </>
}

const GridExample = () => {
    //outlives every runtime, so the next mount opens on the owner this one stored
    const store = useControlStateStore('dealSummary')
    return <RuntimeHost createRuntime={() => new DealSummaryRuntime(store)} components={{ placeholder: { onRenderContainer: () => <LoadingDeals /> } }}>
        <DealSummary />
    </RuntimeHost>
}
`

const RUN_ACTIONS_CODE = `import { Runtime, RuntimeHost, RuntimeLifecycle, useRuntime } from '@talxis/base-controls'
import { DefaultButton, getTheme, MessageBar, MessageBarType, PrimaryButton, Stack, Text } from '@fluentui/react'

const theme = getTheme()

const CARD_STYLE: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    maxWidth: 480,
    padding: 20,
    border: \`1px solid \${theme.palette.neutralLight}\`,
    borderRadius: 8,
}

//stands in for a server call
const callServer = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

const postToFinance = async (total: number) => {
    await callServer(1000)
    throw new Error(\`The finance service did not accept \${total.toLocaleString()} USD: the quarter is closed.\`)
}

class DealSummaryRuntime extends Runtime {
    public readonly lifecycle = new RuntimeLifecycle()
    private _total = 34500

    public getTotal(): number {
        return this._total
    }

    //the host covers the control with a spinner and the message until it ends
    public async addDeal(value: number): Promise<void> {
        await this.execute(async () => {
            await callServer(1500)
            this._total += value
        }, { loading: { message: 'Saving the deal...' } })
    }
}

const DealSummary = () => {
    const runtime = useRuntime<DealSummaryRuntime>()
    const [total, setTotal] = React.useState(runtime.getTotal())

    //execute rethrows by default, so setTotal runs only when the deal was saved
    const addDeal = async () => {
        await runtime.addDeal(5000)
        setTotal(runtime.getTotal())
    }

    //the host shows the failure under the title; rethrow: false resolves undefined instead
    const sendToFinance = () => runtime.execute(() => postToFinance(total), { error: { title: 'The summary could not be sent to finance.', rethrow: false } })

    return <>
        <Stack>
            <Text variant='small' styles={{ root: { color: theme.palette.neutralSecondary } }}>Open deals</Text>
            <Text variant='xxLarge' styles={{ root: { fontWeight: 600 } }}>{total.toLocaleString()} USD</Text>
        </Stack>
        <Stack horizontal tokens={{ childrenGap: 8 }}>
            <PrimaryButton text='Add a 5,000 USD deal' iconProps={{ iconName: 'Add' }} onClick={addDeal} />
            <DefaultButton text='Send to finance' iconProps={{ iconName: 'Send' }} onClick={sendToFinance} />
        </Stack>
    </>
}

const GridExample = () => (
    <RuntimeHost createRuntime={() => new DealSummaryRuntime()} components={{
        //the card is the host's box, so the spinner covers it and the failures show inside it
        container: { onRenderContainer: props => <div {...props} style={CARD_STYLE} /> },
        //replaces the error dialog; onDismiss takes the failure away and shows the next one
        executeError: {
            onRenderError: ({ title, error, onDismiss }) => <MessageBar messageBarType={MessageBarType.error} isMultiline onDismiss={onDismiss}>
                <b>{title}</b> {(error as Error).message}
            </MessageBar>,
        },
    }}>
        <DealSummary />
    </RuntimeHost>
)
`

export const DealSummaryExample = () => <GridExampleRunner seedCode={DEAL_SUMMARY_CODE} tabs={['preview', 'code']} />

export const KeepStateExample = () => <GridExampleRunner seedCode={KEEP_STATE_CODE} tabs={['preview', 'code']} />

export const RunActionsExample = () => <GridExampleRunner seedCode={RUN_ACTIONS_CODE} tabs={['preview', 'code']} />
