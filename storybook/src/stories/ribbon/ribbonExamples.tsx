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

//stands in for a server call
const callServer = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

const COMMANDS: IRibbonCommand[] = [
    { id: 'approve', label: 'Approve', iconName: 'CheckMark', onExecute: () => callServer(1000) },
    { id: 'reject', label: 'Reject', iconName: 'Cancel', onExecute: () => callServer(1000) },
]

const GridExample = () => {
    const isFirstLoad = React.useRef(true)

    //a shimmer stands in for the commands until the load finishes
    const onLoad = async (): Promise<IRibbonCommand[]> => {
        await callServer(2000)
        if (isFirstLoad.current) {
            isFirstLoad.current = false
            //a first load that throws shows the error with Try again
            throw new Error('The commands could not be loaded.')
        }
        return COMMANDS
    }

    return <Ribbon onLoad={onLoad} />
}
`

const OWN_COMMANDS_CODE = `import { IRibbonCommand, IRibbonRuntime, Ribbon } from '@talxis/base-controls'
import { Stack, Text, Toggle } from '@fluentui/react'

const GridExample = () => {
    const [note, setNote] = React.useState('')
    const isClosed = React.useRef(false)
    const ribbonRef = React.useRef<IRibbonRuntime>()

    const onLoad = async (): Promise<IRibbonCommand[]> => [
        { id: 'approve', label: 'Approve', iconName: 'CheckMark', onExecute: () => setNote('Approved') },
        { id: 'reject', label: 'Reject', iconName: 'Cancel', onExecute: () => setNote('Rejected') },
    ]

    //code that does not own onLoad adds to the commands of every load
    const onMounted = (ribbon: IRibbonRuntime) => {
        ribbonRef.current = ribbon
        ribbon.registerCommands(commands => {
            commands.push({ id: 'history', label: 'History', iconName: 'History', onExecute: () => setNote('History opened') })
        })
        //a higher priority runs later, so this hook sees History too
        ribbon.registerCommands(commands => {
            for (const command of commands) {
                command.isDisabled = isClosed.current
            }
        }, 10)
    }

    //hooks run on a load, so reload to apply them now
    const setClosed = (checked: boolean) => {
        isClosed.current = checked
        ribbonRef.current?.reload()
    }

    return <Stack tokens={{ childrenGap: 8 }}>
        <Toggle label='Order closed' inlineLabel onChange={(_, checked) => setClosed(!!checked)} />
        <Ribbon onLoad={onLoad} onMounted={onMounted} />
        <Text variant='small'>{note}</Text>
    </Stack>
}
`

export const RibbonExample = () => <GridExampleRunner seedCode={RIBBON_CODE} tabs={['preview', 'code']} />
export const SlowLoadExample = () => <GridExampleRunner seedCode={SLOW_LOAD_CODE} tabs={['preview', 'code']} />
export const OwnCommandsExample = () => <GridExampleRunner seedCode={OWN_COMMANDS_CODE} tabs={['preview', 'code']} />
