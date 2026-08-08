import { useDraggable, useDroppable } from "@dnd-kit/core"
import { useSortable } from "@dnd-kit/sortable"
import { CSS as DndCss } from "@dnd-kit/utilities"
import type { FormXmlCell } from "@talxis/client-metadata"
import { useEffect, useRef } from "react"
import { styles } from "./FormXmlBuilderPanel.styles"
import type { ICanvasRect } from "./FormXmlBuilderPanel.types"

export const useLongPressDragCursor = () => {
    const timeoutRef = useRef<number | null>(null)

    const clear = () => {
        if (timeoutRef.current !== null) {
            window.clearTimeout(timeoutRef.current)
            timeoutRef.current = null
        }
        document.body.style.cursor = ""
        document.body.classList.remove("form-builder-grabbing")
    }

    const start = (event: React.PointerEvent) => {
        if (event.button !== 0) return
        clear()
        timeoutRef.current = window.setTimeout(() => {
            document.body.style.cursor = "grabbing"
            document.body.classList.add("form-builder-grabbing")
        }, 180)
    }

    useEffect(() => clear, [])

    return { start, clear }
}

export const SortableTab = (props: {
    id: string
    rect: ICanvasRect
    label: string
    selected: boolean
    isDragging: boolean
    transferTarget: boolean
    onClick: () => void
    onDoubleClick: () => void
    onContextMenu: (event: React.MouseEvent) => void
}) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: props.id })
    const longPressCursor = useLongPressDragCursor()

    return (
        <div
            ref={setNodeRef}
            style={{
                top: props.rect.top,
                left: props.rect.left,
                width: props.rect.width,
                height: props.rect.height,
                transform: props.isDragging ? undefined : DndCss.Transform.toString(transform),
                transition,
                opacity: props.isDragging ? 0.35 : 1,
            }}
            {...attributes}
            {...listeners}
            className={`${styles.tabButton} ${props.selected ? styles.selectedTabButton : ""} ${props.transferTarget ? styles.tabTransferTarget : ""}`.trim()}
            onClick={props.onClick}
            onPointerDown={(event) => {
                if (event.button === 0) props.onClick()
                longPressCursor.start(event)
                listeners?.onPointerDown?.(event)
            }}
            onPointerUp={longPressCursor.clear}
            onPointerCancel={longPressCursor.clear}
            onDoubleClick={props.onDoubleClick}
            onContextMenu={props.onContextMenu}
        />
    )
}

export const DraggableSection = (props: {
    id: string
    rect: ICanvasRect
    selected: boolean
    isDragging: boolean
    onClick: () => void
    onDoubleClick: () => void
    onContextMenu: (event: React.MouseEvent) => void
}) => {
    const { attributes, listeners, setNodeRef: setDraggableRef, transform } = useDraggable({ id: props.id })
    const { isOver, setNodeRef: setDroppableRef } = useDroppable({ id: props.id })
    const longPressCursor = useLongPressDragCursor()

    return (
        <div
            ref={(node) => {
                setDraggableRef(node)
                setDroppableRef(node)
            }}
            style={{
                top: props.rect.top,
                left: props.rect.left,
                width: props.rect.width,
                height: props.rect.height,
                transform: props.isDragging ? undefined : DndCss.Translate.toString(transform),
                opacity: props.isDragging ? 0.35 : 1,
                cursor: props.isDragging ? "grabbing" : undefined,
            }}
            {...attributes}
            {...listeners}
            className={`${styles.sectionWrapper} ${isOver ? styles.activeDropTarget : ""}`.trim()}
            onPointerDown={(event) => {
                if (event.button === 0) props.onClick()
                longPressCursor.start(event)
                listeners?.onPointerDown?.(event)
            }}
            onPointerUp={longPressCursor.clear}
            onPointerCancel={longPressCursor.clear}
            onDoubleClick={props.onDoubleClick}
            onContextMenu={props.onContextMenu}
        >
            <div className={`${styles.sectionOverlay} form-builder-section-outline ${props.selected ? styles.selectedOverlay : ""}`.trim()} />
        </div>
    )
}

