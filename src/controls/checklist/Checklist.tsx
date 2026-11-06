import { useMemo } from "react";
import { createClientSideRowModelModule, createEditingModule, Grid, IGridProps, IGridModule, IGridModuleMap } from "@controls/grid";
import { createChecklistModule, IChecklistFieldMapping } from "./modules/checklist";

/** A checklist's grid module; the row model is always client-side and the checklist's own is added last. */
export type IChecklistGridModule = IGridModule<Exclude<keyof IGridModuleMap, 'rowModel' | 'checklist'>>;

export interface IChecklistProps extends Omit<IGridProps, 'modules'> {
    /** Which of the provider's columns carry the label, the order and the completion state; read once, at mount. */
    fieldMapping: IChecklistFieldMapping;
    /** An auto-saving `editing` module when absent; a list without `editing` is read-only. Read once, at mount. */
    modules?: IChecklistGridModule[];
}

/** A grid over the provider's records as a checklist: tick off, rename, reorder, add and delete items. */
export const ChecklistRoot = (props: IChecklistProps) => {
    const { fieldMapping, modules: _, ...gridProps } = props;
    const modules = useMemo((): IGridModule[] => [
        createClientSideRowModelModule(),
        ...props.modules ?? [createEditingModule({ enableAutoSave: true })],
        createChecklistModule({ fieldMapping }),
    ], []);

    return <Grid enableZebra={false} enableOptionSetColors={true} {...gridProps} modules={modules} />;
};
