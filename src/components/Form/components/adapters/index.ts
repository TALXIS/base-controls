import { Cell } from './cell';
import { Column } from './column';
import { Control } from './control';
import { Field } from './field';
import { Notifications } from './notifications';
import { Ribbon } from './ribbon';
import { Root } from './root';
import { Section } from './section';
import { Skeleton } from '../ui/skeleton';
import { Tab } from './tab';
import { Tabs } from './tabs';

export * from './tabs';
export * from './tab';
export * from './column';
export * from './control';
export * from './field';
export * from './notifications';
export * from './ribbon';
export * from './root';
export * from './section';
export { Cell } from './cell';
export { Skeleton } from '../ui/skeleton';
export type { ICellProps } from '../ui';
export { Root as FormRoot, RootInternal as FormInternal } from './root';
export type { IFormProps } from './root';
export { useValidationSummary } from './root';

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