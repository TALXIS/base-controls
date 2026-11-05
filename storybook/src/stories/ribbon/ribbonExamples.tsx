import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'

const RIBBON_CODE = `import { IRibbonCommand, IRibbonRuntime, Ribbon } from '@talxis/base-controls'
import { Stack, Text } from '@fluentui/react'

type Status = 'Draft' | 'Sent' | 'Paid'

//stands in for a server call
const callServer = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

const GridExample = () => {
    const [status, setStatus] = React.useState<Status>('Draft')
    const [note, setNote] = React.useState('')
    const ribbonRef = React.useRef<IRibbonRuntime>()

    //the ribbon calls onLoad at mount and on reload(), so it reloads when the status changes
    React.useEffect(() => {
        ribbonRef.current?.reload()
    }, [status])

    //the button stays disabled until this settles
    const send = async () => {
        await callServer(1500)
        setStatus('Sent')
    }

    const sendReminder = async () => {
        await callServer(1500)
        //a command that throws opens the error dialog
        throw new Error('The mail server could not be reached.')
    }

    //the previous commands stay until these arrive
    const onLoad = async (): Promise<IRibbonCommand[]> => {
        await callServer(800)
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
        <Ribbon onLoad={onLoad} onMounted={ribbon => { ribbonRef.current = ribbon }} />
        <Text>Invoice INV-0042: {status}</Text>
        <Text variant='small'>{note}</Text>
    </Stack>
}
`

const SLOW_LOAD_CODE = `import { IRibbonCommand, Ribbon } from '@talxis/base-controls'
import { DefaultButton, Stack } from '@fluentui/react'

//stands in for a server call
const callServer = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

const COMMANDS: IRibbonCommand[] = [
    { id: 'approve', label: 'Approve', iconName: 'CheckMark', onExecute: () => callServer(1000) },
    { id: 'reject', label: 'Reject', iconName: 'Cancel', onExecute: () => callServer(1000) },
]

const ApprovalRibbon = () => {
    const isFirstLoad = React.useRef(true)

    //a shimmer stands in for the commands until a load finishes
    const onLoad = async (): Promise<IRibbonCommand[]> => {
        await callServer(2000)
        if (isFirstLoad.current) {
            isFirstLoad.current = false
            //a load that throws shows the error with Try again
            throw new Error('The commands could not be loaded.')
        }
        return COMMANDS
    }

    return <Ribbon onLoad={onLoad} />
}

const GridExample = () => {
    const [mountKey, setMountKey] = React.useState(0)

    return <Stack tokens={{ childrenGap: 8 }} horizontalAlign='start'>
        <ApprovalRibbon key={mountKey} />
        <DefaultButton text='Mount again' onClick={() => setMountKey(mountKey + 1)} />
    </Stack>
}
`

export const RibbonExample = () => <GridExampleRunner seedCode={RIBBON_CODE} tabs={['preview', 'code']} />
export const SlowLoadExample = () => <GridExampleRunner seedCode={SLOW_LOAD_CODE} tabs={['preview', 'code']} />
