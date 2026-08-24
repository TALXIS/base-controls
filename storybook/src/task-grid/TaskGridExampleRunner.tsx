import React from 'react'
import { initializeIcons } from '@fluentui/react'
import { usePcfContext } from '@talxis/base-controls/utils'
import { ExampleRunner } from '../stories/form/storyHelpers'
import { createMemoryTaskGridDescriptor } from './memoryDescriptor'
import { TaskGridCodeEditor } from './TaskGridCodeEditor'
import { TaskGridLivePreview } from './TaskGridLivePreview'

//the TaskGrid renders Fluent icons but, unlike Form, nothing in its tree registers them
initializeIcons()

/** Recompiling on every keystroke would remount the grid mid-typing, so the code settles first. */
const useDebouncedCode = (code: string, delay = 400) => {
    const [debouncedCode, setDebouncedCode] = React.useState(code)
    React.useEffect(() => {
        const timeout = window.setTimeout(() => setDebouncedCode(code), delay)
        return () => window.clearTimeout(timeout)
    }, [code, delay])
    return debouncedCode
}

interface ITaskGridExampleRunnerProps {
    /** The snippet the example starts with. It must define a `TaskGridExample` component. */
    seedCode: string
}

/** A live TaskGrid with a Code toggle: flip it to read the snippet, edit it, and watch the grid recompile. */
export const TaskGridExampleRunner = (props: ITaskGridExampleRunnerProps) => {
    const pcfContext = usePcfContext()
    const [code, setCode] = React.useState(props.seedCode)
    const [compileError, setCompileError] = React.useState<string | null>(null)
    const debouncedCode = useDebouncedCode(code)
    //a snippet may define a `gridCustomizerStrategy`; the grid resolves it on every mount, and the
    //preview remounts whenever the code settles, so an edited strategy takes effect
    const gridCustomizerStrategyRef = React.useRef<any>(undefined)
    //a snippet may define a `getModules(data)` factory; the descriptor calls it on every mount, so
    //changing which modules are registered takes effect on the next recompile
    const getModulesRef = React.useRef<any>(undefined)
    //one descriptor for the whole example - it owns the in-memory task state, and the snippet only
    //receives it, so editing the code never reloads the data
    const descriptor = React.useMemo(() => createMemoryTaskGridDescriptor({
        onGetGridCustomizerStrategy: () => gridCustomizerStrategyRef.current,
        onGetModuleOverrides: (data) => getModulesRef.current?.(data),
    }), [])

    return <ExampleRunner
        error={compileError}
        renderPreview={() => <TaskGridLivePreview
            code={debouncedCode}
            descriptor={descriptor}
            pcfContext={pcfContext}
            onGridCustomizerStrategy={(strategy) => { gridCustomizerStrategyRef.current = strategy }}
            onGetModules={(getModules) => { getModulesRef.current = getModules }}
            onError={setCompileError} />}
        renderCode={() => <TaskGridCodeEditor value={code} onChange={setCode} />} />
}
