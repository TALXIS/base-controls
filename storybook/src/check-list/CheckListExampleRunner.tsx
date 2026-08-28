import React from 'react'
import { initializeIcons } from '@fluentui/react'
import type { IRawRecord } from '@talxis/client-libraries'
import { PcfContextProvider } from '@talxis/base-controls/utils/adapters/pcf-context/PcfContextProvider'
import { ExampleRunner } from '../stories/form/storyHelpers'
import { CheckListCodeEditor } from './CheckListCodeEditor'
import { CheckListLivePreview } from './CheckListLivePreview'
import { CHECK_LIST_DOCS_COLUMNS, CHECK_LIST_DOCS_FIELD_MAPPING, CHECK_LIST_DOCS_ROWS } from './checkListDocsData'

//the checklist renders Fluent icons and nothing in its tree registers them
initializeIcons()

/** Recompiling on every keystroke would remount the list mid-typing, so the code settles first. */
const useDebouncedCode = (code: string, delay = 400) => {
    const [debouncedCode, setDebouncedCode] = React.useState(code)
    React.useEffect(() => {
        const timeout = window.setTimeout(() => setDebouncedCode(code), delay)
        return () => window.clearTimeout(timeout)
    }, [code, delay])
    return debouncedCode
}

interface ICheckListExampleRunnerProps {
    /** The snippet the example starts with. It must define a `CheckListExample` component. */
    seedCode: string
}

/** A live CheckList with a Code toggle: flip it to read the snippet, edit it, and watch it recompile. */
export const CheckListExampleRunner = (props: ICheckListExampleRunnerProps) => {
    const [code, setCode] = React.useState(props.seedCode)
    const [compileError, setCompileError] = React.useState<string | null>(null)
    const debouncedCode = useDebouncedCode(code)
    //the example's items, as the last change left them. Copied out of the fixtures so one story cannot
    //edit what the next one starts from
    const rowsRef = React.useRef<IRawRecord[]>(CHECK_LIST_DOCS_ROWS.map(row => ({ ...row })))

    return <ExampleRunner
        error={compileError}
        //the checklist is as tall as its items, so the frame should not hold space open under it
        previewMinHeight={0}
        renderPreview={() => <PcfContextProvider>
            <CheckListLivePreview
                code={debouncedCode}
                rows={rowsRef.current}
                columns={CHECK_LIST_DOCS_COLUMNS}
                fieldMapping={CHECK_LIST_DOCS_FIELD_MAPPING}
                onDataChanged={(items) => { rowsRef.current = items }}
                onError={setCompileError} />
        </PcfContextProvider>}
        renderCode={() => <CheckListCodeEditor value={code} onChange={setCode} />} />
}
