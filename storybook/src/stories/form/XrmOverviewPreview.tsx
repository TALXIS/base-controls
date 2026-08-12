import * as Babel from "@babel/standalone"
import React from "react"
import { XrmForm } from "@talxis/base-controls/components/Form"
import { XrmMemoryStrategy } from "@talxis/base-controls/components/Form"
import { formMetadata } from "../../form/shared/formModel"
import { getXrmRecord, xrmModelStore } from "../../form/xrm-form/xrmModel"

interface IXrmOverviewPreviewProps {
    formXml: string
    code: string
    showCode?: boolean
    renderCodeEditor?: (value: string, onChange: (value: string) => void) => React.ReactNode
}

export const XrmOverviewPreview = (props: IXrmOverviewPreviewProps) => {
    const [code, setCode] = React.useState(props.code)

    React.useEffect(() => {
        setCode(props.code)
    }, [props.code])

    const compiled = React.useMemo(() => {
        try {
            const transformed = Babel.transform(code, {
                presets: [
                    ["typescript", { allExtensions: true, isTSX: true }],
                    ["react", { runtime: "classic" }],
                ],
                filename: "xrm-overview-snippet.tsx",
            }).code ?? ""

            const factory = new Function(
                "React",
                "XrmForm",
                "XrmMemoryStrategy",
                "formMetadata",
                "currentFormXml",
                "getXrmRecord",
                "xrmModelStore",
                `Object.defineProperty(this, "currentFormXml", { get: () => currentFormXml, configurable: true });
                 ${transformed}
                 return typeof XrmOverviewExample !== "undefined" ? XrmOverviewExample : null;`,
            )

            const Component = factory(
                React,
                XrmForm,
                XrmMemoryStrategy,
                formMetadata,
                props.formXml,
                getXrmRecord,
                xrmModelStore,
            ) as React.ComponentType | null

            return { Component, error: null as string | null }
        } catch (error) {
            return { Component: null, error: (error as Error).message }
        }
    }, [code, props.formXml])

    if (props.showCode) {
        return <>{props.renderCodeEditor?.(code, setCode)}</>
    }

    if (compiled.error) {
        return <pre className="error-box">{compiled.error}</pre>
    }

    if (!compiled.Component) {
        return <div className="helper-text">The code window must define a <code>XrmOverviewExample</code>.</div>
    }

    const PreviewComponent = compiled.Component

    return <XrmPreviewBoundary key={code}>
        <PreviewComponent />
    </XrmPreviewBoundary>
}

interface IXrmPreviewBoundaryProps {
    children: React.ReactNode
}

interface IXrmPreviewBoundaryState {
    error: string | null
}

class XrmPreviewBoundary extends React.Component<IXrmPreviewBoundaryProps, IXrmPreviewBoundaryState> {
    public readonly state: IXrmPreviewBoundaryState = {
        error: null,
    }

    public static getDerivedStateFromError(error: Error): IXrmPreviewBoundaryState {
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
