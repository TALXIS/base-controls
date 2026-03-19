import { ISpinnerProps, SpinnerSize } from "@fluentui/react"
import { Spinner } from "../../../loading-overlay-provider/components"

export const LoadingOverlaySpinner = (props: ISpinnerProps) => {
    return <Spinner size={SpinnerSize.large} {...props} />
}