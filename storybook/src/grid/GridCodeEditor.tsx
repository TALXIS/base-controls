import React from 'react'
import Editor, { OnMount } from '@monaco-editor/react'
import { mergeStyleSets } from '@fluentui/react'
import { baseEditorOptions, configureTypeScriptCompiler, registerExtraLibs } from '../form/shared/monacoEditor'
import { gridSandboxDeclarations } from './gridSandboxDeclarations'

const styles = mergeStyleSets({
    frame: {
        border: '1px solid #edebe9',
        borderRadius: 4,
        overflow: 'hidden',
    },
})

let editorCount = 0

//Monaco's typings do not name ModuleDetectionKind.Force
const MODULE_DETECTION_FORCE = 3

interface IGridCodeEditorProps {
    value: string
    onChange: (value: string) => void
    height?: string
}

/** The editable Monaco window behind the Code toggle of the live Grid examples. */
export const GridCodeEditor = (props: IGridCodeEditorProps) => {
    //one model per editor: a docs page shows several examples at once
    const path = React.useMemo(() => `file:///sandbox/grid-snippet-${++editorCount}.tsx`, [])
    const handleMount: OnMount = (_editor, monaco) => {
        configureTypeScriptCompiler(monaco)
        const { typescriptDefaults } = monaco.languages.typescript
        //as modules, two open editors do not both declare `GridExample`
        typescriptDefaults.setCompilerOptions({ ...typescriptDefaults.getCompilerOptions(), moduleDetection: MODULE_DETECTION_FORCE })
        registerExtraLibs(monaco, gridSandboxDeclarations, 'file:///sandbox/grid-runtime.d.ts')
    }

    return <div className={styles.frame}>
        <Editor
            path={path}
            height={props.height ?? '560px'}
            defaultLanguage="typescript"
            language="typescript"
            value={props.value}
            onMount={handleMount}
            onChange={nextValue => props.onChange(nextValue ?? '')}
            options={{
                ...baseEditorOptions,
                padding: { top: 12, bottom: 0 },
                quickSuggestions: { comments: false, other: true, strings: true },
            }}
            theme="vs-light" />
    </div>
}
