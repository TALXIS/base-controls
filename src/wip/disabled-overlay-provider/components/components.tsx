import { Overlay } from './overlay';
export interface IDisabledOverlayProviderComponents {
    Overlay: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element;
}


export const components: IDisabledOverlayProviderComponents = {
    Overlay: Overlay
}