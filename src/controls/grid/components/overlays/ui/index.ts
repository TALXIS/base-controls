import { OverlayUiLoading } from './loading';

export * from './loading';

/** What draws an overlay, and nothing that knows why it is shown. */
export interface IOverlayUi {
    Loading: typeof OverlayUiLoading;
}

export const OverlayUi: IOverlayUi = {
    Loading: OverlayUiLoading,
};
