import React from "react"
import { FormControl, InputLabel, MenuItem, Select, Slider as MuiSlider, TextField as MuiTextField } from "@mui/material"
import { XrmForm } from "@talxis/base-controls/components/Form"
import { ControlComponents } from "@talxis/base-controls/components/Form/components/adapters/control"
import { useField } from "@talxis/base-controls/components/Form"
import { getCustomComponentsStrategy } from "../../form/xrm-form/xrmCustomComponentsModel"

const customControlIds = new Set(["customLeadName", "customPhoneNumber", "customEngagementStage", "customMomentumScore", "customWorkspaceUrl", "customNotesPanel"])

const LeadNameControl = () => {
    const field = useField()

    return (
        <MuiTextField
            fullWidth
            size="small"
            variant="outlined"
            label="Lead name"
            value={String(field?.getValue() ?? "")}
            onChange={(event) => field?.setValue(event.target.value)}
        />
    )
}

const PhoneNumberControl = () => {
    const field = useField()

    return (
        <MuiTextField
            fullWidth
            size="small"
            variant="outlined"
            label="Primary phone"
            value={String(field?.getValue() ?? "")}
            onChange={(event) => field?.setValue(event.target.value)}
        />
    )
}

const WorkspaceUrlControl = () => {
    const field = useField()

    return (
        <MuiTextField
            fullWidth
            size="small"
            variant="outlined"
            label="Workspace URL"
            value={String(field?.getValue() ?? "")}
            onChange={(event) => field?.setValue(event.target.value)}
        />
    )
}

const MomentumScoreControl = () => {
    const field = useField()
    const value = Number(field?.getValue() ?? 0)

    return (
        <MuiSlider
            min={0}
            max={100}
            step={1}
            value={value}
            onChange={(_event, nextValue) => field?.setValue(nextValue)}
        />
    )
}

const EngagementStageControl = () => {
    const field = useField()

    return (
        <FormControl fullWidth size="small">
            <InputLabel id="engagement-stage-label">Engagement stage</InputLabel>
            <Select
                labelId="engagement-stage-label"
                label="Engagement stage"
                value={Number(field?.getValue() ?? 1)}
                onChange={(event) => field?.setValue(event.target.value)}
            >
                <MenuItem value={1}>New</MenuItem>
                <MenuItem value={2}>Qualified</MenuItem>
                <MenuItem value={3}>Ready</MenuItem>
            </Select>
        </FormControl>
    )
}

const NotesControl = () => {
    const field = useField()

    return (
        <MuiTextField
            fullWidth
            multiline
            minRows={4}
            variant="outlined"
            label="Narrative notes"
            value={String(field?.getValue() ?? "")}
            onChange={(event) => field?.setValue(event.target.value)}
        />
    )
}

export const XrmCustomControlsPreview = () => {
    const strategy = React.useMemo(() => getCustomComponentsStrategy(), [])

    return (
        <XrmForm
            strategy={strategy}
            components={{
                control: {
                    onRenderControl: (props) => {
                        const controlName = props.id ?? ""

                        if (!customControlIds.has(controlName)) {
                            return ControlComponents.onRenderControl(props)
                        }

                        if (controlName === "customLeadName") {
                            return <LeadNameControl />
                        }

                        if (controlName === "customPhoneNumber") {
                            return <PhoneNumberControl />
                        }

                        if (controlName === "customWorkspaceUrl") {
                            return <WorkspaceUrlControl />
                        }

                        if (controlName === "customMomentumScore") {
                            return <MomentumScoreControl />
                        }

                        if (controlName === "customEngagementStage") {
                            return <EngagementStageControl />
                        }

                        if (controlName === "customNotesPanel") {
                            return <NotesControl />
                        }

                        return ControlComponents.onRenderControl(props)
                    },
                },
            }}
        />
    )
}
