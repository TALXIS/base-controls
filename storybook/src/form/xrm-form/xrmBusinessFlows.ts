import type { IXrmFormContext } from "@talxis/base-controls/components/Form"

export interface IXrmBusinessFlowScenario {
    id: string
    title: string
    description: string
    effects: string[]
    code: string[]
    validations?: {
        attributeName: string
        run: (formContext: IXrmFormContext) => void
    }[]
    apply: (formContext: IXrmFormContext) => void
}

const setInfoNotification = (formContext: IXrmFormContext, id: string, message: string) => {
    formContext.ui.setFormNotification(message, "INFO", id)
}

const notificationIds = [
    "qualification-review",
    "digital-engagement",
    "financial-approval",
    "scheduling-handoff",
]

const getTab = (formContext: IXrmFormContext, name: string) => formContext.ui.tabs.get(name)

const getSection = (formContext: IXrmFormContext, tabName: string, sectionName: string) => {
    return getTab(formContext, tabName)?.sections.get(sectionName) ?? null
}

const validatePhonePrefix = (formContext: IXrmFormContext) => {
    const phone = formContext.getAttribute("phone")
    const validate = () => {
        const phoneValue = String(phone?.getValue() ?? "").trim()
        const hasPrefix = phoneValue.startsWith("+") || phoneValue.startsWith("00")

        phone?.setIsValid(hasPrefix, hasPrefix ? "" : "Use an international dialing prefix such as +420 for qualified contacts.")
    }

    validate()
    phone?.addOnChange(validate)
}

const validateSecureUrl = (formContext: IXrmFormContext) => {
    const url = formContext.getAttribute("url")
    const validate = () => {
        const urlValue = String(url?.getValue() ?? "").trim()
        const isSecure = urlValue.length === 0 || urlValue.startsWith("https://")

        url?.setIsValid(isSecure, isSecure ? "" : "Use an https:// URL before switching the form to a digital-only engagement flow.")
    }

    validate()
    url?.addOnChange(validate)
}

const validateDurationThreshold = (formContext: IXrmFormContext) => {
    const duration = formContext.getAttribute("duration")
    const validate = () => {
        const value = Number(duration?.getValue() ?? 0)
        const isValid = Number.isFinite(value) && value <= 7200

        duration?.setIsValid(isValid, isValid ? "" : "Duration must be 7,200 minutes or less before financial review can proceed.")
    }

    validate()
    duration?.addOnChange(validate)
}

export const resetXrmBusinessFlows = (formContext: IXrmFormContext) => {
    notificationIds.forEach((id) => formContext.ui.clearFormNotification(id))

    formContext.getAttribute("text")?.setRequiredLevel("none")
    formContext.getAttribute("phone")?.setRequiredLevel("none")
    formContext.getAttribute("url")?.setRequiredLevel("none")
    formContext.getAttribute("currency")?.setRequiredLevel("none")
    formContext.getAttribute("dateonly")?.setRequiredLevel("none")
    formContext.getAttribute("datetime")?.setRequiredLevel("none")

    formContext.getAttribute("phone")?.setIsValid(true)
    formContext.getAttribute("url")?.setIsValid(true)
    formContext.getAttribute("duration")?.setIsValid(true)

    formContext.getControl("number")?.setDisabled(false)
    formContext.getControl("decimal")?.setDisabled(false)
    formContext.getControl("phone")?.setVisible(true)

    formContext.getControl("url")?.setLabel("Url")
    formContext.getControl("currency")?.setLabel("Currency")
    formContext.getControl("datetime")?.setLabel("Date time")

    getSection(formContext, "OverviewTab", "primarySection")?.setLabel("Primary details")
    getSection(formContext, "OverviewTab", "typesSection")?.setLabel("Contact channels")
    getSection(formContext, "MetricsTab", "numericSection")?.setLabel("Numeric values")
    getSection(formContext, "SchedulingTab", "datesSection")?.setLabel("Dates")
    getSection(formContext, "SchedulingTab", "attachmentsSection")?.setVisible(true)
    getTab(formContext, "SchedulingTab")?.setVisible(true)
}

