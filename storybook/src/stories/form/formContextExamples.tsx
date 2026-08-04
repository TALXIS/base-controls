import React from 'react'
import { Toggle, getTheme, mergeStyleSets } from '@fluentui/react'
import { XrmMode } from '../../form/xrm-form/XrmMode'
import { XrmComponentsCodeEditor } from '../../form/xrm-form/XrmComponentsCodeEditor'
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
  const targetDate = formContext.getAttribute("targetDate");
  const approvedBudget = formContext.getAttribute("approvedBudget");
  const metricsTab = formContext.ui.tabs.get("MetricsTab");

  targetDate?.setRequiredLevel("required");
  approvedBudget?.setValue(125000);
  approvedBudget?.fireOnChange();
  metricsTab?.setVisible(true);
  formContext.ui.setFormNotification(
    "Custom Form context code ran successfully.",
    "INFO",
    "docs-form-context"
  );
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
    const [showCode, setShowCode] = React.useState(false)

    return (
        <div>
            <Toggle
                label="Code"
                inlineLabel
                checked={showCode}
                onChange={(_event, checked) => setShowCode(!!checked)}
            />
            <div className={styles.previewFrame}>
                {showCode ? (
                    <XrmComponentsCodeEditor
                        value={sample.docsExample.code}
                        label=""
                        kind="form-context"
                        readOnly
                    />
                ) : (
                    <XrmMode
                        initialView="form-context"
                        hideWorkspaceViewPivot
                        useStorybookViewport
                        hideFormContextScenarioPanel
                        hideFormContextConsole
                        formContextDocsExample={sample.docsExample}
                    />
                )}
            </div>
        </div>
    )
}
