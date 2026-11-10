import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'

const DEAL_SUMMARY_CODE = `import { Runtime, RuntimeHost, RuntimeLifecycle, useRuntime } from '@talxis/base-controls'
import { DefaultButton, getTheme, Stack, Text, Toggle } from '@fluentui/react'

const theme = getTheme()

const CARD_STYLE: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    minHeight: 120,
    padding: 20,
    border: \`1px solid \${theme.palette.neutralLight}\`,
    borderRadius: 8,
}

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
        <Stack>
            <Text variant='small' styles={{ root: { color: theme.palette.neutralSecondary } }}>Open deals</Text>
            <Text variant='xxLarge' styles={{ root: { fontWeight: 600 } }}>{runtime.getTotal().toLocaleString()} USD</Text>
        </Stack>
        {/* a new runtime, which loads again */}
        <DefaultButton text='Reload' iconProps={{ iconName: 'Refresh' }} onClick={() => runtime.lifecycle.remount()} styles={{ root: { alignSelf: 'flex-start' } }} />
    </>
}

//the lifecycle events of every mount, oldest first
const EventLog = (props: { entries: string[] }) => <Stack tokens={{ childrenGap: 4 }} styles={{ root: { padding: 12, borderRadius: 8, backgroundColor: theme.palette.neutralLighterAlt } }}>
    <Text variant='small' styles={{ root: { color: theme.palette.neutralSecondary, fontWeight: 600 } }}>Lifecycle events</Text>
    {props.entries.map((entry, index) => <Text key={index} variant='small' styles={{ root: { fontFamily: 'Consolas, monospace', color: entry.startsWith('onInitFailed') ? theme.palette.redDark : theme.palette.neutralPrimary } }}>{entry}</Text>)}
</Stack>

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

    return <Stack tokens={{ childrenGap: 12 }} styles={{ root: { maxWidth: 480 } }}>
        <Toggle label='Service unavailable' inlineLabel onChange={(_, checked) => { isServiceDown.current = !!checked }} />
        {/* the card is the host's box, so the loading state and a failed load show inside it */}
        <RuntimeHost createRuntime={() => new DealSummaryRuntime(() => isServiceDown.current)} onSetup={onSetup} components={{ container: { onRenderContainer: props => <div {...props} style={CARD_STYLE} /> } }}>
            <DealSummary />
        </RuntimeHost>
        <EventLog entries={entries} />
    </Stack>
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
import { DefaultButton, getTheme, PrimaryButton, Stack, Text } from '@fluentui/react'

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

    //the host opens the error dialog under the title; rethrow: false resolves undefined instead
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
    //the card is the host's box, so the spinner covers it
    <RuntimeHost createRuntime={() => new DealSummaryRuntime()} components={{ container: { onRenderContainer: props => <div {...props} style={CARD_STYLE} /> } }}>
        <DealSummary />
    </RuntimeHost>
)
`

