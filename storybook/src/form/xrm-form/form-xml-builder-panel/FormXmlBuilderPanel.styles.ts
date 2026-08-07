import { getTheme, mergeStyleSets } from "@fluentui/react"

export const theme = getTheme()
export const columnWidthPresets = [25, 33, 50, 66, 75, 100]
export const sectionLabelWidthPresets = [80, 100, 115, 130, 150, 180, 220]
export const sectionColumnsPresets = [1, 2, 3, 4]
export const fieldColSpanPresets = [1, 2, 3, 4]
export const fieldRowSpanPresets = [1, 2, 3, 4, 5, 6, 8, 10]

export const styles = mergeStyleSets({
    root: {
        display: "flex",
        flexDirection: "column",
        gap: 16,
    },
    helperText: {
        color: theme.palette.neutralSecondary,
    },
    toolbar: {
        display: "flex",
        justifyContent: "flex-end",
    },
    addTabButton: {
        position: "absolute",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 28,
        height: 28,
        borderRadius: 8,
        border: `1px dashed ${theme.palette.neutralTertiaryAlt}`,
        background: "transparent",
        cursor: "pointer",
        fontSize: 16,
        color: theme.palette.neutralSecondary,
        pointerEvents: "auto",
        selectors: {
            "&:hover": {
                borderColor: theme.palette.themePrimary,
                color: theme.palette.themePrimary,
                background: "rgba(222, 236, 255, 0.18)",
            },
        },
    },
    tabButton: {
        position: "absolute",
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 10px",
        borderRadius: 8,
        border: "1px solid transparent",
        background: "transparent",
        cursor: "grab",
        pointerEvents: "auto",
        selectors: {
            "&:hover": {
                    borderColor: "transparent",
                    outline: "1px dashed rgba(96, 94, 92, 0.28)",
                    outlineOffset: -4,
                background: "rgba(96, 94, 92, 0.035)",
            },
        },
    },
    selectedTabButton: {
        borderColor: "transparent",
        outline: "1px dashed rgba(0, 90, 158, 0.72)",
        outlineOffset: -4,
        background: "rgba(222, 236, 255, 0.16)",
        selectors: {
            "&:hover": {
                borderColor: "transparent !important",
                outline: "1px dashed rgba(0, 90, 158, 0.72) !important",
                outlineOffset: "-4px !important",
                background: "rgba(222, 236, 255, 0.16)",
            },
        },
    },
    tabTransferTarget: {
        outline: "2px dashed rgba(0, 90, 158, 0.82)",
        outlineOffset: -4,
        background: "rgba(222, 236, 255, 0.16)",
    },
    tabDropIndicator: {
        position: "absolute",
        zIndex: 6,
        width: 2,
        borderRadius: 2,
        background: theme.palette.themePrimary,
        boxShadow: `0 0 0 1px ${theme.palette.white}, 0 0 8px rgba(0, 120, 212, 0.35)`,
        pointerEvents: "none",
    },
    tabDragPlaceholder: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: 44,
        padding: "0 10px",
        borderRadius: 8,
        border: "1px dashed rgba(0, 120, 212, 0.58)",
        background: "rgba(222, 236, 255, 0.12)",
        color: theme.palette.neutralSecondary,
        opacity: 0.72,
        cursor: "grabbing",
        pointerEvents: "none",
        whiteSpace: "nowrap",
    },
    canvasDragPlaceholder: {
        boxSizing: "border-box",
        border: "1px dashed rgba(0, 90, 158, 0.62)",
        borderRadius: 8,
        background: "rgba(222, 236, 255, 0.16)",
        opacity: 0.72,
        cursor: "grabbing",
        pointerEvents: "none",
    },
    canvasDropIndicator: {
        position: "absolute",
        zIndex: 30,
        height: 3,
        borderRadius: 2,
        background: "rgba(0, 90, 158, 0.82)",
        boxShadow: `0 0 0 1px ${theme.palette.white}, 0 1px 5px rgba(0, 90, 158, 0.45)`,
        pointerEvents: "none",
    },
    columnDropIndicator: {
        position: "absolute",
        zIndex: 30,
        width: 3,
        borderRadius: 2,
        background: "rgba(0, 90, 158, 0.82)",
        boxShadow: `0 0 0 1px ${theme.palette.white}, 1px 0 5px rgba(0, 90, 158, 0.45)`,
        pointerEvents: "none",
    },
    surface: {
        position: "relative",
        minHeight: 0,
        height: "100%",
        overflow: "auto",
        padding: 0,
        boxSizing: "border-box",
    },
    formWindow: {
        position: "relative",
        minHeight: 520,
        padding: 0,
        overflow: "hidden",
    },
    previewBase: {
        position: "relative",
        zIndex: 0,
        selectors: {
            ".ms-CommandBar": {
                display: "none",
            },
            "& *": {
                transition: "none !important",
            },
        },
    },
    overlayLayer: {
        position: "absolute",
        inset: 0,
        zIndex: 20,
        pointerEvents: "auto",
    },
    draggingOverlay: {
        selectors: {
            "& *": {
                cursor: "grabbing !important",
            },
        },
    },
    dragIntentOverlay: {
        selectors: {
            "body.form-builder-grabbing & *": {
                cursor: "grabbing !important",
            },
        },
    },
    columnOverlay: {
        position: "absolute",
        display: "flex",
        flexDirection: "column",
        borderRadius: 8,
        border: "1px dashed transparent",
        background: "transparent",
        pointerEvents: "auto",
        zIndex: 1,
        cursor: "grab",
        selectors: {
            "&:hover": {
                    borderColor: "transparent",
                    outline: "1px dashed rgba(96, 94, 92, 0.20)",
                    outlineOffset: -4,
            },
        },
    },
    columnFooter: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: "6px 8px",
        marginTop: "auto",
        borderRadius: "0 0 7px 7px",
        background: "rgba(0, 120, 212, 0.04)",
        border: `1px dashed ${theme.palette.neutralTertiaryAlt}`,
        borderTop: "none",
        color: theme.palette.neutralTertiary,
        fontSize: theme.fonts.small.fontSize,
        cursor: "default",
        pointerEvents: "auto",
        minHeight: 32,
        selectors: {
            "&:hover": {
                background: "rgba(0, 120, 212, 0.08)",
                color: theme.palette.neutralSecondary,
            },
        },
    },
    emptyColumnOverlay: {
        border: "1px dashed rgba(96, 94, 92, 0.22)",
        background: "rgba(96, 94, 92, 0.025)",
    },
    emptyColumnFooter: {
        marginTop: 0,
        minHeight: 48,
        borderTop: `1px dashed ${theme.palette.neutralTertiaryAlt}`,
        borderRadius: 7,
        background: "rgba(96, 94, 92, 0.035)",
        color: theme.palette.neutralSecondary,
    },
    columnResizeHandle: {
        position: "absolute",
        top: 0,
        right: -4,
        width: 8,
        height: "100%",
        cursor: "col-resize",
        pointerEvents: "auto",
        zIndex: 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        selectors: {
            "&::after": {
                content: '""',
                display: "block",
                width: 3,
                height: 24,
                borderRadius: 2,
                background: theme.palette.neutralTertiaryAlt,
                transition: "background 120ms ease-out, height 120ms ease-out",
            },
            "&:hover::after": {
                background: theme.palette.themePrimary,
                height: 36,
            },
        },
    },
    selectedOverlay: {
        outline: "1px dashed rgba(0, 90, 158, 0.72)",
        outlineOffset: -4,
        background: "rgba(222, 236, 255, 0.14)",
        selectors: {
            "&:hover": {
                outline: "1px dashed rgba(0, 90, 158, 0.72) !important",
                outlineOffset: "-4px !important",
                background: "rgba(222, 236, 255, 0.14)",
            },
        },
    },
    columnMeta: {
        color: theme.palette.neutralSecondary,
    },
    sectionWrapper: {
        position: "absolute",
        borderRadius: 8,
        pointerEvents: "auto",
        zIndex: 2,
        cursor: "grab",
        selectors: {
            "&:hover .form-builder-section-outline": {
                borderColor: "transparent",
                outline: "1px dashed rgba(96, 94, 92, 0.24)",
                outlineOffset: -4,
                background: "rgba(255, 255, 255, 0.06)",
            },
        },
    },
    sectionOverlay: {
        position: "absolute",
        inset: 0,
        borderRadius: 8,
        border: "1px solid transparent",
        background: "transparent",
        pointerEvents: "auto",
    },
    fieldOverlay: {
        position: "absolute",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        borderRadius: 6,
        border: "1px solid transparent",
        background: "transparent",
        margin: -4,
        padding: 4,
        color: theme.palette.neutralSecondary,
        cursor: "grab",
        pointerEvents: "auto",
        zIndex: 3,
        selectors: {
            "&:hover": {
                borderColor: "transparent",
                outline: "1px dashed rgba(96, 94, 92, 0.22)",
                outlineOffset: -4,
                background: "rgba(255, 255, 255, 0.06)",
            },
        },
    },
    fieldMeta: {
        color: theme.palette.neutralTertiary,
    },
    emptyState: {
        padding: 16,
        borderRadius: 8,
        border: `1px dashed ${theme.palette.neutralQuaternaryAlt}`,
        color: theme.palette.neutralSecondary,
        textAlign: "center",
    },
    activeDropTarget: {
        boxShadow: `inset 0 0 0 1px ${theme.palette.themePrimary}`,
        background: "rgba(222, 236, 255, 0.28)",
    },
})
