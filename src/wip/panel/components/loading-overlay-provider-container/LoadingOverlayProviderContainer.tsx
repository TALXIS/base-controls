import { useMemo } from "react"
import { Container } from "../../../overlay-provider/components"
import { usePanelComponents } from "../../context"
import { getLoadingOverlayProviderContainerStyles } from "./styles"
import { getClassNames } from "../../../../utils"

export const LoadingOverlayProviderContainer = (props: React.HTMLAttributes<HTMLDivElement>) => {
    const styles = useMemo(() => getLoadingOverlayProviderContainerStyles(), []);
    return <Container {...props} className={getClassNames([styles.container, props.className])} />
}