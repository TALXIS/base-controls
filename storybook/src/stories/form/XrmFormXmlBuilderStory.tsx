import React, { useMemo } from 'react'
import Editor from '@monaco-editor/react'
import { ComboBox, IComboBoxOption, MessageBar, MessageBarType, Pivot, PivotItem, Toggle, mergeStyleSets } from '@fluentui/react'
import { parseFormXml } from '@talxis/client-metadata'
import { XrmForm } from '@talxis/base-controls/components/Form'
import type { IXrmFormStrategy } from '@talxis/base-controls/components/Form'
import { MemoryStrategy } from '@talxis/base-controls/components/Form'
import { CommandBar, ICommandBarItemProps } from '@legacy'
import { PcfContextProvider } from '@talxis/base-controls/utils/adapters/pcf-context/PcfContextProvider'
import { FormXmlBuilderPanel, FormXmlTranslationsPanel } from '../../form/xrm-form/form-xml-builder-panel'
import { getFieldEntries, getTabs } from '../../form/xrm-form/formXmlHelpers'
import { formTranslationLanguageOptions } from '../../form/xrm-form/constants'
import { FormXmlEditor } from '../../form/xrm-form/FormXmlEditor'
import { defaultFormXml } from '../../form/xrm-form/defaultFormXml'
import { createModelStore, serializeModelColumns } from '../../form/shared/modelStore'
import { baseEditorOptions } from '../../form/shared/monacoEditor'
import { useModelColumns } from '../../form/shared/useModelColumns'
import { ModelBuilderPanel, TEditorMode } from '../../form/shared/ModelBuilderPanel'
import { builderMetadata, getBuilderRecord } from '../../form/xrm-form/builderData'
import { PcfContextFactory } from '@talxis/base-controls/utils/adapters/pcf-context/factory/PcfContextFactory'

const builderModelStore = createModelStore()

let currentFormXml = defaultFormXml

type TBuilderView = 'preview' | 'workspace' | 'model' | 'translations' | 'data'

class StorybookFormXmlBuilderStrategy extends MemoryStrategy implements IXrmFormStrategy {
    public onGetFormXml(): string {
        return currentFormXml
    }
}

const builderRecord = structuredClone(getBuilderRecord())
const builderStrategy = new StorybookFormXmlBuilderStrategy({
    onGetData: () => builderRecord,
    onGetColumns: () => builderModelStore.getRuntimeColumns(),
    onGetMetadata: () => builderMetadata,
})

const styles = mergeStyleSets({
    root: {
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        width: '100vw',
        height: '100vh',
        padding: 16,
        gap: 16,
        overflow: 'hidden',
    },
    content: {
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        overflow: 'auto',
    },
    pivot: {
        flexShrink: 0,
    },
    ribbon: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto',
        alignItems: 'center',
        gap: 12,
        border: '1px solid #edebe9',
        borderRadius: 8,
        background: '#fff',
        flexShrink: 0,
        overflow: 'hidden',
    },
    commandBar: {
        minWidth: 0,
    },
    commandBarAside: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        paddingRight: 12,
    },
    languageComboBox: {
        minWidth: 220,
    },
    ribbonHint: {
        color: '#605e5c',
    },
    dataEditorWrap: {
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        height: '100%',
        minHeight: 0,
    },
    dataEditorFrame: {
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
    },
})

