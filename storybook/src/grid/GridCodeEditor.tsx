import React from 'react'
import Editor, { Monaco, OnMount } from '@monaco-editor/react'
import { ITheme, mergeStyleSets, useTheme } from '@fluentui/react'
import { baseEditorOptions, configureTypeScriptCompiler, registerExtraLibs, useMonacoTheme } from '../form/shared/monacoEditor'
import { gridSandboxDeclarations, gridSandboxImportOnlyDeclarations } from './gridSandboxDeclarations'
import type { IGridExampleFile } from './GridLivePreview'

const getStyles = (theme: ITheme) => mergeStyleSets({
    frame: {
        border: `1px solid ${theme.semanticColors.bodyDivider}`,
        borderRadius: 4,
        overflow: 'hidden',
    },
})

let editorCount = 0

//the packages an example imports from hold the same names as the globals
const SANDBOX_PACKAGES = ['@talxis/base-controls', '@talxis/client-libraries']
const asPackage = (name: string) => `declare module '${name}' {\n${gridSandboxDeclarations.replace(/^declare module .*$/gm, '').replace(/^declare /gm, '')}\n${name === '@talxis/base-controls' ? gridSandboxImportOnlyDeclarations : ''}\n}`
const SANDBOX_TYPINGS = [gridSandboxDeclarations, ...SANDBOX_PACKAGES.map(asPackage)].join('\n')

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
    const theme = useTheme()
    const styles = React.useMemo(() => getStyles(theme), [theme])
    const monacoTheme = useMonacoTheme()
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
        registerExtraLibs(monaco, SANDBOX_TYPINGS, 'file:///sandbox/grid-runtime.d.ts')
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
            theme={monacoTheme} />
    </div>
}
