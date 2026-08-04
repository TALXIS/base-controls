import React from 'react'
import { getTheme, mergeStyleSets } from '@fluentui/react'
import { XrmMode } from '../../form/xrm-form/XrmMode'
import { xrmBusinessFlowScenarios } from '../../form/xrm-form/xrmBusinessFlows'

const theme = getTheme()

const styles = mergeStyleSets({
    previewFrame: {
        minHeight: 520,
        width: '100%',
        overflow: 'hidden',
    },
})

export interface IFormContextDocsExample {
    title: string
    summary: string
    code: string
    runner?: string
}

export interface IFormContextSampleDefinition {
    id: string
    title: string
    summary: string
    notes: string[]
    docsExample: IFormContextDocsExample
}

export const overviewFormContextExample: IFormContextDocsExample = {
    title: 'Run custom Form context code',
    summary: 'Switch to Code to edit the Monaco snippet. The editor exposes the official Xrm form context members for intellisense, and Run code invokes onExecuteScenario against the live preview.',
    code: `// Use formContext inside this method to read values and manipulate the form UI.

const onExecuteScenario = (formContext: IXrmFormContext) => {

};`,
}

const buildBusinessFlowCode = (lines: string[]) => `// Execute a common business flow against the current formContext.

const onExecuteScenario = (formContext: IXrmFormContext) => {
${lines.filter((line) => line.trim() !== 'resetXrmBusinessFlows(formContext)').map((line) => `  ${line}`).join('\n')}
};`

export const formContextSampleDefinitions: IFormContextSampleDefinition[] = xrmBusinessFlowScenarios.map((scenario) => ({
    id: scenario.id,
    title: scenario.title,
    summary: scenario.description,
    notes: scenario.effects,
    docsExample: {
        title: scenario.title,
        summary: scenario.description,
        code: buildBusinessFlowCode(scenario.code),
    },
}))

interface IFormContextSamplePreviewProps {
    sample: IFormContextSampleDefinition
}

export const FormContextSamplePreview = (props: IFormContextSamplePreviewProps) => {
    const { sample } = props

    return (
        <div className={styles.previewFrame}>
            <XrmMode
                initialView="form-context"
                hideWorkspaceViewPivot
                useStorybookViewport
                hideFormContextScenarioPanel
                hideFormContextConsole
                formContextDocsExample={sample.docsExample}
            />
        </div>
    )
}