const OWN_UI_CODE = `import { NotificationMessageBar, Runtime, RuntimeHost, RuntimeLifecycle, useRuntime } from '@talxis/base-controls'
import { DefaultButton, getTheme, Icon, IMessageBarProps, PrimaryButton, ProgressIndicator, Shimmer, ShimmerElementType, Stack, Text, Toggle } from '@fluentui/react'

const theme = getTheme()

const CARD_STYLE: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    minHeight: 120,
    padding: 20,
    border: \`1px solid \${theme.palette.neutralLight}\`,
    borderRadius: 8,
}

class DealSummaryRuntime extends Runtime {
    public readonly lifecycle = new RuntimeLifecycle({ onInit: () => this._init() })
    private _isServiceDown: () => boolean
    private _total = 0

    constructor(isServiceDown: () => boolean) {
        super()
        this._isServiceDown = isServiceDown
    }

    public getTotal(): number {
        return this._total
    }

    public async sendToFinance(): Promise<void> {
        await this.execute(() => this._callServer(1500), { loading: { message: 'Sending to finance...' }, error: { title: 'The summary could not be sent to finance.', rethrow: false } })
    }

    private async _init(): Promise<void> {
        await this._callServer(1500)
        this._total = 34500
    }

    //stands in for a server call, which fails while the service is down
    private async _callServer(ms: number): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, ms))
        if (this._isServiceDown()) {
            throw new Error('The deals service is not reachable.')
        }
    }
}

const DealSummary = () => {
    const runtime = useRuntime<DealSummaryRuntime>()
    return <>
        <Stack>
            <Text variant='small' styles={{ root: { color: theme.palette.neutralSecondary } }}>Open deals</Text>
            <Text variant='xxLarge' styles={{ root: { fontWeight: 600 } }}>{runtime.getTotal().toLocaleString()} USD</Text>
        </Stack>
        <Stack horizontal tokens={{ childrenGap: 8 }}>
            <PrimaryButton text='Send to finance' iconProps={{ iconName: 'Send' }} onClick={() => runtime.sendToFinance()} />
            <DefaultButton text='Reload' iconProps={{ iconName: 'Refresh' }} onClick={() => runtime.lifecycle.remount()} />
        </Stack>
    </>
}

//the summary's shape in the brand's colours, in place of the spinner and its text
const SummarySkeleton = () => <Stack tokens={{ childrenGap: 8 }}>
    {[{ width: 80, height: 12 }, { width: 200, height: 32 }, { width: 240, height: 32 }].map(({ width, height }) =>
        <Shimmer key={width} width={width} shimmerColors={{ shimmer: theme.palette.themeLighter, shimmerWave: theme.palette.themeLight }} shimmerElements={[{ type: ShimmerElementType.line, height }]} />)}
</Stack>

//a card in place of the bar: children hold the error's message, actions its commands
const ErrorCard = (props: IMessageBarProps) => <Stack tokens={{ childrenGap: 12 }} styles={{ root: { padding: 16, borderRadius: 8, backgroundColor: theme.semanticColors.errorBackground } }}>
    <Stack horizontal verticalAlign='center' tokens={{ childrenGap: 8 }}>
        <Icon iconName='PlugDisconnected' styles={{ root: { fontSize: 20, color: theme.palette.redDark } }} />
        <Text variant='large' styles={{ root: { fontWeight: 600 } }}>The deals could not be loaded</Text>
    </Stack>
    <Text>{props.children}</Text>
    {props.actions}
</Stack>

//the bar draws its messages as HTML
const escapeHtml = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const GridExample = () => {
    const isServiceDown = React.useRef(false)

    return <Stack tokens={{ childrenGap: 12 }} styles={{ root: { maxWidth: 480 } }}>
        <Toggle label='Service unavailable' inlineLabel onChange={(_, checked) => { isServiceDown.current = !!checked }} />
        <RuntimeHost createRuntime={() => new DealSummaryRuntime(() => isServiceDown.current)} components={{
            container: { onRenderContainer: props => <div {...props} style={CARD_STYLE} /> },
            placeholder: { onRenderContainer: () => <SummarySkeleton /> },
            mountError: {
                onRenderMessageBar: props => <ErrorCard {...props} />,
                //the items are Details and Try again, each with its onClick
                onRenderCommandBar: props => <Stack horizontal tokens={{ childrenGap: 8 }}>
                    {props.items.map(item => <DefaultButton key={item.key} text={item.text} iconProps={item.iconProps} onClick={() => item.onClick?.()} />)}
                </Stack>,
            },
            //a progress bar over the card while execute runs, above the message
            loadingOverlay: { onRenderSpinner: () => <ProgressIndicator styles={{ root: { width: 200 } }} /> },
            //one notification bar in place of the error dialog, grouping the failures once there are several
            executeError: {
                onRenderErrors: ({ failures, onDismiss }) => <NotificationMessageBar messages={failures.map(failure => ({
                    level: 'ERROR',
                    text: \`<b>\${escapeHtml(failure.title)}</b> \${escapeHtml((failure.error as Error).message)}\`,
                    onDismiss: () => onDismiss(failure),
                }))} />,
            },
        }}>
            <DealSummary />
        </RuntimeHost>
    </Stack>
}
`

export const DealSummaryExample = () => <GridExampleRunner seedCode={DEAL_SUMMARY_CODE} tabs={['preview', 'code']} />

export const KeepStateExample = () => <GridExampleRunner seedCode={KEEP_STATE_CODE} tabs={['preview', 'code']} />

export const RunActionsExample = () => <GridExampleRunner seedCode={RUN_ACTIONS_CODE} tabs={['preview', 'code']} />

export const OwnUiExample = () => <GridExampleRunner seedCode={OWN_UI_CODE} tabs={['preview', 'code']} />
