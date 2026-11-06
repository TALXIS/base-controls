import { RibbonUiCommandBar } from './RibbonUiCommandBar';
import { RibbonUiShimmer } from './shimmer';

export * from './RibbonUiCommandBar';
export * from './components';
export * from './shimmer';

/** The ribbon as plain UI, with no runtime behind it. */
export interface IRibbonUi {
    CommandBar: typeof RibbonUiCommandBar;
    Shimmer: typeof RibbonUiShimmer;
}

export const RibbonUi: IRibbonUi = {
    CommandBar: RibbonUiCommandBar,
    Shimmer: RibbonUiShimmer,
};
