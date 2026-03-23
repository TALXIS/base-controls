import { ISpinnerProps, SpinnerSize } from "@fluentui/react";
import { Spinner as SpinnerBase } from '../../../loading-overlay-provider/components'

export const Spinner = (props: ISpinnerProps) => {
    return <SpinnerBase size={SpinnerSize.large} {...props} />
}