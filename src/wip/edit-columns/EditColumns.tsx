import { useEffect, useMemo } from "react";
import { getEditColumnsStyles } from "./styles";
import { DndContext, PointerSensor, useSensor } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableItem } from "./sortable-item/SortableItem";
import { IComponents } from "./components/components";
import { components as defaultComponents } from "./components/components";
import { functions as defaultFunctions, IFunctions } from "./functions/functions";
import { Header } from "./header/Header";
import { useRerender } from "@talxis/react-components";
import { ScrollableContainer } from "./scrollable-container/ScrollableContainer";
import { SaveButton } from "./save-button/SaveButton";
import { IEditColumns, IEditColumnsEvents } from '../../utils/edit-columns';
import { useEventEmitter } from '../../hooks';
import { getLabels } from "../panel/functions/getLabels";
import { useContext } from "../shared";
import { EditColumnsInternalContext } from "./useEditColumns";
import { EditColumnsContext } from "./context";

export interface IEditColumnsRef {
    editColumnsModel: IEditColumns;
}

export interface IEditColumnsProps {
    showScopeSelector?: boolean;
    components?: Partial<IComponents>;
    functions?: Partial<IFunctions>;
    onGetRef?: (ref: IEditColumnsRef) => void;
}

export const EditColumns = (props: IEditColumnsProps) => {
    const { showScopeSelector = true } = props;
    const styles = useMemo(() => getEditColumnsStyles(), []);
    const sensor = useSensor(PointerSensor);
    const components = { ...defaultComponents, ...props.components};
    const functions = { ...defaultFunctions, ...props.functions };
    const labels = functions.getLabels();
    const context = useContext('EditColumns', EditColumnsContext);

    const visibleColumns = context.getColumns().map(col => {
        return {
            ...col,
            id: col.name
        }
    });
    const rerender = useRerender();

    useEventEmitter<IEditColumnsEvents>(context, 'onColumnsChanged', rerender);

    useEffect(() => {
        props.onGetRef?.({
            editColumnsModel: context
        })
    }, []);

    return <EditColumnsInternalContext.Provider value={{ model: context, functions, components, showScopeSelector }}>
        <components.Panel
            functions={{
                getLabels: () => {
                    const originalLabels = getLabels();
                    return {
                        ...originalLabels,
                        header: labels.header
                    }
                },
                onSave: () => {
                    context.save();
                },
            }}
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
    </EditColumnsInternalContext.Provider>
}

