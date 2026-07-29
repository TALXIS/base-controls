import { Cell } from "./cell";
import { Column } from "./column";
import { Section } from "./section";
import { Skeleton } from "./skeleton";
import { Tab } from "./tab";
import { Tabs } from "./tabs";

export * from "./cell";
export * from "./column";
export * from "./section";
export * from "./skeleton";
export * from "./tab";
export * from "./tabs";

export interface IFormUi {
    Tabs: typeof Tabs;
    Tab: typeof Tab;
    Section: typeof Section;
    Column: typeof Column;
    Cell: typeof Cell;
    Skeleton: typeof Skeleton;
}

export const FormUi: IFormUi = {
    Tabs,
    Tab,
    Section,
    Column,
    Cell,
    Skeleton,
};
