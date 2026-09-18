import { Cell } from './adapters/cell';
import { Column } from './adapters/column';
import { Control } from './adapters/control';
import { Field } from './adapters/field';
import { Notifications } from './adapters/notifications';
import { Ribbon } from './adapters/ribbon';
import { Root } from './adapters/root';
import { Section } from './adapters/section';
import { Tab } from './adapters/tab';
import { Tabs } from './adapters/tabs';
import { Skeleton } from './ui/skeleton';

export interface IFormComponents {
    Root: typeof Root;
    Tabs: typeof Tabs;
    Tab: typeof Tab;
    Section: typeof Section;
    Column: typeof Column;
    Field: typeof Field;
    Cell: typeof Cell;
    Control: typeof Control;
    Ribbon: typeof Ribbon;
    Notifications: typeof Notifications;
    Skeleton: typeof Skeleton;
}

export const Form: IFormComponents = {
    Root,
    Tabs,
    Tab,
    Section,
    Column,
    Field,
    Cell,
    Control,
    Ribbon,
    Notifications,
    Skeleton,
};
