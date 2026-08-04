import * as Babel from "@babel/standalone"
import React from "react"
import { XrmForm, XrmMemoryStrategy, useField } from "@talxis/base-controls/components/Form"
import { ControlComponents } from "@talxis/base-controls/components/Form/components/adapters/control"
import { ComboBox, Stack, Text } from "@fluentui/react"
import { FormControl, InputLabel, MenuItem, Select, Slider as MuiSlider, TextField as MuiTextField } from "@mui/material"
import { Step, StepButton, StepContent, Stepper } from "@mui/material"
import { formMetadata } from "../../form/shared/formModel"
import { getCustomComponentsFormXml, getCustomComponentsRecord, xrmCustomComponentsModelStore } from "../../form/xrm-form/xrmCustomComponentsModel"

interface IXrmCustomComponentsLivePreviewProps {
    code: string
    onError?: (error: string | null) => void
}

export const XrmCustomComponentsLivePreview = (props: IXrmCustomComponentsLivePreviewProps) => {
    const compiled = React.useMemo(() => {
        try {
            const transformed = Babel.transform(props.code, {
                presets: [
                    ["typescript", { allExtensions: true, isTSX: true }],
                    ["react", { runtime: "classic" }],
                ],
                filename: "xrm-custom-components-snippet.tsx",
            }).code ?? ""

            const factory = new Function(
                "React",
                "XrmForm",
                "XrmMemoryStrategy",
                "useField",
                "ControlComponents",
                "formMetadata",
                "getCustomComponentsRecord",
                "xrmCustomComponentsModelStore",
                "getCustomComponentsFormXml",
                "Stack",
                "Text",
                "ComboBox",
                "MuiTextField",
                "MuiSlider",
                "FormControl",
                "InputLabel",
                "Select",
                "MenuItem",
                "Stepper",
                "Step",
                "StepButton",
                "StepContent",
                `${transformed}
                 return typeof XrmCustomComponentsExample !== "undefined" ? XrmCustomComponentsExample : null;`,
            )

            const Component = factory(
                React,
                XrmForm,
                XrmMemoryStrategy,
                useField,
                ControlComponents,
                formMetadata,
                getCustomComponentsRecord,
                xrmCustomComponentsModelStore,
                getCustomComponentsFormXml,
                Stack,
                Text,
                ComboBox,
                MuiTextField,
                MuiSlider,
                FormControl,
                InputLabel,
                Select,
                MenuItem,
                Stepper,
                Step,
                StepButton,
                StepContent,
            ) as React.ComponentType | null

            return { Component, error: null as string | null }
        } catch (error) {
            return { Component: null, error: (error as Error).message }
        }
    }, [props.code])

    React.useEffect(() => {
        props.onError?.(compiled.error)
    }, [compiled.error, props])

    if (compiled.error) {
        return <pre className="error-box">{compiled.error}</pre>
    }

    if (!compiled.Component) {
        return <div className="helper-text">The code window must define a <code>XrmCustomComponentsExample</code>.</div>
    }

    const PreviewComponent = compiled.Component

    return <XrmCustomComponentsPreviewBoundary key={props.code}>
        <PreviewComponent />
    </XrmCustomComponentsPreviewBoundary>
}

interface IXrmCustomComponentsPreviewBoundaryProps {
    children: React.ReactNode
}

interface IXrmCustomComponentsPreviewBoundaryState {
    error: string | null
}

class XrmCustomComponentsPreviewBoundary extends React.Component<
    IXrmCustomComponentsPreviewBoundaryProps,
    IXrmCustomComponentsPreviewBoundaryState
> {
    public readonly state: IXrmCustomComponentsPreviewBoundaryState = {
        error: null,
    }

    public static getDerivedStateFromError(error: Error): IXrmCustomComponentsPreviewBoundaryState {
        return {
            error: error.message,
        }
    }

    public render(): React.ReactNode {
        if (this.state.error) {
            return <pre className="error-box">{this.state.error}</pre>
        }

        return this.props.children
    }
}
