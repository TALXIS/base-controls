import React from 'react'
import Editor, { OnMount } from '@monaco-editor/react'
import { mergeStyleSets } from '@fluentui/react'
import { baseEditorOptions, configureTypeScriptCompiler, registerExtraLibs } from '../form/shared/monacoEditor'
import { checkListSandboxDeclarations } from './checkListSandboxDeclarations'

const styles = mergeStyleSets({
    frame: {
        border: '1px solid #edebe9',
        borderRadius: 4,
        overflow: 'hidden',
    },
})

interface ICheckListCodeEditorProps {
    value: string
    onChange: (value: string) => void
    height?: string
}

/** The editable Monaco window behind the Code toggle of the live CheckList examples. */
export const CheckListCodeEditor = (props: ICheckListCodeEditorProps) => {
    const handleMount: OnMount = (_editor, monaco) => {
        configureTypeScriptCompiler(monaco)
        registerExtraLibs(monaco, checkListSandboxDeclarations, 'file:///sandbox/check-list-runtime.d.ts')
    }

    return <div className={styles.frame}>
        <Editor
            path="file:///sandbox/check-list-snippet.tsx"
            height={props.height ?? '520px'}
            defaultLanguage="typescript"
            language="typescript"
            value={props.value}
            onMount={handleMount}
            onChange={(nextValue) => props.onChange(nextValue ?? '')}
            options={{
                ...baseEditorOptions,
                padding: { top: 12, bottom: 0 },
                quickSuggestions: { comments: false, other: true, strings: true },
            }}
            theme="vs-light" />
    </div>
}
