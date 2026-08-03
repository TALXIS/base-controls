import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Text, Toggle, getTheme, mergeStyleSets } from '@fluentui/react'
import { XrmMode } from '../../form/xrm-form/XrmMode'
import { renderStory } from './storyHelpers'

const theme = getTheme()

const styles = mergeStyleSets({
    page: {
        display: 'flex',
        flexDirection: 'column',
    },
    sectionBody: {
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
    },
    bullets: {
        margin: 0,
        paddingLeft: 20,
    },
    exampleHeader: {
        padding: '16px 18px',
        borderBottom: `1px solid ${theme.palette.neutralLighter}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
    },
    exampleCopy: {
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        minWidth: 0,
        flex: 1,
    },
    exampleBody: {
        padding: 18,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
    },
})

interface IXrmCustomUiExample {
    id: string
    title: string
    summary: string
    notes: string[]
    render: () => React.ReactNode
}

const XrmCustomUiControlsExample = () => {
    const [showCode, setShowCode] = React.useState(false)

    return (
        <div>
            <div className={styles.exampleHeader}>
                <div className={styles.exampleCopy}>
                    <Text variant="large" styles={{ root: { fontWeight: 600 } }}>Replace control presentation</Text>
                    <Text>Swap selected Xrm control rendering with custom React while keeping the Xrm runtime and FormXml-driven structure intact.</Text>
                </div>
                <Toggle
                    label="Code"
                    inlineLabel
                    checked={showCode}
                    onChange={(_event, checked) => setShowCode(!!checked)}
                />
            </div>
            <div className={styles.exampleBody}>
                <ul className={styles.bullets}>
                    <li><Text>Use this when specific Xrm controls need a tailored visual treatment.</Text></li>
                    <li><Text>The form remains model-driven; only the rendered control presentation changes.</Text></li>
                </ul>
                <XrmMode
                    initialView="custom-components"
                    initialCustomComponentsFlavor="controls"
                    initialShowCustomComponentsCode={showCode}
                    initialShowCustomComponentsData={false}
                    initialShowCustomComponentsXml={false}
                    hideWorkspaceViewPivot
                    hideCustomComponentsPivot
                    hideCustomTabsOrientationSelector
                    hideCustomComponentsEditorToggles
                    useStorybookViewport
                />
            </div>
        </div>
    )
}

const XrmCustomUiTabsExample = () => {
    const [showCode, setShowCode] = React.useState(false)

    return (
        <div>
            <div className={styles.exampleHeader}>
                <div className={styles.exampleCopy}>
                    <Text variant="large" styles={{ root: { fontWeight: 600 } }}>Replace the tabs renderer</Text>
                    <Text>Swap the default Xrm tabs presentation for a custom tabs shell while keeping the same underlying runtime-driven tab content.</Text>
                </div>
                <Toggle
                    label="Code"
                    inlineLabel
                    checked={showCode}
                    onChange={(_event, checked) => setShowCode(!!checked)}
                />
            </div>
            <div className={styles.exampleBody}>
                <ul className={styles.bullets}>
                    <li><Text>The example keeps the orientation switch inside the rendered preview, matching the React compose tabs demo.</Text></li>
                    <li><Text>The code view isolates the custom tabs implementation without showing extra data or FormXml panels.</Text></li>
                </ul>
                <XrmMode
                    initialView="custom-components"
                    initialCustomComponentsFlavor="tabs"
                    initialCustomTabsOrientation="horizontal"
                    initialShowCustomComponentsCode={showCode}
                    initialShowCustomComponentsData={false}
                    initialShowCustomComponentsXml={false}
                    hideWorkspaceViewPivot
                    hideCustomComponentsPivot
                    hideCustomTabsOrientationSelector={showCode}
                    hideCustomComponentsEditorToggles
                    useStorybookViewport
                />
            </div>
        </div>
    )
}

const XrmCustomUiDocsPage = () => {
    return (
        <div className={styles.page}>
            <XrmCustomUiControlsExample />
            <XrmCustomUiTabsExample />
        </div>
    )
}

const meta = {
    title: 'Form/Xrm/Custom Components',
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
            controls: { disable: true },
            description: {
                component: `
Use this page to explore how Xrm UI can be customized while staying on top of the FormXml-driven runtime.

- Replace control presentation for selected Xrm controls.
- Replace the tabs renderer with a custom tabs shell.

Each example below renders a live preview and can switch to the Monaco-backed code editor that powers it.
                `.trim(),
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Docs: Story = {
    render: () => renderStory(<XrmCustomUiDocsPage />),
}
