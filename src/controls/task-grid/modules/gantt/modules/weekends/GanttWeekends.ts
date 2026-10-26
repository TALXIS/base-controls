import { EventEmitter, IEventEmitter } from "@talxis/client-libraries";
import { ILocalizationService, LocalizationService } from "@utils";
import type { ITaskGridSetting } from "../../../../dataset-control/settings";
import type { IGantt } from "../../interfaces";
import { isWeekend } from "../../dates/isWeekend";
import { isDayScaleVisible } from "../../zooming/zoomScales";
import { GANTT_WEEKENDS_LABELS, IGanttWeekendsLabels } from "./labels";

const SHOW_WEEKENDS_STATE_KEY = 'showWeekends';

export interface IGanttWeekendsParameters {
    /** Whether weekends are on the scale until the user hides them. Defaults to `true`. */
    isVisibleByDefault?: boolean;
    labels?: Partial<IGanttWeekendsLabels>;
}

export interface IGanttWeekendsEvents {
    onVisibilityChanged: (isVisible: boolean) => void;
}

/** The `weekends` module: hides weekends from the scale, toggled in `TaskDatasetControl.Settings`. */
export interface IGanttWeekends {
    readonly events: IEventEmitter<IGanttWeekendsEvents>;
    isVisible(): boolean;
    setVisible(isVisible: boolean): void;
    /** Called as the Gantt goes. */
    destroy(): void;
}

export class GanttWeekends implements IGanttWeekends {
    public readonly events = new EventEmitter<IGanttWeekendsEvents>();
    private _gantt: IGantt;
    private _isVisibleByDefault: boolean;
    private _labels: ILocalizationService<IGanttWeekendsLabels>;
    private _unregisters: (() => void)[] = [];

    constructor(gantt: IGantt, parameters: IGanttWeekendsParameters) {
        //a PRO feature of the chart: https://docs.dhtmlx.com/gantt/guides/custom-scale/
        if (!gantt.getLibrary().isPro) {
            throw new Error('The weekends module needs the PRO build of DHTMLX Gantt: pass createGanttProLibraryModule(Gantt).');
        }
        this._gantt = gantt;
        this._isVisibleByDefault = parameters.isVisibleByDefault ?? true;
        this._labels = new LocalizationService<IGanttWeekendsLabels>({ ...GANTT_WEEKENDS_LABELS, ...parameters.labels });
        this._unregisters.push(gantt.registerChartConfig(chart => {
            chart.ignore_time = (date: Date) => !this.isVisible() && isWeekend(date) && isDayScaleVisible(chart);
        }));
        gantt.getTaskRuntime().services.get('datasetControl').modules.whenAvailable('userQueries', userQueries => {
            this._unregisters.push(userQueries.saveWithView('ganttShowWeekends', () => this.isVisible()));
        });
        gantt.getTaskRuntime().services.get('datasetControl').parts.whenAvailable('taskSettings', settings => {
            this._unregisters.push(settings.registerSettings(this._addSettings));
        });
    }

    public isVisible(): boolean {
        const state = this._gantt.services.get('state').get<boolean>(SHOW_WEEKENDS_STATE_KEY);
        return state ?? this._gantt.getTaskRuntime().getView()?.data?.ganttShowWeekends ?? this._isVisibleByDefault;
    }

    public setVisible(isVisible: boolean): void {
        this._gantt.services.get('state').set(SHOW_WEEKENDS_STATE_KEY, isVisible);
        this._gantt.render();
        this.events.dispatchEvent('onVisibilityChanged', isVisible);
    }

    public destroy(): void {
        this._unregisters.forEach(unregister => unregister());
    }

    private _addSettings = (settings: ITaskGridSetting[]): void => {
        settings.push({
            key: 'hideWeekends',
            label: this._labels.getLocalizedString('hideWeekends'),
            isChecked: !this.isVisible(),
            onChange: isChecked => this.setVisible(!isChecked),
        });
    };
}

declare module "../../interfaces" {
    interface IGanttModuleMap {
        /** Hiding weekends from the scale. */
        weekends: IGanttWeekends;
    }
}

declare module "@controls/dataset-control/modules/user-queries/interfaces" {
    interface IUserQuerySavedValueMap {
        /** Whether weekends are on the Gantt's scale. */
        ganttShowWeekends: boolean;
    }
}
