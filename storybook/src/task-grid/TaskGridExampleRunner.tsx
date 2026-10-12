import React from 'react'
import { initializeIcons } from '@fluentui/react'
import { ExampleRunner } from '../stories/form/storyHelpers'
import { createMemoryTaskGridDescriptor } from './memoryDescriptor'
import type { MemoryTaskGridFeatureName } from './memoryDescriptor'
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
    /**
     * Which features the example is about. It decides what the grid's views contain — a demo without
     * `lookupMany` shows no lookup-many columns — and what `features` holds for the snippet. Omit for the
     * usual documentation set.
     */
    features?: MemoryTaskGridFeatureName[]
}

/** A live TaskGrid with a Code toggle: flip it to read the snippet, edit it, and watch the grid recompile. */
export const TaskGridExampleRunner = (props: ITaskGridExampleRunnerProps) => {
    const [code, setCode] = React.useState(props.seedCode)
    const [compileError, setCompileError] = React.useState<string | null>(null)
    const debouncedCode = useDebouncedCode(code)
    //one for the whole example - it owns the in-memory task state, and the snippet only receives it, so
    //editing the code never reloads the data
    const { descriptor, modules, features, data } = React.useMemo(() => createMemoryTaskGridDescriptor({ features: props.features }), [])

    return <ExampleRunner
        error={compileError}
        renderPreview={() => <TaskGridLivePreview
            code={debouncedCode}
            descriptor={descriptor}
            modules={modules}
            features={features}
            data={data}
            onError={setCompileError} />}
        renderCode={() => <TaskGridCodeEditor value={code} onChange={setCode} />} />
}
