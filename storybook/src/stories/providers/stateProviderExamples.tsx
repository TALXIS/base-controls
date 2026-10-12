import React from 'react'
import { mergeStyleSets, Stack, Text, TextField, Toggle } from '@fluentui/react'
import { IStateDictionary, StateProvider, StateStore, useControlStateStore } from '@talxis/base-controls'

const styles = mergeStyleSets({
    side: { flex: '1 1 0', minWidth: 0, padding: 16, border: '1px solid #edebe9', borderRadius: 4 },
    note: { minHeight: 96 },
    store: { margin: 0, padding: 12, fontSize: 12, background: '#faf9f8', border: '1px solid #edebe9', borderRadius: 4, whiteSpace: 'pre-wrap' },
})

//keeps what the user typed under its stateKey, so it is still there after the note is hidden and shown
const DraftNote = () => {
    const store = useControlStateStore('draft-note')
    const [text, setText] = React.useState(store.get<string>('text') ?? '')
    const onChange = (value: string) => {
        setText(value)
        store.set('text', value)
    }
    return <TextField label='Draft' multiline autoAdjustHeight className={styles.note} value={text} onChange={(_, value) => onChange(value ?? '')} />
}

interface ISideProps {
    title: string
}

//a StateProvider of its own, over a dictionary shown below it
const Side = (props: ISideProps) => {
    const state = React.useMemo<IStateDictionary>(() => ({}), [])
    const store = React.useMemo(() => new StateStore({ state }), [state])
    const [isShown, setIsShown] = React.useState(true)
    const [text, setText] = React.useState('{}')

    React.useEffect(() => {
        const interval = setInterval(() => setText(JSON.stringify(state, null, 2)), 300)
        return () => clearInterval(interval)
    }, [state])

    return <Stack tokens={{ childrenGap: 12 }} className={styles.side}>
        <Text variant='mediumPlus'>{props.title}</Text>
        <Toggle label='Show the note' inlineLabel checked={isShown} onChange={(_, checked) => setIsShown(!!checked)} />
        <StateProvider store={store}>
            {isShown && <DraftNote />}
        </StateProvider>
        <pre className={styles.store}>{text}</pre>
    </Stack>
}

/** Two state providers side by side, each with a note under the same stateKey. */
export const KeepItApartExample = () => <Stack horizontal tokens={{ childrenGap: 16 }}>
    <Side title='Left' />
    <Side title='Right' />
</Stack>
