import Editor from "@monaco-editor/react"
import { Stack, Text, mergeStyleSets } from "@fluentui/react"
import { baseEditorOptions } from "../shared/monacoEditor"

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
                    ...baseEditorOptions,
                    formatOnPaste: true,
                    formatOnType: true,
                    padding: { top: 12, bottom: 12 },
                }}
                theme="vs-light"
            />
        </div>
    </Stack>
}
