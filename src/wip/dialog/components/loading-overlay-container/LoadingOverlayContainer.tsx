import { useMemo } from "react"
import { getLoadingOverlayContainerStyles } from "./styles";
import { getClassNames } from "../../../../utils";

export const LoadingOverlayContainer = (props: React.HTMLAttributes<HTMLDivElement>) => {
    const styles = useMemo(() => getLoadingOverlayContainerStyles(), []);
    return <div {...props} className={getClassNames([styles.loadingOverlayContainer, props.className])} />
}