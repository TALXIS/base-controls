import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Toggle, mergeStyleSets } from '@fluentui/react'
import { FormXmlEditor } from '../../form/xrm-form/FormXmlEditor'
import { defaultFormXml } from '../../form/xrm-form/defaultFormXml'
import { XrmOverviewCodeEditor } from '../../form/xrm-form/XrmOverviewCodeEditor'
import { getCurrentFormXml, setCurrentFormXml } from '../../form/xrm-form/xrmModel'
import { XrmOverviewPreview } from './XrmOverviewPreview'
import { StaticCodeBlock, codeBlockStyles, renderStory } from './storyHelpers'

const xmlEditorStyles = mergeStyleSets({
    xmlEditor: {
        height: 520,
    },
})

const xrmFormReactSnippet = `const record = getXrmRecord();
const columns = xrmModelStore.getRuntimeColumns();
const formXml = currentFormXml;

const strategy = new XrmMemoryStrategy({
  onGetData: () => record,
  onGetColumns: () => columns,
  onGetMetadata: () => formMetadata,
  onGetFormXml: () => formXml,
});

const XrmOverviewExample = () => {
  return <XrmForm strategy={strategy} />;
};`

const XrmOverviewStory = () => {
    const [showCode, setShowCode] = React.useState(false)
    const [code, setCode] = React.useState(xrmFormReactSnippet)
    const [formXml, setFormXml] = React.useState(() => getCurrentFormXml())

    React.useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setCurrentFormXml(formXml)
        }, 300)

        return () => window.clearTimeout(timeoutId)
    }, [formXml])

    return (
        <div className={codeBlockStyles.root}>
            <StaticCodeBlock title="FormXml">
                <div className={xmlEditorStyles.xmlEditor}>
                    <FormXmlEditor value={formXml} onChange={setFormXml} hideLabel />
                </div>
            </StaticCodeBlock>
            <div className={codeBlockStyles.previewHeader}>
                <Toggle
                    label="Code"
                    inlineLabel
                    checked={showCode}
                    onChange={(_event, checked) => setShowCode(!!checked)}
                />
            </div>
            <div style={{ minHeight: 0, flex: 1 }}>
                <XrmOverviewPreview
                    formXml={formXml}
                    code={code}
                    showCode={showCode}
                    renderCodeEditor={(value, onChange) => (
                        <div className={codeBlockStyles.codeEditor}>
                            <XrmOverviewCodeEditor value={value} onChange={onChange} />
                        </div>
                    )}
                />
            </div>
        </div>
    )
}

const meta = {
    title: 'Controls/Form/Xrm/Overview',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            story: {
                inline: true,
            },
            canvas: {
                sourceState: 'none',
                additionalActions: [],
            },
            description: {
                component: `
Author the layout in FormXml and render it as React with \`XrmForm\`. The columns and the record come from the [**Form strategy**](?path=/docs/controls-form-get-started-form-strategy--overview); the visible structure comes from FormXml. On top of it, the form exposes the Xrm-style surface for tabs, sections, controls, validation, notifications and \`formContext\`.

Try: edit the **FormXml** panel to change the layout live, then switch on **Code** to see how \`XrmForm\` is wired up.
                `.trim(),
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {
    name: 'Overview',
    render: () => renderStory(<XrmOverviewStory />),
}
