import * as Babel from "@babel/standalone"
import React, { useEffect, useMemo, useRef } from "react"
import { Form, useField } from "@talxis/base-controls/components/Form"
import { ComboBox, Icon, IconButton, Slider, Stack, Text, TextField } from "@fluentui/react"
import { OpenMap } from "./OpenMap"
import { Step, StepButton, StepContent, Stepper } from "@mui/material"

interface ILiveFormCodeProps {
    code: string
    formProps: React.ComponentProps<typeof Form.Root>
    useField: typeof useField
    fluent: {
        Stack: typeof Stack
        FluentText: typeof Text
        TextField: typeof TextField
        Icon: typeof Icon
        ComboBox: typeof ComboBox
        IconButton: typeof IconButton
        Slider: typeof Slider
        OpenMap: typeof OpenMap
        MuiStepper?: typeof Stepper
        MuiStep?: typeof Step
        MuiStepButton?: typeof StepButton
        MuiStepContent?: typeof StepContent
    }
    onError?: (error: string | null) => void
}

export const LiveFormCode = (props: ILiveFormCodeProps) => {
    const { code, formProps, onError, useField, fluent } = props
    const formPropsRef = useRef(formProps)

    formPropsRef.current = formProps

    const compiled = useMemo(() => {
        try {
            const transformed = Babel.transform(code, {
                presets: [
                    ["typescript", { allExtensions: true, isTSX: true }],
                    ["react", { runtime: "classic" }],
                ],
                filename: "form-snippet.tsx",
            }).code ?? ""

            const factory = new Function(
                "React",
                "Form",
                "useField",
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

            const Component = factory(
                React,
                Form,
                useField,
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
                () => formPropsRef.current,
            ) as React.ComponentType | null

            return { Component, error: null as string | null }
        } catch (error) {
            return { Component: null, error: (error as Error).message }
        }
    }, [code, fluent, useField])

    useEffect(() => {
        onError?.(compiled.error)
    }, [compiled.error, onError])

    if (compiled.error) {
        return <pre className="error-box">{compiled.error}</pre>
    }

    if (!compiled.Component) {
        return <div className="helper-text">The code window must define a <code>FormExample</code>.</div>
    }

    const PreviewComponent = compiled.Component

    return <RuntimeBoundary key={code}>
        <PreviewComponent />
    </RuntimeBoundary>
}

interface IRuntimeBoundaryProps {
    children: React.ReactNode
}

interface IRuntimeBoundaryState {
    error: string | null
}

class RuntimeBoundary extends React.Component<IRuntimeBoundaryProps, IRuntimeBoundaryState> {
    public readonly state: IRuntimeBoundaryState = {
        error: null,
    }

    public static getDerivedStateFromError(error: Error): IRuntimeBoundaryState {
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
