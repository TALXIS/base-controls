import { Cell } from './adapters';
import { Column } from './column';
import { Control } from './control';
import { Field } from './field';
import { Form as FormRoot } from './form';
import { Notifications } from './notifications';
import { Ribbon } from './ribbon';
import { Section } from './section';
import { Skeleton } from './skeleton';
import { Tab } from './tab';
import { Tabs } from './tabs';

export * from './tabs';
export * from './tab';
export * from './column';
export * from './section';
export * from './control';
export * from './field';
export * from './ribbon';
export * from './skeleton';
export * from './notifications';
export { Cell } from './adapters';
export type { ICellProps } from './ui';
export { Form as FormRoot, FormInternal } from './form';
export type { IFormProps } from './form';
export { useValidationSummary } from './form';

export interface IFormComponents {
    Root: typeof FormRoot;
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
    Root: FormRoot,
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
}
