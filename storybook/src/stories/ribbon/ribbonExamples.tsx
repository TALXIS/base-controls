import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'

const RIBBON_CODE = `import { IRibbonCommand, IRibbonRuntime, Ribbon } from '@talxis/base-controls'
import { Stack, Text } from '@fluentui/react'

type Status = 'Draft' | 'Sent' | 'Paid'

//stands in for a server call, during which the button is disabled
const callServer = () => new Promise(resolve => setTimeout(resolve, 1500))

const GridExample = () => {
    const [status, setStatus] = React.useState<Status>('Draft')
    const [note, setNote] = React.useState('')
    const ribbonRef = React.useRef<IRibbonRuntime>()

    //the ribbon calls onLoad at mount and on reload(), so it reloads when the status changes
    React.useEffect(() => {
        ribbonRef.current?.reload()
    }, [status])

    const send = async () => {
        await callServer()
        setStatus('Sent')
    }

    const sendReminder = async () => {
        await callServer()
        //a command that throws opens the error dialog
        throw new Error('The mail server could not be reached.')
    }

    const onLoad = async (): Promise<IRibbonCommand[]> => {
        const commands: IRibbonCommand[] = []
        if (status === 'Draft') {
            commands.push({ id: 'send', label: 'Send', iconName: 'Send', onExecute: send })
        }
        if (status === 'Sent') {
            commands.push({ id: 'markPaid', label: 'Mark as paid', iconName: 'Money', onExecute: () => setStatus('Paid') })
            commands.push({ id: 'remind', label: 'Send reminder', iconName: 'Mail', onExecute: sendReminder })
        }
        //a command with commands opens a menu of them
        commands.push({ id: 'download', label: 'Download', iconName: 'Download', commands: [
            { id: 'pdf', label: 'As PDF', onExecute: () => setNote('Downloaded as PDF') },
            { id: 'csv', label: 'As CSV', onExecute: () => setNote('Downloaded as CSV') },
        ] })
        commands.push({ id: 'reopen', label: 'Reopen', iconName: 'Undo', isDisabled: status === 'Draft', onExecute: () => setStatus('Draft') })
        return commands
    }

    return <Stack tokens={{ childrenGap: 8 }}>
        <Ribbon onLoad={onLoad} onReady={ribbon => { ribbonRef.current = ribbon }} />
        <Text>Invoice INV-0042: {status}</Text>
        <Text variant='small'>{note}</Text>
    </Stack>
}
`

export const RibbonExample = () => <GridExampleRunner seedCode={RIBBON_CODE} tabs={['preview', 'code']} />
