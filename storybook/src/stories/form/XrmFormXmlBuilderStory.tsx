import React from 'react'
import { Pivot, PivotItem, mergeStyleSets } from '@fluentui/react'
import { parseFormXml } from '@talxis/client-metadata'
import { XrmForm } from '@talxis/base-controls/components/Form'
import type { IXrmFormStrategy } from '@talxis/base-controls/components/Form'
import { MemoryStrategy } from '@talxis/base-controls/components/Form'
import { FormXmlBuilderPanel } from '../../form/xrm-form/form-xml-builder-panel'
import { FormXmlEditor } from '../../form/xrm-form/FormXmlEditor'
import { defaultFormXml } from '../../form/xrm-form/defaultFormXml'
import { createModelStore } from '../../form/shared/modelStore'
import { formMetadata, getDemoRecord } from '../../form/shared/formModel'

const builderModelStore = createModelStore()

let currentFormXml = defaultFormXml

type TBuilderView = 'preview' | 'builder' | 'formxml'

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
})

export const XrmFormXmlBuilderStory = () => {
    const [activeView, setActiveView] = React.useState<TBuilderView>('builder')
    const [formXmlText, setFormXmlText] = React.useState(defaultFormXml)
    const [previewKey, setPreviewKey] = React.useState(0)

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
            </Pivot>

            <div className={styles.content}>
                {activeView === 'builder' && (
                    <FormXmlBuilderPanel
                        formXmlText={formXmlText}
                        parsedFormXml={parsedFormXml.value}
                        builderError={parsedFormXml.error}
                        onFormXmlTextChange={setFormXmlText}
                        strategy={builderStrategy}
                    />
                )}

                {activeView === 'formxml' && <FormXmlEditor value={formXmlText} onChange={setFormXmlText} />}

                {activeView === 'preview' && (
                    <XrmForm
                        key={previewKey}
                        strategy={builderStrategy}
                    />
                )}
            </div>
        </div>
    )
}
