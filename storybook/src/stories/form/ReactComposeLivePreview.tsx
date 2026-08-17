import * as Babel from "@babel/standalone"
import React from "react"
import { ComboBox, Icon, IconButton, Slider, Stack, Text, TextField } from "@fluentui/react"
import { Form, MemoryStrategy, useField, useForm } from "@talxis/base-controls/components/Form"
import { OpenMap } from "../../form/react-form/OpenMap"
import { Step, StepButton, StepContent, Stepper } from "@mui/material"
import { Alert, AppBar, Button as MuiButton, Chip, Snackbar, Stack as MuiStack, Toolbar } from "@mui/material"
import { getDemoRecord, getFormColumns } from "../../form/shared/formModel"

interface IReactComposeLivePreviewProps {
    code: string
    formProps: React.ComponentProps<typeof Form.Root>
    codePreview?: string
    onError?: (error: string | null) => void
}

export const ReactComposeLivePreview = (props: IReactComposeLivePreviewProps) => {
    const formPropsRef = React.useRef(props.formProps)
    formPropsRef.current = props.formProps

    const fluent = React.useMemo(
        () => ({
            Stack,
            FluentText: Text,
            TextField,
            Icon,
            ComboBox,
            IconButton,
            Slider,
            OpenMap,
            MuiStepper: Stepper,
            MuiStep: Step,
            MuiStepButton: StepButton,
            MuiStepContent: StepContent,
            Alert,
            AppBar,
            MuiButton,
            Chip,
            MuiStack,
            Toolbar,
            Snackbar,
        }),
        [],
    )

    const compiled = React.useMemo(() => {
        try {
            const transformed = Babel.transform(props.code, {
                presets: [
                    ["typescript", { allExtensions: true, isTSX: true }],
                    ["react", { runtime: "classic" }],
                ],
                filename: "story-local-form-snippet.tsx",
            }).code ?? ""

            const factory = new Function(
                "React",
                "Form",
                "useField",
                "useForm",
                "Stack",
                "FluentText",
                "TextField",
                "Icon",
                "ComboBox",
                "IconButton",
                "Slider",
                "OpenMap",
                "MuiStepper",
                "MuiStep",
                "MuiStepButton",
                "MuiStepContent",
                "Alert",
                "AppBar",
                "MuiButton",
                "Chip",
                "MuiStack",
                "Toolbar",
                "Snackbar",
                "MemoryStrategy",
                "recordData",
                "modelColumns",
                "getFormProps",
                `Object.defineProperty(this, "formProps", { get: getFormProps, configurable: true });
                 const formProps = new Proxy({}, {
                   get: (_, key) => getFormProps()[key],
                   ownKeys: () => Reflect.ownKeys(getFormProps()),
                   getOwnPropertyDescriptor: (_, key) => Object.getOwnPropertyDescriptor(getFormProps(), key),
                 });
                 ${transformed}
                 return typeof FormExample !== "undefined" ? FormExample : null;`,
            )

            const recordData = getDemoRecord()
            const modelColumns = getFormColumns()
            const Component = factory(
                React,
                Form,
                useField,
                useForm,
                fluent.Stack,
                fluent.FluentText,
                fluent.TextField,
                fluent.Icon,
                fluent.ComboBox,
                fluent.IconButton,
                fluent.Slider,
                fluent.OpenMap,
                fluent.MuiStepper,
                fluent.MuiStep,
                fluent.MuiStepButton,
                fluent.MuiStepContent,
                fluent.Alert,
                fluent.AppBar,
                fluent.MuiButton,
                fluent.Chip,
                fluent.MuiStack,
                fluent.Toolbar,
                fluent.Snackbar,
                MemoryStrategy,
                recordData,
                modelColumns,
                () => formPropsRef.current,
            ) as React.ComponentType | null

            return { Component, error: null as string | null }
        } catch (error) {
            return { Component: null, error: (error as Error).message }
        }
    }, [fluent, props.code])

    React.useEffect(() => {
        props.onError?.(compiled.error)
    }, [compiled.error, props])

    if (compiled.error) {
        return <pre className="error-box">{compiled.error}</pre>
    }

    if (!compiled.Component) {
        return <div className="helper-text">The code window must define a <code>FormExample</code>.</div>
    }

    const PreviewComponent = compiled.Component

    return <PreviewBoundary key={props.codePreview ?? props.code}>
        <PreviewComponent />
    </PreviewBoundary>
}

interface IPreviewBoundaryProps {
    children: React.ReactNode
}

interface IPreviewBoundaryState {
    error: string | null
}

class PreviewBoundary extends React.Component<IPreviewBoundaryProps, IPreviewBoundaryState> {
    public readonly state: IPreviewBoundaryState = {
        error: null,
    }

    public static getDerivedStateFromError(error: Error): IPreviewBoundaryState {
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
