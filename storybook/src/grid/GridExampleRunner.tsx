import React from 'react'
import { initializeIcons } from '@fluentui/react'
import type { IDataProvider } from '@talxis/client-libraries'
import { ExampleRunner } from '../stories/form/storyHelpers'
import { GridCodeEditor } from './GridCodeEditor'
import { GridLivePreview } from './GridLivePreview'
import { createDocsProvider } from './gridDocsData'

//nothing in the grid's tree registers the Fluent icons it draws
initializeIcons()

const useDebouncedCode = (code: string, delay = 400) => {
    const [debouncedCode, setDebouncedCode] = React.useState(code)
    React.useEffect(() => {
        const timeout = window.setTimeout(() => setDebouncedCode(code), delay)
        return () => window.clearTimeout(timeout)
    }, [code, delay])
    return debouncedCode
}

export interface IGridExampleRunnerProps {
    /** The snippet the example starts with; it must define a `GridExample` component. */
    seedCode: string
    /** The provider handed to the snippet as `provider`, refreshed by whoever creates it. */
    onCreateProvider?: () => IDataProvider
}

/** A live Grid with a Code toggle: flip it to read the snippet, edit it, and watch it recompile. */
export const GridExampleRunner = (props: IGridExampleRunnerProps) => {
    const [code, setCode] = React.useState(props.seedCode)
    const [compileError, setCompileError] = React.useState<string | null>(null)
    const debouncedCode = useDebouncedCode(code)
    const provider = React.useMemo(() => {
        if (props.onCreateProvider) {
            return props.onCreateProvider()
        }
        const provider = createDocsProvider()
        provider.refresh()
        return provider
    }, [])

    return <ExampleRunner
        error={compileError}
        previewMinHeight={0}
        renderPreview={() => <GridLivePreview code={debouncedCode} provider={provider} onError={setCompileError} />}
        renderCode={() => <GridCodeEditor value={code} onChange={setCode} />} />
}
