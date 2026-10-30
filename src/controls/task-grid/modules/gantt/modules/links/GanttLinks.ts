import { createElement } from "react";
import type { GanttStatic, Link } from "dhtmlx-gantt";
import type { LabelsOf } from "@utils";
import type { IDependencies, TaskDependencyType } from "../../../dependencies";
import { runQuietly } from "../../../../runtime/runQuietly";
import type { IGantt } from "../../interfaces";
import type { IGanttSurface } from "../../surfaces";
import { LinkTooltipRenderer } from "./components";
import { GANTT_LINKS_LABELS } from "./labels";
import { GANTT_LINK_DRAG_POINTER_VARIABLES, GANTT_LINK_DRAG_TYPE_CLASS, GANTT_LINK_DROP_ATTRIBUTE, getGanttLinksStyles } from "./styles";

export interface IGanttLinksParameters {
    components?: IGanttLinksComponents;
}

/** The replaceable pieces of the links. */
export interface IGanttLinksComponents {
    /** What a dependency line says when the pointer is on it, composed from `LinkTooltip`'s parts. */
    onRenderTooltip?: () => JSX.Element | null;
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

interface ILinkDrop {
    targetId: string;
    isToStart: boolean;
}

//between the pointer and the tooltip of a link being drawn
const GANTT_LINK_DRAG_OFFSET = 14;

const getDependencyType = (isFromStart: boolean, isToStart: boolean): TaskDependencyType => {
    return isFromStart ? (isToStart ? 'startToStart' : 'startToFinish') : (isToStart ? 'finishToStart' : 'finishToFinish');
};

const isSameLink = (left: Link | undefined, right: Link | undefined): boolean => {
    return !!left && !!right && String(left.source) === String(right.source) && String(left.target) === String(right.target) && String(left.type) === String(right.type);
};

export class GanttLinks implements IGanttLinks {
    private _gantt: IGantt;
    private _parameters: IGanttLinksParameters;
    private _dependencies?: IDependencies;
    private _labels: LabelsOf<typeof GANTT_LINKS_LABELS>;
    private _isSyncing = false;
    //the end of the task under the pointer that a link being drawn would attach to
    private _linkDrop?: ILinkDrop;
    private _unregisters: (() => void)[] = [];

