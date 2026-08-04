import Editor from "@monaco-editor/react"
import { Stack, Text, mergeStyleSets } from "@fluentui/react"
import { useMemo } from "react"

interface IFormXmlEditorProps {
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

export const FormXmlEditor = (props: IFormXmlEditorProps) => {
    const { onChange, value } = props
    const formattedValue = useMemo(() => formatXml(value), [value])

    return <Stack className={styles.root}>
        <Text variant="medium" className={styles.label}>
            FormXml
        </Text>
        <div className={styles.frame}>
            <Editor
                height="520px"
                defaultLanguage="xml"
                language="xml"
                value={formattedValue}
                onChange={(nextValue) => onChange(formatXml(nextValue ?? ""))}
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

const formatXml = (xml: string) => {
    const normalized = xml
        .replace(/>\s+</g, "><")
        .replace(/</g, "~::~<")
        .split("~::~")
        .filter(Boolean)

    let depth = 0

    return normalized
        .map((part) => {
            const trimmed = part.trim()
            if (!trimmed) {
                return ""
            }

            if (trimmed.startsWith("</")) {
                depth = Math.max(depth - 1, 0)
            }

            const line = `${"  ".repeat(depth)}${trimmed}`

            if (
                trimmed.startsWith("<")
                && !trimmed.startsWith("</")
                && !trimmed.endsWith("/>")
                && !trimmed.includes("</")
                && !trimmed.startsWith("<?")
                && !trimmed.startsWith("<!")
            ) {
                depth += 1
            }

            return line
        })
        .filter(Boolean)
        .join("\n")
}
