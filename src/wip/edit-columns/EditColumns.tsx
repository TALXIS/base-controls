import { useEffect, useMemo } from "react";
import { getEditColumnsStyles } from "./styles";
import { DndContext, PointerSensor, useSensor } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableItem } from "./sortable-item/SortableItem";
import { EditColumnsContext } from "./useEditColumns";
import { IComponents } from "./components/components";
import { components as defaultComponents } from "./components/components";
import { functions as defaultFunctions, IFunctions } from "./functions/functions";
import { Header } from "./header/Header";
import { useRerender } from "@talxis/react-components";
import { ScrollableContainer } from "./scrollable-container/ScrollableContainer";
import { SaveButton } from "./save-button/SaveButton";
import React from "react";
import { IEditColumns, IEditColumnsEvents } from '../../utils/edit-columns';
import { useEventEmitter } from '../../hooks';
import { IPanelProps, Panel } from "../panel/Panel";
import { getLabels } from "../panel/functions/getLabels";

export interface IEditColumnsRef {
    editColumnsModel: IEditColumns;
}

export interface IEditColumnsProps {
    model: IEditColumns;
    showScopeSelector?: boolean;
    components?: Partial<IComponents>;
    functions?: Partial<IFunctions>;
    panelProps?: IPanelProps;
    onGetRef?: (ref: IEditColumnsRef) => void;
}

export const EditColumns = (props: IEditColumnsProps) => {
    const { showScopeSelector = true, panelProps, model } = props;
    const {components: panelComponents, functions: panelFunctions, ...strippedPanelProps} = panelProps ?? {};
    const styles = useMemo(() => getEditColumnsStyles(), []);
    const sensor = useSensor(PointerSensor);
    const components = { ...defaultComponents, ...props.components };
    const functions = { ...defaultFunctions, ...props.functions };
    const labels = functions.getLabels();

    const visibleColumns = model.onGetColumns().map(col => {
        return {
            ...col,
            id: col.name
        }
    });
    const rerender = useRerender();

    useEventEmitter<IEditColumnsEvents>(model, 'onColumnsChanged', rerender);

    useEffect(() => {
        props.onGetRef?.({
            editColumnsModel: model
        })
    }, []);

    const onDismiss = (ev?: React.SyntheticEvent<HTMLElement, Event> | KeyboardEvent | undefined) => {
        return (ev as KeyboardEvent)?.key === 'Escape' ? ev?.preventDefault() : props.panelProps?.functions?.onDismiss?.();
    };

    return <EditColumnsContext.Provider value={{ model, functions, components, showScopeSelector }}>
        <Panel
            functions={{
                onDismiss: onDismiss,
                getLabels: () => {
                    const originalLabels = getLabels();
                    return {
                        ...originalLabels,
                        header: labels.header
                    }
                },
                onSave: () => {
                    model.save();
                },
                ...panelFunctions
            }}
            components={{
                ScrollableContainer: ScrollableContainer,
                Header: Header,
                SaveButton: SaveButton,
                ...panelComponents
            }}
            {...strippedPanelProps}
        >
            <DndContext
                sensors={[sensor]}
                onDragEnd={(e) => model.moveColumn(e.active.id.toString(), e.over?.id.toString() ?? '')}
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
        </Panel>
    </EditColumnsContext.Provider>
}