    constructor(gantt: IGantt, parameters: IGanttLinksParameters) {
        this._gantt = gantt;
        this._parameters = parameters;
        this._labels = gantt.getLabels(GANTT_LINKS_LABELS);
        this._dependencies = gantt.getTaskRuntime().services.get('datasetControl').modules.find('dependencies');
        if (!this._dependencies) {
            return;
        }
        const dependencies = this._dependencies;
        this._unregisters.push(
            gantt.registerChartConfig(this._configureChart),
            gantt.services.get('theme').registerStyles((result, theme) => result.styles.push(getGanttLinksStyles(theme))),
            gantt.surfaces.registerSurface(this._onSurfaces),
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
        chart.templates.drag_link = sourceId => this._getDragLinkHtml(chart, String(sourceId));
        chart.templates.drag_link_class = sourceId => this._getDragLinkClass(chart, String(sourceId));
    };

    //what is being linked, while the pointer draws the link
    private _getDragLinkHtml(chart: GanttStatic, sourceId: string): string {
        const describe = (taskId: string, isStart: boolean) => `<b>${escapeHtml(chart.getTask(taskId).text)}</b>${escapeHtml(this._labels.get(isStart ? 'ganttLinks.linkStart' : 'ganttLinks.linkEnd'))}`;
        const isFromStart = !!chart.getState().link_from_start;
        const drop = this._linkDrop;
        if (!drop || !chart.isTaskExists(drop.targetId)) {
            return describe(sourceId, isFromStart);
        }
        const type = getDependencyType(isFromStart, drop.isToStart);
        return `<div class="${GANTT_LINK_DRAG_TYPE_CLASS}">${escapeHtml(this._labels.get(`ganttLinks.${type}`))}</div>${describe(sourceId, isFromStart)} → ${describe(drop.targetId, drop.isToStart)}`;
    }

    private _getDragLinkClass(chart: GanttStatic, sourceId: string): string {
        const drop = this._linkDrop;
        return drop && !this._isLinkAllowed(chart, sourceId, drop) ? 'gantt_link_tooltip gantt_link_deny' : 'gantt_link_tooltip';
    }

    private _onSurfaces = (surfaces: IGanttSurface[]): void => {
        const onRenderTooltip = this._parameters.components?.onRenderTooltip;
        surfaces.push({ key: 'linkTooltip', onRender: () => onRenderTooltip ? onRenderTooltip() : createElement(LinkTooltipRenderer) });
    };

    private _onChartReady = (chart: GanttStatic): void => {
        //the chart hides links to tasks outside the rendered range
        const isTaskVisible = chart.isTaskVisible.bind(chart);
        chart.isTaskVisible = (taskId: string | number) => isTaskVisible(taskId) || (chart.isTaskExists(taskId) && chart.getGlobalTaskIndex(taskId) >= 0);
        chart.attachEvent('onBeforeLinkAdd', this._onBeforeLinkAdd);
        const document = chart.$root.ownerDocument;
        //captured, so the drop is known before the library redraws its tooltip for the same move
        document.addEventListener('mousemove', this._onPointerMove, { capture: true, passive: true });
        this._unregisters.push(() => document.removeEventListener('mousemove', this._onPointerMove, { capture: true }));
        chart.attachEvent('onLinkDblClick', this._onLinkDblClick);
    };

    private _onPointerMove = (event: MouseEvent): void => {
        const chart = this._gantt.services.find('chart');
        const sourceId = chart?.getState().link_source_id;
        if (!chart || !sourceId) {
            this._linkDrop = undefined;
            return;
        }
        const document = event.currentTarget as Document;
        const drop = this._getLinkDrop(chart, event, String(sourceId));
        const tooltip = document.querySelector('.gantt_drag_marker .gantt_link_tooltip');
        if (drop?.targetId !== this._linkDrop?.targetId || drop?.isToStart !== this._linkDrop?.isToStart) {
            this._linkDrop = drop;
            if (tooltip) {
                tooltip.innerHTML = this._getDragLinkHtml(chart, String(sourceId));
                tooltip.className = this._getDragLinkClass(chart, String(sourceId));
            }
        }
        //kept inside the page, which the library does only for where it thinks the tooltip is
        const width = tooltip?.getBoundingClientRect().width ?? 0;
        const right = document.documentElement.clientWidth - GANTT_LINK_DRAG_OFFSET;
        document.documentElement.style.setProperty(GANTT_LINK_DRAG_POINTER_VARIABLES.x, `${Math.max(0, Math.min(event.clientX + GANTT_LINK_DRAG_OFFSET, right - width))}px`);
        document.documentElement.style.setProperty(GANTT_LINK_DRAG_POINTER_VARIABLES.y, `${event.clientY + GANTT_LINK_DRAG_OFFSET + 4}px`);
        //after the library redraws the bars this move changes
        requestAnimationFrame(() => this._markLinkDrop(chart));
    };

    //anywhere on a task lands, on the end nearer the pointer unless it is on one of the task's handles
    private _getLinkDrop(chart: GanttStatic, event: MouseEvent, sourceId: string): ILinkDrop | undefined {
        const targetId = chart.locate(event);
        const bar = targetId !== null && targetId !== undefined ? chart.getTaskNode(targetId) : null;
        if (!bar || String(targetId) === sourceId) {
            return undefined;
        }
        const handle = (event.target as HTMLElement | null)?.closest('.gantt_link_control');
        const rect = bar.getBoundingClientRect();
        return { targetId: String(targetId), isToStart: handle ? handle.classList.contains('task_start_date') : event.clientX < rect.left + rect.width / 2 };
    }

    private _markLinkDrop(chart: GanttStatic): void {
        const document = chart.$root.ownerDocument;
        document.querySelectorAll(`[${GANTT_LINK_DROP_ATTRIBUTE}]`).forEach(element => element.removeAttribute(GANTT_LINK_DROP_ATTRIBUTE));
        const drop = this._linkDrop;
        const sourceId = chart.getState().link_source_id;
        const bar = drop && sourceId ? chart.getTaskNode(drop.targetId) : null;
        if (drop && bar && sourceId) {
            const isAllowed = this._isLinkAllowed(chart, String(sourceId), drop);
            bar.setAttribute(GANTT_LINK_DROP_ATTRIBUTE, `${drop.isToStart ? 'start' : 'end'}${isAllowed ? '' : '-denied'}`);
        }
    }

    private _isLinkAllowed(chart: GanttStatic, sourceId: string, drop: ILinkDrop): boolean {
        const type = getDependencyType(!!chart.getState().link_from_start, drop.isToStart);
        return chart.isLinkAllowed({ source: sourceId, target: drop.targetId, type: LINK_TYPES[type] });
    }

    //drawn from the dependencies every time, so the chart never holds a link they do not
    private _syncLinks = (): void => {
        const chart = this._gantt.services.find('chart');
        if (!chart || !this._dependencies) {
            return;
        }
        const wanted = new Map<string, Link>();
        for (const dependency of this._dependencies.getDependencies()) {
            if (chart.isTaskExists(dependency.predecessorTaskId) && chart.isTaskExists(dependency.successorTaskId)) {
                wanted.set(dependency.id, { id: dependency.id, source: dependency.predecessorTaskId, target: dependency.successorTaskId, type: LINK_TYPES[dependency.type] });
            }
        }
        const current = new Map(chart.getLinks().map(link => [String(link.id), link]));
        const stale = [...current.values()].filter(link => !isSameLink(link, wanted.get(String(link.id))));
        const missing = [...wanted.values()].filter(link => !isSameLink(current.get(String(link.id)), link));
        this._isSyncing = true;
        try {
            chart.batchUpdate(() => stale.forEach(link => chart.deleteLink(link.id)));
            //one parse, as each added link makes the chart recheck every task
            if (missing.length > 0) {
                chart.parse({ data: [], links: missing });
            }
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
        const drawnType = (Object.keys(LINK_TYPES) as TaskDependencyType[]).find(key => LINK_TYPES[key] === String(link.type)) ?? 'finishToStart';
        //the library lands anything off a handle on the start; the drop knows the end the pointer was nearer
        const drop = this._linkDrop;
        const type = drop?.targetId === String(link.target) ? getDependencyType(drawnType.startsWith('start'), drop.isToStart) : drawnType;
        this._linkDrop = undefined;
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
        const confirmation = await navigation.openConfirmDialog({ text: this._labels.get('ganttLinks.confirmDeleteLink') });
        if (confirmation.confirmed) {
            await this._dependencies?.deleteDependency(dependencyId);
        }
    }
}

const escapeHtml = (value: string): string => value.replace(/[&<>"']/g, character => `&#${character.charCodeAt(0)};`);

declare module "../../interfaces" {
    interface IGanttModuleMap {
        /** The dependencies drawn between the bars. */
        links: IGanttLinks;
    }
}
