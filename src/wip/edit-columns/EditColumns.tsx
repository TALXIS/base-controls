import { useMemo } from "react";
import { getEditColumnsStyles } from "./styles";
import { DndContext, PointerSensor, useSensor } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { components as defaultComponents, IEditColumnsComponents } from "./components/components";
import { Header } from "./components/header/Header";
import { useRerender } from "@talxis/react-components";
import { ScrollableContainer } from "./components/scrollable-container/ScrollableContainer";
import { SaveButton } from "./components/save-button/SaveButton";
import { IEditColumnsEvents } from '../../utils/edit-columns';
import { useEventEmitter } from '../../hooks';
import { EditColumnsComponentsContext, EditColumnsLabelsContext, EditColumnsPropsContext, useEditColumns } from "./context";
import { EDIT_COLUMNS_LABELS, IEditColumnsLabels } from "./labels";
import { SortableColumn } from "./components/sortable-column";
import { Panel } from "./components/panel";

export interface IEditColumnsProps {
    isScopeSelectorVisible?: boolean;
    components?: Partial<IEditColumnsComponents>;
    labels?: Partial<IEditColumnsLabels>;
    children?: React.ReactNode;
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
            <EditColumnsPropsContext.Provider value={{ isScopeSelectorVisible: props.isScopeSelectorVisible ?? true }}>
                <components.Panel
                    components={{
                        ScrollableContainer: ScrollableContainer,
                        Header: Header,
                        FooterPrimaryButton: SaveButton,
                        Panel: Panel
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
                                    return <SortableColumn key={col.name} column={col} />
                                })}
                            </div>
                        </SortableContext>
                    </DndContext>
                    {props.children}
                </components.Panel>
            </EditColumnsPropsContext.Provider>
        </EditColumnsLabelsContext.Provider>
    </EditColumnsComponentsContext.Provider>
}