export const XrmFormXmlBuilderStory = () => {
    const [activeView, setActiveView] = React.useState<TBuilderView>('workspace')
    const [formXmlText, setFormXmlText] = React.useState(defaultFormXml)
    const [previewKey, setPreviewKey] = React.useState(0)
    const [undoCount, setUndoCount] = React.useState(0)
    const [undoAction, setUndoAction] = React.useState<(() => void) | null>(null)
    const [copyState, setCopyState] = React.useState<'idle' | 'copied' | 'failed'>('idle')
    const [modelCopyState, setModelCopyState] = React.useState<'idle' | 'copied' | 'failed'>('idle')
    const [dataCopyState, setDataCopyState] = React.useState<'idle' | 'copied' | 'failed'>('idle')
    const [dataJsonText, setDataJsonText] = React.useState(() => JSON.stringify(builderRecord, null, 2))
    const [dataJsonError, setDataJsonError] = React.useState<string | null>(null)
    const [selectedLanguageCode, setSelectedLanguageCode] = React.useState<number>(1033)
    const [showXmlEditor, setShowXmlEditor] = React.useState(false)
    const [modelEditorMode, setModelEditorMode] = React.useState<TEditorMode>('ui')
    const [modelColumns, setModelColumns] = useModelColumns(builderModelStore)

    const parsedFormXml = React.useMemo(() => {
        try {
            return {
                value: parseFormXml(formXmlText),
                error: null as string | null,
            }
        } catch (error) {
            return {
                value: null,
                error: (error as Error).message,
            }
        }
    }, [formXmlText])

    React.useEffect(() => {
        if (!parsedFormXml.value) {
            return
        }

        currentFormXml = formXmlText
        setPreviewKey((value) => value + 1)
    }, [formXmlText, parsedFormXml.value])

    const fieldNamesInFormXml = React.useMemo(() => {
        const names = new Set<string>()
        if (!parsedFormXml.value) {
            return names
        }

        getTabs(parsedFormXml.value).forEach((tab) => {
            getFieldEntries(tab).forEach((entry) => {
                const name = entry.cell.control?.datafieldname
                if (name) {
                    names.add(name)
                }
            })
        })

        return names
    }, [parsedFormXml.value])

    React.useEffect(() => {
        setPreviewKey((value) => value + 1)
    }, [modelColumns])

    React.useEffect(() => {
        if (copyState === 'idle') {
            return
        }

        const timeoutId = window.setTimeout(() => setCopyState('idle'), 1500)
        return () => window.clearTimeout(timeoutId)
    }, [copyState])

    React.useEffect(() => {
        if (modelCopyState === 'idle') {
            return
        }

        const timeoutId = window.setTimeout(() => setModelCopyState('idle'), 1500)
        return () => window.clearTimeout(timeoutId)
    }, [modelCopyState])

    React.useEffect(() => {
        if (dataCopyState === 'idle') {
            return
        }

        const timeoutId = window.setTimeout(() => setDataCopyState('idle'), 1500)
        return () => window.clearTimeout(timeoutId)
    }, [dataCopyState])

    const copyFormXml = React.useCallback(async () => {
        try {
            await navigator.clipboard.writeText(formXmlText)
            setCopyState('copied')
        } catch {
            setCopyState('failed')
        }
    }, [formXmlText])

    const copyModelJson = React.useCallback(async () => {
        try {
            await navigator.clipboard.writeText(serializeModelColumns(modelColumns))
            setModelCopyState('copied')
        } catch {
            setModelCopyState('failed')
        }
    }, [modelColumns])

    React.useEffect(() => {
        if (activeView !== 'data') {
            return
        }

        setDataJsonText(JSON.stringify(builderRecord, null, 2))
        setDataJsonError(null)
    }, [activeView])

    React.useEffect(() => {
        if (activeView !== 'data') {
            return
        }

        const timeoutId = window.setTimeout(() => {
            try {
                const parsed = JSON.parse(dataJsonText)
                Object.keys(builderRecord).forEach((key) => delete (builderRecord as { [key: string]: any })[key])
                Object.assign(builderRecord, parsed)
                setDataJsonError(null)
                setPreviewKey((value) => value + 1)
            } catch (error) {
                setDataJsonError((error as Error).message)
            }
        }, 150)

        return () => window.clearTimeout(timeoutId)
    }, [activeView, dataJsonText])

    const copyDataJson = React.useCallback(async () => {
        try {
            await navigator.clipboard.writeText(dataJsonText)
            setDataCopyState('copied')
        } catch {
            setDataCopyState('failed')
        }
    }, [dataJsonText])

    const commandBarItems = React.useMemo<ICommandBarItemProps[]>(() => [
        {
            key: 'undo',
            text: undoCount > 0 ? `Undo (${undoCount})` : 'Undo',
            iconProps: { iconName: 'Undo' },
            disabled: !undoAction,
            onClick: () => undoAction?.(),
        },
        {
            key: 'copy-formxml',
            text: copyState === 'copied' ? 'Copied to clipboard' : 'Copy FormXml',
            iconProps: { iconName: copyState === 'copied' ? 'SkypeCheck' : 'Copy', styles: copyState === 'copied' ? { root: { color: '#107c10' } } : undefined },
            onClick: () => {
                void copyFormXml()
            },
        },
    ], [copyFormXml, copyState, undoAction, undoCount])

    const languageOptions = React.useMemo<IComboBoxOption[]>(
        () => formTranslationLanguageOptions.map((option) => ({
            key: option.key,
            text: option.text,
        })),
        []
    )
    const viewInstanceKey = `${activeView}:${selectedLanguageCode}`

    const commandBarFarItems = React.useMemo<ICommandBarItemProps[]>(
        () => [
            {
                key: 'language-selector',
                onRender: () => (
                    <div className={styles.commandBarAside}>
                        <Toggle
                            inlineLabel
                            checked={showXmlEditor}
                            styles={{
                                root: {
                                    marginBottom: 0
                                }
                            }}
                            onChange={(_event, checked) => setShowXmlEditor(!!checked)}
                            onText="XML"
                            offText="Builder"
                        />
                        <ComboBox
                            className={styles.languageComboBox}
                            selectedKey={selectedLanguageCode}
                            options={languageOptions}
                            onChange={(_event, option) => {
                                if (typeof option?.key === 'number') {
                                    setSelectedLanguageCode(option.key)
                                }
                            }}
                        />
                    </div>
                ),
            },
        ],
        [languageOptions, selectedLanguageCode, showXmlEditor]
    )

    const translationsCommandBarFarItems = React.useMemo<ICommandBarItemProps[]>(
        () => [
            {
                key: 'language-selector',
                onRender: () => (
                    <div className={styles.commandBarAside}>
                        <ComboBox
                            className={styles.languageComboBox}
                            selectedKey={selectedLanguageCode}
                            options={languageOptions}
                            onChange={(_event, option) => {
                                if (typeof option?.key === 'number') {
                                    setSelectedLanguageCode(option.key)
                                }
                            }}
                        />
                    </div>
                ),
            },
        ],
        [languageOptions, selectedLanguageCode]
    )

    const modelCommandBarItems = React.useMemo<ICommandBarItemProps[]>(() => [
        {
            key: 'copy-model',
            text: modelCopyState === 'copied' ? 'Copied to clipboard' : 'Copy model',
            iconProps: { iconName: modelCopyState === 'copied' ? 'SkypeCheck' : 'Copy', styles: modelCopyState === 'copied' ? { root: { color: '#107c10' } } : undefined },
            onClick: () => {
                void copyModelJson()
            },
        },
    ], [copyModelJson, modelCopyState])

    const dataCommandBarItems = React.useMemo<ICommandBarItemProps[]>(() => [
        {
            key: 'copy-data',
            text: dataCopyState === 'copied' ? 'Copied to clipboard' : 'Copy data',
            iconProps: { iconName: dataCopyState === 'copied' ? 'SkypeCheck' : 'Copy', styles: dataCopyState === 'copied' ? { root: { color: '#107c10' } } : undefined },
            onClick: () => {
                void copyDataJson()
            },
        },
    ], [copyDataJson, dataCopyState])

    const modelCommandBarFarItems = React.useMemo<ICommandBarItemProps[]>(
        () => [
            {
                key: 'model-editor-mode',
                onRender: () => (
                    <div className={styles.commandBarAside}>
                        <Toggle
                            inlineLabel
                            checked={modelEditorMode === 'json'}
                            styles={{
                                root: {
                                    marginBottom: 0
                                }
                            }}
                            onChange={(_event, checked) => setModelEditorMode(checked ? 'json' : 'ui')}
                            onText="JSON"
                            offText="Builder"
                        />
                    </div>
                ),
            },
        ],
        [modelEditorMode]
    )

    return (
        <div className={styles.root}>
            <Pivot
                className={styles.pivot}
                selectedKey={activeView}
                onLinkClick={(item) => {
                    const nextView = item?.props.itemKey as TBuilderView | undefined
                    if (nextView) {
                        setActiveView(nextView)
                    }
                }}
            >
                <PivotItem itemKey="preview" headerText="Preview" />
                <PivotItem itemKey="workspace" headerText="FormXml" />
                <PivotItem itemKey="model" headerText="Model" />
                <PivotItem itemKey="data" headerText="Data" />
                <PivotItem itemKey="translations" headerText="Translations" />
            </Pivot>

            {activeView === 'workspace' && <CommandBar items={commandBarItems} farItems={commandBarFarItems} />}
            {activeView === 'model' && <CommandBar items={modelCommandBarItems} farItems={modelCommandBarFarItems} />}
            {activeView === 'translations' && <CommandBar items={[]} farItems={translationsCommandBarFarItems} />}
            {activeView === 'data' && <CommandBar items={dataCommandBarItems} farItems={[]} />}

            <div className={styles.content}>
                <PcfContextProvider key={viewInstanceKey} userSettings={{ lcid: selectedLanguageCode }}>
                    {activeView === 'workspace' && (
                        showXmlEditor
                            ? <FormXmlEditor key={`${viewInstanceKey}:xml`} value={formXmlText} onChange={setFormXmlText} hideLabel />
                            : (
                                <FormXmlBuilderPanel
                                    key={`${viewInstanceKey}:builder`}
                                    formXmlText={formXmlText}
                                    parsedFormXml={parsedFormXml.value}
                                    builderError={parsedFormXml.error}
                                    onFormXmlTextChange={setFormXmlText}
                                    selectedLanguageCode={selectedLanguageCode}
                                    strategy={builderStrategy}
                                    columns={modelColumns}
                                    onUndoStackChange={(count, undo) => {
                                        setUndoCount(count)
                                        setUndoAction(() => undo)
                                    }}
                                />
                            )
                    )}

                    {activeView === 'model' && (
                        <ModelBuilderPanel
                            key={viewInstanceKey}
                            columns={modelColumns}
                            onChange={setModelColumns}
                            editorMode={modelEditorMode}
                            onEditorModeChange={setModelEditorMode}
                            lockedFieldNames={fieldNamesInFormXml}
                            primaryIdAttribute={builderMetadata.PrimaryIdAttribute}
                        />
                    )}

                    {activeView === 'translations' && (
                        <FormXmlTranslationsPanel
                            key={viewInstanceKey}
                            formXmlText={formXmlText}
                            parsedFormXml={parsedFormXml.value}
                            builderError={parsedFormXml.error}
                            onFormXmlTextChange={setFormXmlText}
                            selectedLanguageCode={selectedLanguageCode}
                        />
                    )}

                    {activeView === 'data' && (
                        <div className={styles.dataEditorWrap}>
                            {dataJsonError && (
                                <MessageBar messageBarType={MessageBarType.error} isMultiline>
                                    {dataJsonError}
                                </MessageBar>
                            )}
                            <div className={styles.dataEditorFrame}>
                                <Editor
                                    height="100%"
                                    defaultLanguage="json"
                                    language="json"
                                    value={dataJsonText}
                                    onChange={(nextValue) => setDataJsonText(nextValue ?? '')}
                                    options={{
                                        ...baseEditorOptions,
                                        formatOnPaste: true,
                                        formatOnType: true,
                                        padding: { top: 12, bottom: 12 },
                                    }}
                                    theme="vs-light"
                                />
                            </div>
                        </div>
                    )}

                    {activeView === 'preview' && (
                        <XrmForm
                            key={`${previewKey}:${selectedLanguageCode}`}
                            strategy={builderStrategy}
                        />
                    )}
                </PcfContextProvider>
            </div>
        </div>
    )
}
