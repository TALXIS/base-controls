import { useEffect, useMemo, useRef } from "react";
import { DndContext, PointerSensor, useSensor } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { EditColumnsColumnListUiComponents, IEditColumnsColumnListUiComponents, IEditColumnsListColumn } from "./components";
import { getEditColumnsColumnListUiStyles } from "./styles";

/** Props for the list of chosen columns, as plain UI. */
export interface IEditColumnsColumnListUiProps {
    /** The chosen columns, in order. */
    columns: IEditColumnsListColumn[];
    /** The column scrolled into view, e.g. the one just added. */
    scrollToName?: string;
    /** Puts the column where `targetName` is. */
    onMove: (name: string, targetName: string) => void;
    /** Replacements for its slots. */
    components?: Partial<IEditColumnsColumnListUiComponents>;
}

/** The chosen columns, dragged to reorder. */
export const EditColumnsColumnList = (props: IEditColumnsColumnListUiProps) => {
    const components = { ...EditColumnsColumnListUiComponents, ...props.components };
    const styles = useMemo(() => getEditColumnsColumnListUiStyles(), []);
    const sensor = useSensor(PointerSensor);
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (props.scrollToName) {
            rootRef.current?.querySelector(`[data-column-name="${CSS.escape(props.scrollToName)}"]`)?.scrollIntoView({ block: 'nearest' });
        }
    }, [props.scrollToName]);

    return <DndContext sensors={[sensor]} modifiers={[restrictToVerticalAxis]} onDragEnd={event => props.onMove(`${event.active.id}`, `${event.over?.id ?? ''}`)}>
        <SortableContext strategy={verticalListSortingStrategy} items={props.columns.map(item => item.column.name)}>
            <div ref={rootRef} className={styles.editColumnsColumnList}>
                {props.columns.map(item => <ColumnListItem key={item.column.name} item={item} components={components} />)}
            </div>
        </SortableContext>
    </DndContext>;
};

const ColumnListItem = (props: { item: IEditColumnsListColumn; components: IEditColumnsColumnListUiComponents }) => props.components.onRenderColumn(props.item);
