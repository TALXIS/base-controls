import * as React from "react";
import { ISkeletonProps, Skeleton } from "@components/DatasetControl/skeleton";
import { ICommandBarProps } from "@legacy";
import { CommandBar } from "./header/command-bar";
import type { ICellProps } from "@components/Grid/cells/cell/Cell";

/**
 * Props every TaskGrid cell renderer and cell editor receives: AG Grid's `ICellRendererParams` plus the
 * `record`, `baseColumn`, `value` and `isCellEditor` the grid injects through `cellRendererParams` /
 * `cellEditorParams`.
 */
export type ITaskGridCellProps = ICellProps;

/** The replaceable parts of the grid's UI. Override any subset through `ITaskGridProps.components`. */
export interface ITaskGridComponents {
    /** The loading placeholder shown until the control instance resolves. */
    onRenderSkeleton: (props: ISkeletonProps) => JSX.Element;
    /** The ribbon above the grid. */
    onRenderCommandBar: (props: ICommandBarProps) => JSX.Element;
    /**
     * Wraps the cell renderer of every data column. `defaultRender` renders whatever the grid would
     * otherwise have used for that column — the base cell, the group cell, `PercentComplete`, the
     * lookup-many renderer, or a component assigned by `IGridCustomizerStrategy`.
     *
     * Switch on `props.baseColumn?.name` and delegate the rest to `defaultRender`. Not called for the
     * checkbox and add-task columns, whose props do not carry a record.
     */
    onRenderCellRenderer: (props: ITaskGridCellProps, defaultRender: (props: ITaskGridCellProps) => React.ReactElement) => React.ReactElement;
    /**
     * The same contract as {@link ITaskGridComponents.onRenderCellRenderer}, for the cell editor.
     * Only fires on editable columns — lookup-many columns edit inside their picker, so they never
     * reach an editor.
     */
    onRenderCellEditor: (props: ITaskGridCellProps, defaultRender: (props: ITaskGridCellProps) => React.ReactElement) => React.ReactElement;
}

/** The defaults for {@link ITaskGridComponents}. */
export const TaskGridComponents: ITaskGridComponents = {
    onRenderSkeleton: (props) => <Skeleton {...props} />,
    onRenderCommandBar: (props) => <CommandBar {...props} />,
    onRenderCellRenderer: (props, defaultRender) => defaultRender(props),
    onRenderCellEditor: (props, defaultRender) => defaultRender(props)
}
