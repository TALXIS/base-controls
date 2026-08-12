import type { Monaco } from "@monaco-editor/react"
import type { editor } from "monaco-editor"

export type { Monaco }

export const baseEditorOptions: editor.IStandaloneEditorConstructionOptions = {
    automaticLayout: true,
    bracketPairColorization: { enabled: true },
    fontLigatures: true,
    fontSize: 13,
    lineNumbersMinChars: 3,
    minimap: { enabled: false },
    scrollbar: {
        alwaysConsumeMouseWheel: true,
        horizontal: "auto",
        vertical: "auto",
    },
    scrollBeyondLastLine: false,
    smoothScrolling: true,
    tabSize: 2,
    wordWrap: "on",
}

export const configureTypeScriptCompiler = (monaco: Monaco, opts?: { javascript?: boolean }) => {
    const { typescript } = monaco.languages

    typescript.typescriptDefaults.setCompilerOptions({
        allowJs: true,
        allowNonTsExtensions: true,
        esModuleInterop: true,
        jsx: typescript.JsxEmit.React,
        module: typescript.ModuleKind.ESNext,
        noEmit: true,
        target: typescript.ScriptTarget.ES2020,
        typeRoots: ["node_modules/@types"],
    })

    typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
    })

    if (opts?.javascript) {
        typescript.javascriptDefaults.setCompilerOptions({
            allowJs: true,
            allowNonTsExtensions: true,
            checkJs: true,
            esModuleInterop: true,
            noEmit: true,
            target: typescript.ScriptTarget.ES2020,
            typeRoots: ["node_modules/@types"],
        })

        typescript.javascriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: false,
            noSyntaxValidation: false,
        })
    }
}

export const registerExtraLibs = (monaco: Monaco, content: string, filePath: string, opts?: { javascript?: boolean }) => {
    const { typescript } = monaco.languages

    typescript.typescriptDefaults.setExtraLibs([{ content, filePath }])

    if (opts?.javascript) {
        typescript.javascriptDefaults.setExtraLibs([{ content, filePath }])
    }
}
