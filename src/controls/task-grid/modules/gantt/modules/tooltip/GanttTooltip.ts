import { createElement } from "react";
import { ILocalizationService, LocalizationService } from "@utils";
import type { IGantt } from "../../interfaces";
import type { IGanttSurface } from "../../surfaces";
import { GANTT_TOOLTIP_LABELS, IGanttTooltipLabels } from "./labels";
import { TaskTooltipRenderer } from "./components/adapters/renderer";

export interface IGanttTooltipParameters {
    /** The whole tooltip, composed from `TaskTooltip`'s parts. */
    onRender?: () => JSX.Element | null;
    /** An option set column the header shows as a pill in its option's colour. */
    statusColumnName?: string;
    labels?: Partial<IGanttTooltipLabels>;
}

/** The `tooltip` module: what a bar says when the pointer is on it. */
export interface IGanttTooltip {
    getLabels(): ILocalizationService<IGanttTooltipLabels>;
    getStatusColumnName(): string | undefined;
    render(): JSX.Element | null;
    /** Called as the Gantt goes. */
    destroy(): void;
}

export class GanttTooltip implements IGanttTooltip {
    private _parameters: IGanttTooltipParameters;
    private _labels: ILocalizationService<IGanttTooltipLabels>;
    private _unregisterSurface: () => void;

    constructor(gantt: IGantt, parameters: IGanttTooltipParameters) {
        this._parameters = parameters;
        this._labels = new LocalizationService<IGanttTooltipLabels>({ ...GANTT_TOOLTIP_LABELS, ...parameters.labels });
        this._unregisterSurface = gantt.surfaces.registerSurface(this._onSurfaces);
    }

    public getLabels(): ILocalizationService<IGanttTooltipLabels> {
        return this._labels;
    }

    public getStatusColumnName(): string | undefined {
        return this._parameters.statusColumnName;
    }

    public render(): JSX.Element | null {
        return this._parameters.onRender ? this._parameters.onRender() : createElement(TaskTooltipRenderer);
    }

    public destroy(): void {
        this._unregisterSurface();
    }

    private _onSurfaces = (surfaces: IGanttSurface[]): void => {
        surfaces.push({ key: 'tooltip', onRender: () => this.render() });
    };
}

declare module "../../interfaces" {
    interface IGanttModuleMap {
        /** What a bar says when the pointer is on it. */
        tooltip: IGanttTooltip;
    }
}
