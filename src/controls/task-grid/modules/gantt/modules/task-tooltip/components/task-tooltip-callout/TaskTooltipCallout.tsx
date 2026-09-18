import { Callout, DirectionalHint, ICalloutProps } from "@fluentui/react";


export const TaskTooltipCallout = (props: ICalloutProps) => {
    return <Callout
        directionalHint={DirectionalHint.bottomLeftEdge}
        directionalHintFixed={false}
        isBeakVisible={false}
        gapSpace={8}
        {...props} />
}