import { RibbonUiCommandBar } from './RibbonUiCommandBar';
import { RibbonUiShimmer } from './shimmer';

export * from './RibbonUiCommandBar';
export * from './components';
export * from './shimmer';

/** The ribbon as plain UI, with no runtime behind it. */
export interface IRibbonUi {
    /** The command bar the commands are drawn in. */
    CommandBar: typeof RibbonUiCommandBar;
    /** The placeholder shown until the first load finishes. */
    Shimmer: typeof RibbonUiShimmer;
}

export const RibbonUi: IRibbonUi = {
    CommandBar: RibbonUiCommandBar,
    Shimmer: RibbonUiShimmer,
};
