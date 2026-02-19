import { DefaultButton, Label, PanelType, PrimaryButton, useTheme } from "@fluentui/react";
import { useModel } from "../useModel";
import { Key, useMemo, useRef, useState } from "react";
import { getEditColumnsStyles } from "./styles";
import { DndContext, PointerSensor, useSensor } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableItem } from "./SortableItem/SortableItem";
import { useEventEmitter } from "../../../hooks";
import { useRerender } from "@talxis/react-components";
import { ColumnSelector } from "./ColumnSelector/ColumnSelector";
import { useShouldRemount } from "../../../hooks/useShouldRemount";
import { ScopeSelector } from "./ScopeSelector/ScopeSelector";
import { IEditColumnsEvents } from "../../../utils/dataset-control/EditColumns";
import { EditColumnsContext } from "./useEditColumns";
import { Panel } from "../../../wip/panel/Panel";

interface IEditColumnsProps {
    onDismiss: () => void;
}

export const EditColumns = (props: IEditColumnsProps) => {
    const model = useModel();
    const datasetControl = model.getDatasetControl();
    const dataset = datasetControl.getDataset();
    const provider = dataset.getDataProvider();
    const theme = useTheme();
    const labels = model.getLabels();
    const styles = useMemo(() => getEditColumnsStyles(theme), []);
    const editColumnsModel = useMemo(() => datasetControl.editColumns, []);
    const columns = editColumnsModel.getColumns();
    const sensor = useSensor(PointerSensor);
    const scrollableContainerRef = useRef<HTMLDivElement>(null);
    const [shouldRemountColumnSelector, remountColumnSelector] = useShouldRemount();
    const [openColumnSelectorOnMount, setOpenColumnSelectorOnMount] = useState(false);
    const rerender = useRerender();
    useEventEmitter<IEditColumnsEvents>(editColumnsModel, 'onColumnsChanged', rerender);
    useEventEmitter<IEditColumnsEvents>(editColumnsModel, 'onRelatedEntityColumnChanged', () => {
        remountColumnSelector();
        setOpenColumnSelectorOnMount(true);
    });
    useEventEmitter<IEditColumnsEvents>(editColumnsModel, 'onColumnAdded', () => scrollableContainerRef.current?.scrollTo({ top: 0 }));

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

    return <EditColumnsContext.Provider value={editColumnsModel}>
        <Panel
            headerText={getTitle()}
            onDismiss={onDismiss}
            saveButtonText={labels['save']()}
            cancelButtonText={labels['cancel']()}
            onSave={() => {
                editColumnsModel.save();
                props.onDismiss();
            }}
        >
            <div className={styles.header}>
                <div className={styles.selectors}>
                    <div className={styles.selector}>
                        <Label>{labels["column-source"]()}</Label>
                        <ScopeSelector />
                    </div>
                    {!shouldRemountColumnSelector &&
                        <div className={styles.selector}>
                            <ColumnSelector
                                openMenuOnMount={openColumnSelectorOnMount} />
                        </div>
                    }
                </div>
            </div>
            <div ref={scrollableContainerRef} className={styles.scrollableContainer}>
                <DndContext
                    sensors={[sensor]}
                    onDragEnd={(e) => editColumnsModel.onColumnMoved(e.active.id.toString(), e.over?.id.toString() ?? '')}
                    modifiers={[restrictToVerticalAxis]}
                >
                    <SortableContext
                        strategy={verticalListSortingStrategy}
                        items={editColumnsModel.getColumns()}>
                        <div className={styles.sortableItemsWrapper}>
                            {columns.filter(col => !col.isHidden).map(col => {
                                return <SortableItem key={col.name} column={col} />
                            })}
                        </div>
                    </SortableContext>
                </DndContext>
            </div>
        </Panel>
    </EditColumnsContext.Provider>
}

