import Editor from "@monaco-editor/react"
import { Stack, Text, mergeStyleSets } from "@fluentui/react"

interface IRecordDataEditorProps {
    value: string
    onChange: (value: string) => void
}

const styles = mergeStyleSets({
    root: {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 520,
    },
    label: {
        marginBottom: 8,
        flexShrink: 0,
    },
    frame: {
        flex: 1,
        minHeight: 520,
        height: 520,
        overflow: "hidden",
    },
})

export const RecordDataEditor = (props: IRecordDataEditorProps) => {
    const { onChange, value } = props

    return <Stack className={styles.root}>
        <Text variant="medium" className={styles.label}>
            Record data JSON
        </Text>
        <div className={styles.frame}>
            <Editor
                height="520px"
                defaultLanguage="json"
                language="json"
                value={value}
                onChange={(nextValue) => onChange(nextValue ?? "")}
                options={{
                    automaticLayout: true,
                    bracketPairColorization: { enabled: true },
                    fontLigatures: true,
                    fontSize: 13,
                    formatOnPaste: true,
                    formatOnType: true,
                    lineNumbersMinChars: 3,
                    minimap: { enabled: false },
                    padding: { top: 12, bottom: 12 },
                    scrollbar: {
                        alwaysConsumeMouseWheel: true,
                        horizontal: "auto",
                        vertical: "auto",
                    },
                    scrollBeyondLastLine: true,
                    smoothScrolling: true,
                    tabSize: 2,
                    wordWrap: "on",
                }}
                theme="vs-light"
            />
        </div>
    </Stack>
}
