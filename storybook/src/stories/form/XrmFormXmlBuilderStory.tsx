import React from 'react'
import { ComboBox, IComboBoxOption, Pivot, PivotItem, mergeStyleSets } from '@fluentui/react'
import { parseFormXml } from '@talxis/client-metadata'
import { XrmForm } from '@talxis/base-controls/components/Form'
import type { IXrmFormStrategy } from '@talxis/base-controls/components/Form'
import { MemoryStrategy } from '@talxis/base-controls/components/Form'
import { CommandBar, ICommandBarItemProps } from '@legacy'
import { PcfContextProvider } from '@talxis/base-controls/utils/adapters/pcf-context/PcfContextProvider'
import { FormXmlBuilderPanel, FormXmlTranslationsPanel } from '../../form/xrm-form/form-xml-builder-panel'
import { formTranslationLanguageOptions } from '../../form/xrm-form/constants'
import { FormXmlEditor } from '../../form/xrm-form/FormXmlEditor'
import { defaultFormXml } from '../../form/xrm-form/defaultFormXml'
import { createModelStore } from '../../form/shared/modelStore'
import { formMetadata, getDemoRecord } from '../../form/shared/formModel'

const builderModelStore = createModelStore()

let currentFormXml = defaultFormXml

type TBuilderView = 'preview' | 'builder' | 'formxml' | 'translations'

class StorybookFormXmlBuilderStrategy extends MemoryStrategy implements IXrmFormStrategy {
    public onGetFormXml(): string {
        return currentFormXml
    }
}

const builderRecord = structuredClone(getDemoRecord())
const builderStrategy = new StorybookFormXmlBuilderStrategy({
    onGetData: () => builderRecord,
    onGetColumns: () => builderModelStore.getRuntimeColumns(),
    onGetMetadata: () => formMetadata,
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
        paddingRight: 12,
    },
    languageComboBox: {
        minWidth: 220,
    },
    ribbonHint: {
        color: '#605e5c',
    },
})

export const XrmFormXmlBuilderStory = () => {
    const [activeView, setActiveView] = React.useState<TBuilderView>('builder')
    const [formXmlText, setFormXmlText] = React.useState(defaultFormXml)
    const [previewKey, setPreviewKey] = React.useState(0)
    const [undoCount, setUndoCount] = React.useState(0)
    const [undoAction, setUndoAction] = React.useState<(() => void) | null>(null)
    const [copyState, setCopyState] = React.useState<'idle' | 'copied' | 'failed'>('idle')
    const [selectedLanguageCode, setSelectedLanguageCode] = React.useState<number>(1033)

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

    React.useEffect(() => {
        if (copyState === 'idle') {
            return
        }

        const timeoutId = window.setTimeout(() => setCopyState('idle'), 1500)
        return () => window.clearTimeout(timeoutId)
    }, [copyState])

    const copyFormXml = React.useCallback(async () => {
        try {
            await navigator.clipboard.writeText(formXmlText)
            setCopyState('copied')
        } catch {
            setCopyState('failed')
        }
    }, [formXmlText])

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
            text: 'Copy FormXml',
            iconProps: { iconName: 'Copy' },
            onClick: () => {
                void copyFormXml()
            },
        },
    ], [copyFormXml, undoAction, undoCount])

    const languageOptions = React.useMemo<IComboBoxOption[]>(
        () => formTranslationLanguageOptions.map((option) => ({
            key: option.key,
            text: option.text,
        })),
        []
    )

    const commandBarFarItems = React.useMemo<ICommandBarItemProps[]>(
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
                <PivotItem itemKey="builder" headerText="Builder" />
                <PivotItem itemKey="formxml" headerText="FormXml" />
                <PivotItem itemKey="translations" headerText="Translations" />
            </Pivot>

            <CommandBar items={commandBarItems} farItems={commandBarFarItems} />

            <div className={styles.content}>
                <PcfContextProvider userSettings={{ lcid: selectedLanguageCode }}>
                    {activeView === 'builder' && (
                        <FormXmlBuilderPanel
                            formXmlText={formXmlText}
                            parsedFormXml={parsedFormXml.value}
                            builderError={parsedFormXml.error}
                            onFormXmlTextChange={setFormXmlText}
                            strategy={builderStrategy}
                            onUndoStackChange={(count, undo) => {
                                setUndoCount(count)
                                setUndoAction(() => undo)
                            }}
                        />
                    )}

                    {activeView === 'formxml' && <FormXmlEditor value={formXmlText} onChange={setFormXmlText} />}

                    {activeView === 'translations' && (
                        <FormXmlTranslationsPanel
                            formXmlText={formXmlText}
                            parsedFormXml={parsedFormXml.value}
                            builderError={parsedFormXml.error}
                            onFormXmlTextChange={setFormXmlText}
                        />
                    )}

                    {activeView === 'preview' && (
                        <XrmForm
                            key={previewKey}
                            strategy={builderStrategy}
                        />
                    )}
                </PcfContextProvider>
            </div>
        </div>
    )
}
