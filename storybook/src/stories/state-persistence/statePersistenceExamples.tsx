import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import type { IGridExampleFile } from '../../grid/GridLivePreview'
import { VIEWS_FILE, withFiles } from '../../dataset-control/examples/shared'

const COME_BACK_CODE = `import { createClientSideRowModelModule, createSortingModule, DatasetControl, Grid, StateProvider, StateStore } from '@talxis/base-controls'
import { DefaultButton, mergeStyleSets, Stack, Text } from '@fluentui/react'
import { loadDeals } from './views'

const styles = mergeStyleSets({
    layout: { display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 16 },
    store: { margin: 0, padding: 12, fontSize: 12, background: 'color-mix(in srgb, currentColor 4%, transparent)', border: '1px solid color-mix(in srgb, currentColor 15%, transparent)', borderRadius: 4, overflow: 'auto', maxHeight: 420 },
})

const modules = [createClientSideRowModelModule(), createSortingModule()]

export const Deals = () => <DatasetControl stateKey='deals' onLoad={loadDeals} height='420px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher />
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            <DatasetControl.QuickFind />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <Grid stateKey='grid' modules={modules} />
    </DatasetControl.Body>
</DatasetControl>

const GridExample = () => {
    //the dictionary the store writes into, shown beside the deals
    const state = React.useMemo(() => ({}), [])
    const store = React.useMemo(() => new StateStore({ state }), [state])
    const [isShown, setIsShown] = React.useState(true)
    const [kept, setKept] = React.useState('{}')

    //the control writes its state as it unmounts
    React.useEffect(() => setKept(JSON.stringify(state, null, 2)), [isShown])

    return <StateProvider store={store}>
        <Stack tokens={{ childrenGap: 12 }}>
            <DefaultButton text={isShown ? 'Leave the deals' : 'Come back'} onClick={() => setIsShown(!isShown)} styles={{ root: { alignSelf: 'flex-start' } }} />
            <div className={styles.layout}>
                {isShown ? <Deals /> : <Text>You left the deals.</Text>}
                <pre className={styles.store}>{kept}</pre>
            </div>
        </Stack>
    </StateProvider>
}
`

const OWN_COMPONENT_CODE = `import { StateProvider, StateStore, useControlStateStore } from '@talxis/base-controls'
import { mergeStyleSets, Stack, TextField, Toggle } from '@fluentui/react'

const styles = mergeStyleSets({
    store: { margin: 0, padding: 12, fontSize: 12, background: 'color-mix(in srgb, currentColor 4%, transparent)', border: '1px solid color-mix(in srgb, currentColor 15%, transparent)', borderRadius: 4 },
})

interface IDraftNoteProps {
    onWritten: () => void
}

const DraftNote = (props: IDraftNoteProps) => {
    const store = useControlStateStore('draftNote')
    //read once, at mount
    const [text, setText] = React.useState(store.get<string>('text') ?? '')
    const onChange = (value: string) => {
        setText(value)
        store.set('text', value)
        props.onWritten()
    }
    return <TextField label='Draft' multiline autoAdjustHeight value={text} onChange={(_, value) => onChange(value ?? '')} />
}

//the note's state lands inside the planner's entry
const Planner = (props: IDraftNoteProps) => {
    const store = useControlStateStore('planner')
    return <StateProvider store={store}>
        <DraftNote onWritten={props.onWritten} />
    </StateProvider>
}

const GridExample = () => {
    const state = React.useMemo(() => ({}), [])
    const store = React.useMemo(() => new StateStore({ state }), [state])
    const [isShown, setIsShown] = React.useState(true)
    const [, setRevision] = React.useState(0)

    return <StateProvider store={store}>
        <Stack tokens={{ childrenGap: 12 }} styles={{ root: { maxWidth: 520 } }}>
            <Toggle label='Show the note' inlineLabel checked={isShown} onChange={(_, checked) => setIsShown(!!checked)} />
            {isShown && <Planner onWritten={() => setRevision(revision => revision + 1)} />}
            <pre className={styles.store}>{JSON.stringify(state, null, 2)}</pre>
        </Stack>
    </StateProvider>
}
`

const SCOPES_CODE = `import { StateStore } from '@talxis/base-controls'
import { DefaultButton, mergeStyleSets, Stack } from '@fluentui/react'

const styles = mergeStyleSets({
    store: { margin: 0, padding: 12, fontSize: 12, background: 'color-mix(in srgb, currentColor 4%, transparent)', border: '1px solid color-mix(in srgb, currentColor 15%, transparent)', borderRadius: 4 },
})

const GridExample = () => {
    const state = React.useMemo(() => ({}), [])
    //writes into the dictionary it is given
    const store = React.useMemo(() => new StateStore({ state }), [state])
    const [, setRevision] = React.useState(0)

    const run = (change: () => void) => {
        change()
        setRevision(revision => revision + 1)
    }

    return <Stack tokens={{ childrenGap: 12 }} styles={{ root: { maxWidth: 520 } }}>
        <Stack horizontal wrap tokens={{ childrenGap: 8 }}>
            <DefaultButton text="set('zoom', 2)" onClick={() => run(() => store.set('zoom', 2))} />
            <DefaultButton text="scope('planner').set('view', 'week')" onClick={() => run(() => store.scope('planner').set('view', 'week'))} />
            <DefaultButton text="… .scope('filters').set('owner', 'Jana')" onClick={() => run(() => store.scope('planner').scope('filters').set('owner', 'Jana'))} />
            <DefaultButton text="delete('zoom')" onClick={() => run(() => store.delete('zoom'))} />
        </Stack>
        <pre className={styles.store}>{JSON.stringify(state, null, 2)}</pre>
    </Stack>
}
`

const PCF_CONTROL_FILE: IGridExampleFile = {
    name: 'index.tsx',
    code: `//a PCF control keeps the state for the session with the host
import ReactDOM from 'react-dom'
import { AppThemeProvider, IStateDictionary, PcfContextProvider, StateProvider, StateStore } from '@talxis/base-controls'
import { Deals } from './GridExample'

export class DealsControl implements ComponentFramework.StandardControl<{}, {}> {
    private _container!: HTMLDivElement
    private _context!: ComponentFramework.Context<{}>
    private _state!: IStateDictionary
    private _store!: StateStore

    //the host hands init the state setControlState kept
    public init(context: ComponentFramework.Context<{}>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement) {
        this._container = container
        this._state = state ?? {}
        this._store = new StateStore({ state: this._state })
    }

    public updateView(context: ComponentFramework.Context<{}>) {
        this._context = context
        ReactDOM.render(<PcfContextProvider context={context}>
            <StateProvider store={this._store}>
                <AppThemeProvider>
                    <Deals />
                </AppThemeProvider>
            </StateProvider>
        </PcfContextProvider>, this._container)
    }

    public destroy() {
        //the controls write their state as they unmount
        ReactDOM.unmountComponentAtNode(this._container)
        this._context.mode.setControlState(this._state)
    }
}
`,
}

export const ComeBackExample = () => <GridExampleRunner seedCode={withFiles(COME_BACK_CODE, VIEWS_FILE, PCF_CONTROL_FILE)} />
export const OwnComponentExample = () => <GridExampleRunner seedCode={OWN_COMPONENT_CODE} tabs={['preview', 'code']} />
export const ScopesExample = () => <GridExampleRunner seedCode={SCOPES_CODE} tabs={['preview', 'code']} />
