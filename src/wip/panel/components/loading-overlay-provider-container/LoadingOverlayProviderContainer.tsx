import { Container } from "../../../overlay-provider/components"
import { usePanelComponents } from "../../context"

export const LoadingOverlayProviderContainer = (props: React.HTMLAttributes<HTMLDivElement>) => {
    const components = usePanelComponents();
    
    return <Container {...props} style={{position: 'unset'}} />
}