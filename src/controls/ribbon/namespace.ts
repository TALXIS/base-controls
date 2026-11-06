import { RibbonRoot } from './Ribbon';
import { IRibbonUi, RibbonUi } from './ui';

/** The parts of the ribbon, attached to the ribbon itself. */
export interface IRibbonParts {
    /** The ribbon as plain UI, with no runtime behind it. */
    Ui: IRibbonUi;
}

/** A command bar of the commands `onLoad` returns: actions run when clicked, menus open. */
export const Ribbon: typeof RibbonRoot & IRibbonParts = Object.assign(RibbonRoot, { Ui: RibbonUi });
