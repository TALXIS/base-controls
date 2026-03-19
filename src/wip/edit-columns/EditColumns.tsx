import { useMemo } from "react";
import { getEditColumnsStyles } from "./styles";
import { DndContext, PointerSensor, useSensor } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableItem } from "./sortable-item/SortableItem";
import { components as defaultComponents, IEditColumnsComponents } from "./components/components";
import { Header } from "./header/Header";
import { useRerender } from "@talxis/react-components";
import { ScrollableContainer } from "./scrollable-container/ScrollableContainer";
import { SaveButton } from "./save-button/SaveButton";
import { IEditColumnsEvents } from '../../utils/edit-columns';
import { useEventEmitter } from '../../hooks';
import { EditColumnsComponentsContext, EditColumnsContext, EditColumnsLabelsContext, useEditColumns } from "./context";
import { EDIT_COLUMNS_LABELS, IEditColumnsLabels } from "./labels";

export interface IEditColumnsProps {
    components?: Partial<IEditColumnsComponents>;
    labels?: Partial<IEditColumnsLabels>;
}

export const EditColumns = (props: IEditColumnsProps) => {
    const styles = useMemo(() => getEditColumnsStyles(), []);
    const sensor = useSensor(PointerSensor);
    const labels = { ...EDIT_COLUMNS_LABELS, ...props.labels };
    const components = { ...defaultComponents, ...props.components };
    const context = useEditColumns();
    const rerender = useRerender();
    useEventEmitter<IEditColumnsEvents>(context, 'onColumnsChanged', rerender);

    const visibleColumns = context.getColumns().map(col => {
        return {
            ...col,
            id: col.name
        }
    });

    return <EditColumnsComponentsContext.Provider value={components}>
        <EditColumnsLabelsContext.Provider value={labels}>
            <components.Panel
                components={{
                    ScrollableContainer: ScrollableContainer,
                    Header: Header,
                    SaveButton: SaveButton,
                }}
            >
                <DndContext
                    sensors={[sensor]}
                    onDragEnd={(e) => context.moveColumn(e.active.id.toString(), e.over?.id.toString() ?? '')}
                    modifiers={[restrictToVerticalAxis]}
                >
                    <SortableContext
                        strategy={verticalListSortingStrategy}
                        items={visibleColumns}>
                        <div className={styles.sortableItemsWrapper}>
                            {visibleColumns.map(col => {
                                return <SortableItem key={col.name} column={col} />
                            })}
                        </div>
                    </SortableContext>
                </DndContext>
            </components.Panel>
        </EditColumnsLabelsContext.Provider>
    </EditColumnsComponentsContext.Provider>
}

