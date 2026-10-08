import { useMemo } from "react";
import { createClientSideRowModelModule, createEditingModule, Grid, IGrid, IGridLabels, IGridModules } from "@controls/grid";
import { ICheckListLabels } from "./labels";
import { createCheckListModule, ICheckListFieldMapping } from "./module";

/** The grid modules that work with a checklist; the others reorder or hide rows, or block dragging. */
export type ICheckListModules = Pick<IGridModules, 'license' | 'editing' | 'rowSelection' | 'clipboard' | 'aggregation' | 'legacyClientApiCompatibility' | 'custom'>;

export interface ICheckListProps extends Omit<IGrid, 'modules' | 'labels'> {
    /** Which of the provider's columns carry the label, the order and the completion state; read once, at mount. */
    fieldMapping: ICheckListFieldMapping;
    /** Merged over an auto-saving `editing` module; `editing: undefined` makes the list read-only. Read once, at mount. */
    modules?: ICheckListModules;
    /** Overrides for the grid's strings and the checklist's own; read once, at mount. */
    labels?: Partial<IGridLabels & ICheckListLabels>;
}

/** A grid over the provider's records as a checklist: tick off, rename, reorder, add and delete items. */
export const CheckList = (props: ICheckListProps) => {
    const { fieldMapping, modules: _, ...gridProps } = props;
    const modules = useMemo<IGridModules>(() => {
        const { license, editing, rowSelection, clipboard, aggregation, legacyClientApiCompatibility, custom = [] } = { editing: createEditingModule({ autoSave: true }), ...props.modules };
        return {
            license,
            editing,
            rowSelection,
            clipboard,
            aggregation,
            legacyClientApiCompatibility,
            rowModel: createClientSideRowModelModule(),
            custom: [...custom, createCheckListModule({ fieldMapping, labels: props.labels })],
        };
    }, []);

    return <Grid.Root enableZebra={false} enableOptionSetColors={true} {...gridProps} modules={modules} />;
};
