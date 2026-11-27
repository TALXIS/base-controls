import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'

const RIBBON_CODE = `import { IRibbonCommand, IRibbon, Ribbon } from '@talxis/base-controls'
import { Text } from '@fluentui/react'

type Status = 'Draft' | 'Sent'

//stands in for a server call
const callServer = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

//an iconUrl is any URL an <img> can load, a web resource's included
const fileIcon = (color: string, text: string) => 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">'
    + '<rect width="16" height="16" rx="2" fill="' + color + '"/>'
    + '<text x="8" y="11" font-size="6" font-family="sans-serif" font-weight="bold" fill="white" text-anchor="middle">' + text + '</text></svg>')

const GridExample = () => {
    const [status, setStatus] = React.useState<Status>('Draft')
    const ribbonRef = React.useRef<IRibbon>()

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
        return [
            status === 'Draft'
                ? { id: 'send', label: 'Send', iconName: 'Send', onExecute: send }
                : { id: 'remind', label: 'Send reminder', iconName: 'Mail', onExecute: sendReminder },
            //a command with commands opens a menu of them
            { id: 'download', label: 'Download', iconName: 'Download', commands: [
                { id: 'pdf', label: 'As PDF', iconUrl: fileIcon('#c4314b', 'PDF'), onExecute: () => callServer(500) },
                { id: 'csv', label: 'As CSV', iconUrl: fileIcon('#107c41', 'CSV'), onExecute: () => callServer(500) },
            ] },
            { id: 'excel', label: 'Open in Excel', iconUrl: fileIcon('#107c41', 'XLS'), onExecute: () => callServer(500) },
            { id: 'word', label: 'Open in Word', iconUrl: fileIcon('#185abd', 'DOC'), onExecute: () => callServer(500) },
            { id: 'reopen', label: 'Reopen', iconName: 'Undo', disabled: status === 'Draft', onExecute: () => setStatus('Draft') },
        ]
    }

    return <>
        <Ribbon onLoad={onLoad} onReady={ribbon => { ribbonRef.current = ribbon }} />
        <Text>Invoice INV-0042: {status}</Text>
    </>
}
`

const SLOW_LOAD_CODE = `import { IRibbonCommand, Ribbon } from '@talxis/base-controls'

//stands in for a server call
const callServer = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

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
        return [
            { id: 'approve', label: 'Approve', iconName: 'CheckMark', onExecute: () => callServer(1000) },
            { id: 'reject', label: 'Reject', iconName: 'Cancel', onExecute: () => callServer(1000) },
        ]
    }

    return <Ribbon onLoad={onLoad} />
}
`

const OWN_COMMANDS_CODE = `import { IRibbonCommand, IRibbon, Ribbon } from '@talxis/base-controls'
import { Toggle } from '@fluentui/react'

const GridExample = () => {
    const isClosed = React.useRef(false)
    const ribbonRef = React.useRef<IRibbon>()

    //returned directly, so the ribbon draws them without a shimmer
    const onLoad = (): IRibbonCommand[] => [
        { id: 'approve', label: 'Approve', iconName: 'CheckMark', onExecute: () => {} },
        { id: 'reject', label: 'Reject', iconName: 'Cancel', onExecute: () => {} },
    ]

    //code that does not own onLoad adds to the commands of every load
    const onSetup = (ribbon: IRibbon) => {
        ribbonRef.current = ribbon
        ribbon.hooks.commands.add(commands => {
            commands.push({ id: 'history', label: 'History', iconName: 'History', onExecute: () => {} })
        })
        //a higher priority runs later, so this hook sees History too
        ribbon.hooks.commands.add(commands => {
            for (const command of commands) {
                command.disabled = isClosed.current
            }
        }, 10)
    }

    //hooks run on a load, so reload to apply them now
    const setClosed = (checked: boolean) => {
        isClosed.current = checked
        ribbonRef.current?.reload()
    }

    return <>
        <Toggle label='Order closed' inlineLabel onChange={(_, checked) => setClosed(!!checked)} />
        <Ribbon onLoad={onLoad} onSetup={onSetup} />
    </>
}
`

export const RibbonExample = () => <GridExampleRunner seedCode={RIBBON_CODE} tabs={['preview', 'code']} />
export const SlowLoadExample = () => <GridExampleRunner seedCode={SLOW_LOAD_CODE} tabs={['preview', 'code']} />
export const OwnCommandsExample = () => <GridExampleRunner seedCode={OWN_COMMANDS_CODE} tabs={['preview', 'code']} />
