import { useModel } from "../useModel";
import { Panel, IPanelProps } from '../../../wip/panel/Panel';
import { useEffect, useMemo } from "react";
import { getEditColumnsStyles } from "./styles";
import { DndContext, PointerSensor, useSensor } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableItem } from "./SortableItem/SortableItem";
import { useEventEmitter } from "../../../hooks";
import { IEditColumns, IEditColumnsEvents } from "../../../utils/dataset-control/EditColumns";
import { EditColumnsContext } from "./useEditColumns";
import { IComponents } from "./components/components";
import { components as defaultComponents } from "./components/components";
import { IColumn } from "@talxis/client-libraries";
import { Header } from "./Header/Header";
import { useRerender } from "@talxis/react-components";
import { ScrollableContainer } from "./ScrollableContainer/ScrollableContainer";
import { SaveButton } from "./SaveButton/SaveButton";

export interface IEditColumnsRef {
    editColumnsModel: IEditColumns;
}

export interface IEditColumnsProps {
    onDismiss: () => void;
    isLoading?: boolean;
    showScopeSelector?: boolean;
    components?: Partial<IComponents>;
    panelProps?: IPanelProps;
    onGetRef?: (ref: IEditColumnsRef) => void;
    onFilterVisibleColumns?: (columns: IColumn[]) => IColumn[];
}

export const EditColumns = (props: IEditColumnsProps) => {
    const model = useModel();
    const datasetControl = model.getDatasetControl();
    const dataset = datasetControl.getDataset();
    const provider = dataset.getDataProvider();
    const labels = model.getLabels();
    const styles = useMemo(() => getEditColumnsStyles(), []);
    const editColumnsModel = useMemo(() => datasetControl.editColumns, []);
    const visibleColumns = (props.onFilterVisibleColumns?.(editColumnsModel.getColumns()) ?? editColumnsModel.getColumns()).filter(col => !col.isHidden);
    const sensor = useSensor(PointerSensor);
    const { isLoading, showScopeSelector = true } = props;
    const components = { ...defaultComponents, ...props.components };
    const rerender = useRerender();

    useEventEmitter<IEditColumnsEvents>(editColumnsModel, 'onColumnsChanged', rerender);

    useEffect(() => {
        props.onGetRef?.({
            editColumnsModel
        })
    }, []);

    const getTitle = () => {
        const collectionName = provider.getMetadata().DisplayCollectionName;
        let title = labels["edit-columns"]();
        if (collectionName) {
            title += `: ${collectionName}`;
        }
        return title;
    }

    const onDismiss = (ev?: React.SyntheticEvent<HTMLElement, Event> | KeyboardEvent | undefined) => {
        return (ev as KeyboardEvent)?.key === 'Escape' ? ev?.preventDefault() : props.onDismiss();
    };

    return <EditColumnsContext.Provider value={{ model: editColumnsModel, components, showScopeSelector, visibleColumns }}>
        <Panel
            headerText={getTitle()}
            onDismiss={onDismiss}
            saveButtonText={labels['save']()}
            cancelButtonText={labels['cancel']()}
            isLoading={true}
            onSave={() => {
                editColumnsModel.save();
                props.onDismiss();
            }}
            {...props.panelProps}
            components={{
                ScrollableContainer: ScrollableContainer,
                Header: Header,
                SaveButton: SaveButton,
                ...props.panelProps?.components
            }}
        >
            <DndContext
                sensors={[sensor]}
                onDragEnd={(e) => editColumnsModel.moveColumn(e.active.id.toString(), e.over?.id.toString() ?? '')}
                modifiers={[restrictToVerticalAxis]}
            >
                <SortableContext
                    strategy={verticalListSortingStrategy}
                    items={editColumnsModel.getColumns()}>
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

