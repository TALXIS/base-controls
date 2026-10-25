import type { GanttStatic, Link } from "gantt-trial";
import { ILocalizationService, LocalizationService } from "@utils";
import type { IDependencies, TaskDependencyType } from "../../../dependencies";
import { runQuietly } from "../../../../runtime/runQuietly";
import type { IGantt } from "../../interfaces";
import { GANTT_LINKS_LABELS, IGanttLinksLabels } from "./labels";
import { getGanttLinksStyles } from "./styles";

export interface IGanttLinksParameters {
    labels?: Partial<IGanttLinksLabels>;
}

/** The `links` module: the `dependencies` module's dependencies drawn between the bars. */
export interface IGanttLinks {
    /** Whether links can be drawn and deleted on the chart. */
    isEditable(): boolean;
    /** Called as the Gantt goes. */
    destroy(): void;
}

const LINK_TYPES: Record<TaskDependencyType, string> = {
    finishToStart: '0',
    startToStart: '1',
    finishToFinish: '2',
    startToFinish: '3',
};

export class GanttLinks implements IGanttLinks {
    private _gantt: IGantt;
    private _dependencies?: IDependencies;
    private _labels: ILocalizationService<IGanttLinksLabels>;
    private _isSyncing = false;
    private _unregisters: (() => void)[] = [];

    constructor(gantt: IGantt, parameters: IGanttLinksParameters) {
        this._gantt = gantt;
        this._labels = new LocalizationService<IGanttLinksLabels>({ ...GANTT_LINKS_LABELS, ...parameters.labels });
        this._dependencies = gantt.getTaskRuntime().services.get('datasetControl').modules.find('dependencies');
        if (!this._dependencies) {
            return;
        }
        const dependencies = this._dependencies;
        this._unregisters.push(
            gantt.registerChartConfig(this._configureChart),
            gantt.services.get('theme').registerStyles((result, theme) => result.styles.push(getGanttLinksStyles(theme))),
        );
        gantt.services.whenAvailable('chart', this._onChartReady);
        gantt.events.addEventListener('onTasksParsed', this._syncLinks);
        dependencies.events.addEventListener('onDependenciesChanged', this._syncLinks);
        this._unregisters.push(
            () => gantt.events.removeEventListener('onTasksParsed', this._syncLinks),
            () => dependencies.events.removeEventListener('onDependenciesChanged', this._syncLinks),
        );
    }

    public isEditable(): boolean {
        return !!this._dependencies?.isEditable() && this._gantt.getTaskRuntime().isEditingEnabled();
    }

    public destroy(): void {
        this._unregisters.forEach(unregister => unregister());
    }

    private _configureChart = (chart: GanttStatic): void => {
        chart.config.show_links = true;
        chart.config.drag_links = this.isEditable();
    };

    private _onChartReady = (chart: GanttStatic): void => {
        chart.attachEvent('onBeforeLinkAdd', this._onBeforeLinkAdd);
        chart.attachEvent('onLinkDblClick', this._onLinkDblClick);
    };

    //drawn from the dependencies every time, so the chart never holds a link they do not
    private _syncLinks = (): void => {
        const chart = this._gantt.services.find('chart');
        if (!chart || !this._dependencies) {
            return;
        }
        this._isSyncing = true;
        try {
            chart.batchUpdate(() => {
                for (const link of chart.getLinks()) {
                    chart.deleteLink(link.id);
                }
                for (const dependency of this._dependencies!.getDependencies()) {
                    if (chart.isTaskExists(dependency.predecessorTaskId) && chart.isTaskExists(dependency.successorTaskId)) {
                        chart.addLink({ id: dependency.id, source: dependency.predecessorTaskId, target: dependency.successorTaskId, type: LINK_TYPES[dependency.type] });
                    }
                }
            });
        }
        finally {
            this._isSyncing = false;
        }
    };

    //the chart's own change is refused; the dependency, once saved, draws the link
    private _onBeforeLinkAdd = (_id: string | number, link: Link): boolean => {
        if (this._isSyncing) {
            return true;
        }
        const type = (Object.keys(LINK_TYPES) as TaskDependencyType[]).find(key => LINK_TYPES[key] === String(link.type)) ?? 'finishToStart';
        runQuietly(async () => {
            await this._dependencies?.createDependency({ predecessorTaskId: String(link.source), successorTaskId: String(link.target), type });
        });
        return false;
    };

    private _onLinkDblClick = (id: string | number): boolean => {
        if (this.isEditable()) {
            runQuietly(() => this._deleteLink(String(id)));
        }
        return false;
    };

    private async _deleteLink(dependencyId: string): Promise<void> {
        const navigation = this._gantt.getTaskRuntime().services.get('pcfContext').navigation;
        const confirmation = await navigation.openConfirmDialog({ text: this._labels.getLocalizedString('confirmDeleteLink') });
        if (confirmation.confirmed) {
            await this._dependencies?.deleteDependency(dependencyId);
        }
    }
}

declare module "../../interfaces" {
    interface IGanttModuleMap {
        /** The dependencies drawn between the bars. */
        links: IGanttLinks;
    }
}
