import { IOverlayProviderComponents } from '../../overlay-provider/components';
import { Overlay } from './overlay';
import { components as overlayProviderComponents } from '../../overlay-provider/components';

export const components: IOverlayProviderComponents = {
    ...overlayProviderComponents,
    Overlay: Overlay
}