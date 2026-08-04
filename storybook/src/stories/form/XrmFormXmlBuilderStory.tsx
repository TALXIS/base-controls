import React from 'react'
import { Toggle, mergeStyleSets } from '@fluentui/react'
import { parseFormXml } from '@talxis/client-metadata'
import { XrmForm } from '@talxis/base-controls/components/Form'
import type { IXrmFormStrategy } from '@talxis/base-controls/components/Form'
import { MemoryStrategy } from '@talxis/base-controls/components/Form'
import { FormXmlBuilderPanel } from '../../form/xrm-form/FormXmlBuilderPanel'
import { FormXmlEditor } from '../../form/xrm-form/FormXmlEditor'
import { defaultFormXml } from '../../form/xrm-form/defaultFormXml'
import { createModelStore } from '../../form/shared/modelStore'
import { formMetadata, getDemoRecord } from '../../form/shared/formModel'

const builderModelStore = createModelStore()

let currentFormXml = defaultFormXml

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
        gap: 16,
    },
    toggleRow: {
        display: 'flex',
        justifyContent: 'flex-end',
    },
})

export const XrmFormXmlBuilderStory = () => {
    const [showXml, setShowXml] = React.useState(false)
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
            <div className={styles.toggleRow}>
                <Toggle
                    label=""
                    onText="FormXml"
                    offText="UI builder"
                    checked={showXml}
                    onChange={(_event, checked) => setShowXml(!!checked)}
                />
            </div>

            {showXml ? (
                <FormXmlEditor value={formXmlText} onChange={setFormXmlText} />
            ) : (
                <FormXmlBuilderPanel
                    formXmlText={formXmlText}
                    parsedFormXml={parsedFormXml.value}
                    builderError={parsedFormXml.error}
                    onFormXmlTextChange={setFormXmlText}
                />
            )}

            <XrmForm
                key={previewKey}
                strategy={builderStrategy}
            />
        </div>
    )
}
