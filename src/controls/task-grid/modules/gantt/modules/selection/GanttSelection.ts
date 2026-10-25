import { createElement } from "react";
import type { IGantt } from "../../interfaces";
import type { IGanttSurface } from "../../surfaces";
import { SelectionBoxLayer } from "./components/adapters/selection-box-layer";

/** The `selectionBox` module: Shift+drag selects the bars under a band. */
export interface IGanttSelectionBox {
    /** Called as the Gantt goes. */
    destroy(): void;
}

export class GanttSelectionBox implements IGanttSelectionBox {
    private _unregisterSurface: () => void;

    constructor(gantt: IGantt) {
        this._unregisterSurface = gantt.surfaces.registerSurface(this._onSurfaces);
    }

    public destroy(): void {
        this._unregisterSurface();
    }

    private _onSurfaces = (surfaces: IGanttSurface[]): void => {
        surfaces.push({ key: 'selectionBox', onRender: () => createElement(SelectionBoxLayer) });
    };
}

declare module "../../interfaces" {
    interface IGanttModuleMap {
        /** Selecting bars under a band. */
        selectionBox: IGanttSelectionBox;
    }
}
