import React from "react"
import { ComboBox, Stack, Text } from "@fluentui/react"
import { Step, StepButton, StepContent, Stepper } from "@mui/material"
import { XrmForm } from "@talxis/base-controls/components/Form"
import { getCustomComponentsStrategy } from "../../form/xrm-form/xrmCustomComponentsModel"

interface IXrmCustomTabsProps {
    children?: React.ReactNode
    expandedTab: string
    onTabChange: (tabId: string) => void
    orientation: "horizontal" | "vertical"
}

const StepperTabs = (props: IXrmCustomTabsProps) => {
    const tabs = React.Children.toArray(props.children).filter(React.isValidElement)
    const activeTab = tabs.find((tab) => tab.props.id === props.expandedTab) ?? tabs[0] ?? null
    const activeStepIndex = Math.max(tabs.findIndex((tab) => tab.props.id === props.expandedTab), 0)

    return (
        <Stack tokens={{ childrenGap: 12 }}>
            <Stepper nonLinear orientation={props.orientation} activeStep={activeStepIndex}>
                {tabs.map((tab) => {
                    const isActive = tab.props.id === props.expandedTab

                    return (
                        <Step key={tab.props.id} expanded={props.orientation === "vertical" ? isActive : undefined}>
                            <StepButton color="inherit" onClick={() => props.onTabChange(tab.props.id)}>
                                {tab.props.label || tab.props.id}
                            </StepButton>
                            {props.orientation === "vertical" ? <StepContent>{tab}</StepContent> : null}
                        </Step>
                    )
                })}
            </Stepper>
            {props.orientation === "horizontal" ? activeTab : null}
        </Stack>
    )
}

export const XrmCustomTabsPreview = () => {
    const strategy = React.useMemo(() => getCustomComponentsStrategy(), [])
    const [orientation, setOrientation] = React.useState<"horizontal" | "vertical">("horizontal")

    return (
        <Stack tokens={{ childrenGap: 16 }}>
            <Stack horizontal tokens={{ childrenGap: 12 }} verticalAlign="center" wrap>
                <Text variant="small">Tabs orientation</Text>
                <ComboBox
                    selectedKey={orientation}
                    options={[
                        { key: "horizontal", text: "Horizontal" },
                        { key: "vertical", text: "Vertical" },
                    ]}
                    onChange={(_event, option) => {
                        if (option?.key === "horizontal" || option?.key === "vertical") {
                            setOrientation(option.key)
                        }
                    }}
                />
            </Stack>

            <XrmForm
                key={orientation}
                strategy={strategy}
                components={{
                    tabs: {
                        onRenderTabs: (tabsProps) => <StepperTabs {...tabsProps} orientation={orientation} />,
                    },
                }}
            />
        </Stack>
    )
}