export const DraggableColumn = (props: {
    id: string
    rect: ICanvasRect
    columnIndex: number
    empty: boolean
    width: string | undefined
    selected: boolean
    isDragging: boolean
    isLast: boolean
    onClick: () => void
    onContextMenu: (event: React.MouseEvent) => void
    onResizeStart?: (event: React.PointerEvent) => void
}) => {
    const { attributes, listeners, setNodeRef: setDraggableRef, transform } = useDraggable({ id: props.id })
    const { isOver, setNodeRef: setDroppableRef } = useDroppable({ id: props.id })
    const longPressCursor = useLongPressDragCursor()
    const footerHeight = 32

    return (
        <div
            ref={(node) => {
                setDraggableRef(node)
                setDroppableRef(node)
            }}
            style={{
                top: props.rect.top,
                left: props.rect.left,
                width: props.rect.width,
                height: Math.max(props.rect.height, 60) + footerHeight,
                transform: props.isDragging ? undefined : DndCss.Translate.toString(transform),
                opacity: props.isDragging ? 0.35 : 1,
                cursor: props.isDragging ? "grabbing" : undefined,
            }}
            {...attributes}
            {...listeners}
            className={`${styles.columnOverlay} ${props.empty ? styles.emptyColumnOverlay : ""} ${props.selected || isOver ? styles.selectedOverlay : ""}`.trim()}
            onPointerDown={(event) => {
                const target = event.target as HTMLElement | null
                if (target?.closest(`.${styles.columnResizeHandle}`)) return
                if (event.button === 0) props.onClick()
                longPressCursor.start(event)
                listeners?.onPointerDown?.(event)
            }}
            onPointerUp={longPressCursor.clear}
            onPointerCancel={longPressCursor.clear}
        >
            {!props.isLast && props.onResizeStart && (
                <div
                    className={styles.columnResizeHandle}
                    onPointerDown={(event) => {
                        event.stopPropagation()
                        props.onResizeStart?.(event)
                    }}
                />
            )}
            <div
                className={`${styles.columnFooter} ${props.empty ? styles.emptyColumnFooter : ""}`.trim()}
                onClick={props.onClick}
                onPointerDown={(event) => {
                    if (event.button === 0) props.onClick()
                }}
                onContextMenu={props.onContextMenu}
            >
                <span>Column {props.columnIndex + 1}{props.width ? ` (${props.width})` : ""}</span>
            </div>
        </div>
    )
}

export const DraggableField = (props: {
    id: string
    rect: ICanvasRect
    cell: FormXmlCell
    selected: boolean
    isDragging: boolean
    onClick: () => void
    onDoubleClick: () => void
    onContextMenu: (event: React.MouseEvent) => void
}) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: props.id })
    const longPressCursor = useLongPressDragCursor()

    return (
        <div
            ref={setNodeRef}
            style={{
                top: props.rect.top,
                left: props.rect.left,
                width: props.rect.width,
                height: props.rect.height,
                transform: props.isDragging ? undefined : DndCss.Translate.toString(transform),
                opacity: props.isDragging ? 0.35 : 1,
            }}
            {...attributes}
            {...listeners}
            className={`${styles.fieldOverlay} ${props.selected ? styles.selectedOverlay : ""}`.trim()}
            onClick={props.onClick}
            onPointerDown={(event) => {
                if (event.button === 0) props.onClick()
                longPressCursor.start(event)
                listeners?.onPointerDown?.(event)
            }}
            onPointerUp={longPressCursor.clear}
            onPointerCancel={longPressCursor.clear}
            onDoubleClick={props.onDoubleClick}
            onContextMenu={props.onContextMenu}
        />
    )
}
