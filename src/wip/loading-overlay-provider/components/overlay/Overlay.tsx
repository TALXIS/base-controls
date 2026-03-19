import { IOverlayProps } from "@fluentui/react"
import { Overlay as OverlayBase } from "../../../overlay-provider/components"
import { useMemo } from "react"
import { getOverlayStyles } from "./styles"
import { getClassNames } from "../../../../utils"
import { useLoadingOverlayProvider, useLoadingOverlayProviderComponents } from "../../context"

export const Overlay = (props: IOverlayProps) => {
    const styles = useMemo(() => getOverlayStyles(), []);
    const { message } = useLoadingOverlayProvider();
    const components = useLoadingOverlayProviderComponents();

    return <OverlayBase {...props} className={getClassNames([styles.overlay, props.className])}>
        {props.children}
        <components.Spinner label={message} />
    </OverlayBase>
}