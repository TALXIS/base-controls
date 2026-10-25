import { createElement } from "react";
import { ILocalizationService, LocalizationService } from "@utils";
import type { IGantt, IGanttLayer } from "../../interfaces";
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
    private _unregisterLayers: () => void;

    constructor(gantt: IGantt, parameters: IGanttTooltipParameters) {
        this._parameters = parameters;
        this._labels = new LocalizationService<IGanttTooltipLabels>({ ...GANTT_TOOLTIP_LABELS, ...parameters.labels });
        this._unregisterLayers = gantt.registerLayers(this._addLayers);
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
        this._unregisterLayers();
    }

    private _addLayers = (layers: IGanttLayer[]): void => {
        layers.push({ key: 'tooltip', onRender: () => this.render() });
    };
}

declare module "../../interfaces" {
    interface IGanttModuleMap {
        /** What a bar says when the pointer is on it. */
        tooltip: IGanttTooltip;
    }
}
