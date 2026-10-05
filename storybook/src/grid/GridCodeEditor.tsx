import React from 'react'
import Editor, { Monaco, OnMount } from '@monaco-editor/react'
import { mergeStyleSets } from '@fluentui/react'
import { baseEditorOptions, configureTypeScriptCompiler, registerExtraLibs } from '../form/shared/monacoEditor'
import { gridSandboxDeclarations } from './gridSandboxDeclarations'
import type { IGridExampleFile } from './GridLivePreview'

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
    files: IGridExampleFile[]
    /** The name of the file shown. */
    activeFile: string
    onChange: (name: string, code: string) => void
    height?: string
}

/** The editable Monaco window behind the Code toggle of the live Grid examples. */
export const GridCodeEditor = (props: IGridCodeEditorProps) => {
    //a folder per editor: a docs page shows several examples at once
    const folder = React.useMemo(() => `file:///sandbox/grid-example-${++editorCount}/`, [])
    const monacoRef = React.useRef<Monaco>()
    const activeFile = props.files.find(file => file.name === props.activeFile) ?? props.files[0]

    //every file has a model, so the shown one sees what it imports from the others
    const syncModels = () => {
        const monaco = monacoRef.current
        for (const file of props.files) {
            const uri = monaco?.Uri.parse(folder + file.name)
            const model = uri && (monaco!.editor.getModel(uri) ?? monaco!.editor.createModel(file.code, 'typescript', uri))
            if (model && model.getValue() !== file.code) {
                model.setValue(file.code)
            }
        }
    }

    React.useEffect(syncModels, [props.files])

    const handleMount: OnMount = (_editor, monaco) => {
        monacoRef.current = monaco
        configureTypeScriptCompiler(monaco)
        const { typescriptDefaults } = monaco.languages.typescript
        //as modules, two open editors do not both declare `GridExample`
        typescriptDefaults.setCompilerOptions({ ...typescriptDefaults.getCompilerOptions(), moduleDetection: MODULE_DETECTION_FORCE })
        registerExtraLibs(monaco, gridSandboxDeclarations, 'file:///sandbox/grid-runtime.d.ts')
        syncModels()
    }

    return <div className={styles.frame}>
        <Editor
            path={folder + activeFile.name}
            height={props.height ?? '560px'}
            defaultLanguage="typescript"
            language="typescript"
            value={activeFile.code}
            onMount={handleMount}
            onChange={nextValue => props.onChange(activeFile.name, nextValue ?? '')}
            options={{
                ...baseEditorOptions,
                padding: { top: 12, bottom: 0 },
                quickSuggestions: { comments: false, other: true, strings: true },
            }}
            theme="vs-light" />
    </div>
}