export const xrmBusinessFlowScenarios: IXrmBusinessFlowScenario[] = [
    {
        id: "qualification-review",
        title: "Qualification review",
        description: "Mimics a lead qualification step where core identity and contact fields become mandatory and the form highlights incomplete phone formatting.",
        effects: [
            "Focuses the Overview tab and renames the primary section for qualification work.",
            "Marks Text and Phone as required fields.",
            "Keeps the contact status controls interactive and raises a form-level notification.",
            "Adds custom validation when the phone number is missing an international prefix.",
        ],
        code: [
            'resetXrmBusinessFlows(formContext)',
            'formContext.ui.tabs.get("OverviewTab")?.setFocus()',
            'formContext.ui.tabs.get("OverviewTab")?.sections.get("primarySection")?.setLabel("Qualification details")',
            'formContext.getAttribute("text")?.setRequiredLevel("required")',
            'formContext.getAttribute("phone")?.setRequiredLevel("required")',
            'formContext.ui.setFormNotification("Qualification review is active. Complete the contact details before saving.", "INFO", "qualification-review")',
            'const phone = formContext.getAttribute("phone")',
            'const validatePhone = () => {',
            '  const phoneValue = String(phone?.getValue() ?? "").trim()',
            '  const hasPrefix = phoneValue.startsWith("+") || phoneValue.startsWith("00")',
            '  phone?.setIsValid(hasPrefix, hasPrefix ? "" : "Use an international dialing prefix such as +420 for qualified contacts.")',
            '}',
            'validatePhone()',
            'phone?.addOnChange(validatePhone)',
        ],
        validations: [
            {
                attributeName: "phone",
                run: validatePhonePrefix,
            },
        ],
        apply: (formContext) => {
            resetXrmBusinessFlows(formContext)
            getTab(formContext, "OverviewTab")?.setFocus()
            getSection(formContext, "OverviewTab", "primarySection")?.setLabel("Qualification details")
            formContext.getAttribute("text")?.setRequiredLevel("required")
            formContext.getAttribute("phone")?.setRequiredLevel("required")
            setInfoNotification(formContext, "qualification-review", "Qualification review is active. Complete the contact details before saving.")
            validatePhonePrefix(formContext)
        },
    },
    {
        id: "digital-engagement",
        title: "Digital engagement route",
        description: "Shows how a business process can reduce the visible surface for a digital-only path and enforce cleaner web contact data.",
        effects: [
            "Keeps the user on the Overview tab but hides the Phone control.",
            "Renames the contact section and requires the Url field instead.",
            "Shows a guidance notification for the digital path.",
            "Adds custom validation when the URL is not secure.",
        ],
        code: [
            'resetXrmBusinessFlows(formContext)',
            'formContext.ui.tabs.get("OverviewTab")?.setFocus()',
            'formContext.ui.tabs.get("OverviewTab")?.sections.get("typesSection")?.setLabel("Digital channel preferences")',
            'formContext.getControl("phone")?.setVisible(false)',
            'formContext.getAttribute("url")?.setRequiredLevel("required")',
            'formContext.getControl("url")?.setLabel("Primary web endpoint")',
            'formContext.ui.setFormNotification("Digital engagement is active. Collect a secure web contact before continuing.", "INFO", "digital-engagement")',
            'const url = formContext.getAttribute("url")',
            'const validateUrl = () => {',
            '  const urlValue = String(url?.getValue() ?? "").trim()',
            '  const isSecure = urlValue.length === 0 || urlValue.startsWith("https://")',
            '  url?.setIsValid(isSecure, isSecure ? "" : "Use an https:// URL before switching the form to a digital-only engagement flow.")',
            '}',
            'validateUrl()',
            'url?.addOnChange(validateUrl)',
        ],
        validations: [
            {
                attributeName: "url",
                run: validateSecureUrl,
            },
        ],
        apply: (formContext) => {
            resetXrmBusinessFlows(formContext)
            getTab(formContext, "OverviewTab")?.setFocus()
            getSection(formContext, "OverviewTab", "typesSection")?.setLabel("Digital channel preferences")
            formContext.getControl("phone")?.setVisible(false)
            formContext.getAttribute("url")?.setRequiredLevel("required")
            formContext.getControl("url")?.setLabel("Primary web endpoint")
            setInfoNotification(formContext, "digital-engagement", "Digital engagement is active. Collect a secure web contact before continuing.")
            validateSecureUrl(formContext)
        },
    },
    {
        id: "financial-approval",
        title: "Financial approval checkpoint",
        description: "Simulates an approval stage where metrics become review-only, review data is emphasized, and the current duration is validated against a threshold.",
        effects: [
            "Focuses the Metrics tab and relabels the numeric section for approval review.",
            "Makes Currency required and locks Number and Decimal for editing.",
            "Expands review visibility with a contextual notification.",
            "Adds custom validation when the Duration value exceeds the approval threshold.",
        ],
        code: [
            'resetXrmBusinessFlows(formContext)',
            'formContext.ui.tabs.get("MetricsTab")?.setFocus()',
            'formContext.ui.tabs.get("MetricsTab")?.sections.get("numericSection")?.setLabel("Approval metrics")',
            'formContext.getAttribute("currency")?.setRequiredLevel("required")',
            'formContext.getControl("number")?.setDisabled(true)',
            'formContext.getControl("decimal")?.setDisabled(true)',
            'formContext.getControl("currency")?.setLabel("Approved budget")',
            'formContext.ui.setFormNotification("Financial approval is in progress. Review-only metric fields are now locked.", "INFO", "financial-approval")',
            'const duration = formContext.getAttribute("duration")',
            'const validateDuration = () => {',
            '  const value = Number(duration?.getValue() ?? 0)',
            '  const isValid = Number.isFinite(value) && value <= 7200',
            '  duration?.setIsValid(isValid, isValid ? "" : "Duration must be 7,200 minutes or less before financial review can proceed.")',
            '}',
            'validateDuration()',
            'duration?.addOnChange(validateDuration)',
        ],
        validations: [
            {
                attributeName: "duration",
                run: validateDurationThreshold,
            },
        ],
        apply: (formContext) => {
            resetXrmBusinessFlows(formContext)
            getTab(formContext, "MetricsTab")?.setFocus()
            getSection(formContext, "MetricsTab", "numericSection")?.setLabel("Approval metrics")
            formContext.getAttribute("currency")?.setRequiredLevel("required")
            formContext.getControl("number")?.setDisabled(true)
            formContext.getControl("decimal")?.setDisabled(true)
            formContext.getControl("currency")?.setLabel("Approved budget")
            setInfoNotification(formContext, "financial-approval", "Financial approval is in progress. Review-only metric fields are now locked.")
            validateDurationThreshold(formContext)
        },
    },
    {
        id: "scheduling-handoff",
        title: "Scheduling handoff",
        description: "Demonstrates a late-stage handoff where the scheduling tab becomes the focus, secondary handoff details are hidden, and date fields are promoted for completion.",
        effects: [
            "Focuses the Scheduling tab and keeps it visible to the user.",
            "Renames the dates section and hides the secondary handoff details section.",
            "Marks Date only and Date time as required for handoff readiness.",
            "Adds a form notification describing the operational handoff state.",
        ],
        code: [
            'resetXrmBusinessFlows(formContext)',
            'formContext.ui.tabs.get("SchedulingTab")?.setVisible(true)',
            'formContext.ui.tabs.get("SchedulingTab")?.setFocus()',
            'formContext.ui.tabs.get("SchedulingTab")?.sections.get("datesSection")?.setLabel("Handoff dates")',
            'formContext.ui.tabs.get("SchedulingTab")?.sections.get("attachmentsSection")?.setVisible(false)',
            'formContext.getAttribute("dateonly")?.setRequiredLevel("required")',
            'formContext.getAttribute("datetime")?.setRequiredLevel("required")',
            'formContext.getControl("datetime")?.setLabel("Handoff appointment")',
            'formContext.ui.setFormNotification("Scheduling handoff is active. Confirm the final dates before sharing the record.", "INFO", "scheduling-handoff")',
        ],
        apply: (formContext) => {
            resetXrmBusinessFlows(formContext)
            getTab(formContext, "SchedulingTab")?.setVisible(true)
            getTab(formContext, "SchedulingTab")?.setFocus()
            getSection(formContext, "SchedulingTab", "datesSection")?.setLabel("Handoff dates")
            getSection(formContext, "SchedulingTab", "attachmentsSection")?.setVisible(false)
            formContext.getAttribute("dateonly")?.setRequiredLevel("required")
            formContext.getAttribute("datetime")?.setRequiredLevel("required")
            formContext.getControl("datetime")?.setLabel("Handoff appointment")
            setInfoNotification(formContext, "scheduling-handoff", "Scheduling handoff is active. Confirm the final dates before sharing the record.")
        },
    },
]
