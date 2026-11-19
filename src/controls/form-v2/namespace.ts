import { RuntimeNotificationBar } from '@controls/runtime-host';
import { FormV2Root } from './FormV2';
import { Tabs } from './adapters/tabs';
import { Tab } from './adapters/tab';
import { Section } from './adapters/section';
import { Column } from './adapters/column';
import { Control } from './adapters/control';
import { FormV2Ui, IFormV2Ui } from './ui';

/** The parts of the form, attached to the form itself. */
export interface IFormV2Parts {
    /** The tab strip; holds the `Tab`s. */
    Tabs: typeof Tabs;
    /** One tab; drawn while closed too, so its parts can be found. */
    Tab: typeof Tab;
    /** A group of controls in a card; compose it from its `Header`, `Title`, `Body` and `Footer`. */
    Section: typeof Section;
    /** A column of sections inside a tab. */
    Column: typeof Column;
    /** A field with its label. */
    Control: typeof Control;
    /** Provides the form's `notifications` part and draws its messages. */
    Notifications: typeof RuntimeNotificationBar;
    /** The parts as plain UI, with no form behind them. */
    Ui: IFormV2Ui;
}

/** Loads the record through `onLoad` and holds every part of the form. */
export const FormV2: typeof FormV2Root & IFormV2Parts = Object.assign(FormV2Root, {
    Tabs,
    Tab,
    Section,
    Column,
    Control,
    Notifications: RuntimeNotificationBar,
    Ui: FormV2Ui,
});
