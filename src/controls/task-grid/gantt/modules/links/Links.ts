import { createElement } from "react";
import type { GanttStatic, Link } from "dhtmlx-gantt";
import type { LabelsOf } from "@labels";
import type { IDependencies, TaskDependencyType } from "../../../modules/dependencies";
import { extendTaskVisibility, GANTT_DRAG_MARKER_CLASS, GANTT_LINK_CONTROL_CLASS, GANTT_LINK_CONTROL_START_CLASS, GANTT_LINK_TOOLTIP_CLASS } from "../../chart";
import { runQuietly } from "../../../runtime/runQuietly";
import type { IGantt } from "../../interfaces";
import type { IGanttSurface } from "../../surfaces";
import { ILinkTooltipRendererComponents } from "./adapters/renderer/components";
import { LinkTooltipRenderer } from "./adapters/renderer/LinkTooltipRenderer";
import { LINKS_LABELS } from "./labels";
import { LINK_DRAG_POINTER_VARIABLES, LINK_DROP_ATTRIBUTE, LINK_SAVING_CLASS } from "./classNames";
import { getDragLinkTooltipClass, getDragLinkTooltipHtml, IDragLinkTooltipEnd } from "./dragTooltip";
import { getLinksStyles } from "./styles";

export interface ILinksParameters {
    components?: ILinksComponents;
    /** A dependency line's tooltip, composed from `LinkTooltip`'s parts. */
    onRenderTooltip?: () => JSX.Element | null;
}

/** The replaceable pieces of the links, by the part they belong to. */
export interface ILinksComponents {
    /** The default dependency tooltip's pieces, unused with `onRenderTooltip`. */
    tooltip?: ILinkTooltipRendererComponents;
}

/** The `links` module: the `dependencies` module's dependencies drawn between the bars. */
export interface ILinks {
    /** Whether links can be drawn and deleted on the chart. */
    isEditable(): boolean;
    getComponents(): ILinksComponents;
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
const LINK_DRAG_OFFSET = 14;

const getDependencyType = (isFromStart: boolean, isToStart: boolean): TaskDependencyType => {
    return isFromStart ? (isToStart ? 'startToStart' : 'startToFinish') : (isToStart ? 'finishToStart' : 'finishToFinish');
};

const isSameLink = (left: Link | undefined, right: Link | undefined): boolean => {
    return !!left && !!right && String(left.source) === String(right.source) && String(left.target) === String(right.target) && String(left.type) === String(right.type);
};

export class Links implements ILinks {
    private _gantt: IGantt;
    private _parameters: ILinksParameters;
    private _dependencies?: IDependencies;
    private _isSyncing = false;
    //the end of the task under the pointer that a link being drawn would attach to
    private _linkDrop?: ILinkDrop;
    private _markLinkDropFrame?: number;
    private _offDependenciesChanged?: () => void;

    constructor(gantt: IGantt, parameters: ILinksParameters) {
        this._gantt = gantt;
        this._parameters = parameters;
        this._dependencies = gantt.getTaskRuntime().services.get('datasetControl').modules.find('dependencies');
        if (!this._dependencies) {
            return;
        }
        gantt.hooks.chartConfig.add(this._configureChart);
        gantt.services.get('theme').hooks.styles.add((result, theme) => result.styles.push(getLinksStyles(theme)));
        gantt.surfaces.hooks.surfaces.add(this._onSurfaces);
        gantt.events.addEventListener('onTasksParsed', this._syncLinks);
        this._offDependenciesChanged = this._dependencies.events.addEventListener('onDependenciesChanged', this._syncLinks);
        gantt.services.observe('chart', this._onChartReady);
    }

    private get _labels(): LabelsOf<typeof LINKS_LABELS> {
        return this._gantt.getLabels(LINKS_LABELS);
    }

    public isEditable(): boolean {
        return !!this._dependencies?.isEditable() && this._gantt.getTaskRuntime().isEditingEnabled();
    }

    public getComponents(): ILinksComponents {
        return this._parameters.components ?? {};
    }

    public destroy(): void {
        this._offDependenciesChanged?.();
    }

    private _configureChart = (chart: GanttStatic): void => {
        chart.config.show_links = true;
        chart.config.drag_links = this.isEditable();
        chart.templates.drag_link = sourceId => this._getDragLinkHtml(chart, String(sourceId));
        chart.templates.drag_link_class = sourceId => this._getDragLinkClass(chart, String(sourceId));
        chart.templates.link_class = link => this._isLinkSaving(link) ? LINK_SAVING_CLASS : '';
    };

    //what is being linked, while the pointer draws the link
    private _getDragLinkHtml(chart: GanttStatic, sourceId: string): string {
        const isFromStart = !!chart.getState().link_from_start;
        const source = this._getDragLinkEnd(chart, sourceId, isFromStart);
        const drop = this._linkDrop;
        if (!drop || !chart.isTaskExists(drop.targetId)) {
            return getDragLinkTooltipHtml(source);
        }
        const type = this._labels.get(`links.${getDependencyType(isFromStart, drop.isToStart)}`);
        return getDragLinkTooltipHtml(source, { type, target: this._getDragLinkEnd(chart, drop.targetId, drop.isToStart) });
    }

    private _getDragLinkEnd(chart: GanttStatic, taskId: string, isStart: boolean): IDragLinkTooltipEnd {
        return { text: chart.getTask(taskId).text, edge: this._labels.get(isStart ? 'links.linkStart' : 'links.linkEnd') };
    }

    private _getDragLinkClass(chart: GanttStatic, sourceId: string): string {
        const drop = this._linkDrop;
        return getDragLinkTooltipClass(!!drop && !this._isLinkAllowed(chart, sourceId, drop));
    }

    private _onSurfaces = (surfaces: IGanttSurface[]): void => {
        const onRenderTooltip = this._parameters.onRenderTooltip;
        surfaces.push({ key: 'linkTooltip', onRender: () => onRenderTooltip ? onRenderTooltip() : createElement(LinkTooltipRenderer, { components: this.getComponents().tooltip }) });
    };

    private _onChartReady = (chart: GanttStatic): (() => void) => {
        //the chart hides links to tasks outside the rendered range
        extendTaskVisibility(chart, taskId => chart.isTaskExists(taskId) && chart.getGlobalTaskIndex(taskId) >= 0);
        chart.attachEvent('onBeforeLinkAdd', this._onBeforeLinkAdd);
        chart.attachEvent('onLinkDblClick', this._onLinkDblClick);
        const document = chart.$root.ownerDocument;
        //captured so the drop is known before the library redraws its tooltip
        document.addEventListener('mousemove', this._onPointerMove, { capture: true, passive: true });
        return () => {
            document.removeEventListener('mousemove', this._onPointerMove, { capture: true });
            this._cancelMarkLinkDrop();
            document.documentElement.style.removeProperty(LINK_DRAG_POINTER_VARIABLES.x);
            document.documentElement.style.removeProperty(LINK_DRAG_POINTER_VARIABLES.y);
        };
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
        const tooltip = document.querySelector(`.${GANTT_DRAG_MARKER_CLASS} .${GANTT_LINK_TOOLTIP_CLASS}`);
        if (drop?.targetId !== this._linkDrop?.targetId || drop?.isToStart !== this._linkDrop?.isToStart) {
            this._linkDrop = drop;
            if (tooltip) {
                tooltip.innerHTML = this._getDragLinkHtml(chart, String(sourceId));
                tooltip.className = this._getDragLinkClass(chart, String(sourceId));
            }
        }
        //clamped to the page here since the library clamps a wrong position
        const width = tooltip?.getBoundingClientRect().width ?? 0;
        const right = document.documentElement.clientWidth - LINK_DRAG_OFFSET;
        document.documentElement.style.setProperty(LINK_DRAG_POINTER_VARIABLES.x, `${Math.max(0, Math.min(event.clientX + LINK_DRAG_OFFSET, right - width))}px`);
        document.documentElement.style.setProperty(LINK_DRAG_POINTER_VARIABLES.y, `${event.clientY + LINK_DRAG_OFFSET + 4}px`);
        //after the library redraws the bars this move changes
        this._cancelMarkLinkDrop();
        this._markLinkDropFrame = requestAnimationFrame(() => this._markLinkDrop(chart));
    };

    private _cancelMarkLinkDrop(): void {
        if (this._markLinkDropFrame !== undefined) {
            cancelAnimationFrame(this._markLinkDropFrame);
            this._markLinkDropFrame = undefined;
        }
    }

    //lands on the end nearer the pointer unless the pointer is on a handle
    private _getLinkDrop(chart: GanttStatic, event: MouseEvent, sourceId: string): ILinkDrop | undefined {
        const targetId = chart.locate(event);
        const bar = targetId !== null && targetId !== undefined ? chart.getTaskNode(targetId) : null;
        if (!bar || String(targetId) === sourceId) {
            return undefined;
        }
        const handle = (event.target as HTMLElement | null)?.closest(`.${GANTT_LINK_CONTROL_CLASS}`);
        const rect = bar.getBoundingClientRect();
        return { targetId: String(targetId), isToStart: handle ? handle.classList.contains(GANTT_LINK_CONTROL_START_CLASS) : event.clientX < rect.left + rect.width / 2 };
    }

    private _markLinkDrop(chart: GanttStatic): void {
        const document = chart.$root.ownerDocument;
        document.querySelectorAll(`[${LINK_DROP_ATTRIBUTE}]`).forEach(element => element.removeAttribute(LINK_DROP_ATTRIBUTE));
        const drop = this._linkDrop;
        const sourceId = chart.getState().link_source_id;
        const bar = drop && sourceId ? chart.getTaskNode(drop.targetId) : null;
        if (drop && bar && sourceId) {
            const isAllowed = this._isLinkAllowed(chart, String(sourceId), drop);
            bar.setAttribute(LINK_DROP_ATTRIBUTE, `${drop.isToStart ? 'start' : 'end'}${isAllowed ? '' : '-denied'}`);
        }
    }

    private _isLinkSaving(link: Link): boolean {
        return !!this._dependencies?.isDependencySaving({ predecessorTaskId: String(link.source), successorTaskId: String(link.target) });
    }

    //a task in a chain being saved stays as it is, links included
    private _isLinkAllowed(chart: GanttStatic, sourceId: string, drop: ILinkDrop): boolean {
        if (this._dependencies?.isDependencySaving({ predecessorTaskId: sourceId, successorTaskId: drop.targetId })) {
            return false;
        }
        const type = getDependencyType(!!chart.getState().link_from_start, drop.isToStart);
        return chart.isLinkAllowed({ source: sourceId, target: drop.targetId, type: LINK_TYPES[type] });
    }

    //drawn from the dependencies every time so the chart holds no link they lack
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
            //one parse since each added link makes the chart recheck every task
            if (missing.length > 0) {
                chart.parse({ data: [], links: missing });
            }
        }
        finally {
            this._isSyncing = false;
        }
    };

    //refused so the saved dependency draws the link
    private _onBeforeLinkAdd = (_id: string | number, link: Link): boolean => {
        if (this._isSyncing) {
            return true;
        }
        const drawnType = (Object.keys(LINK_TYPES) as TaskDependencyType[]).find(key => LINK_TYPES[key] === String(link.type)) ?? 'finishToStart';
        //the drop holds the end the pointer was nearer
        const drop = this._linkDrop;
        const type = drop?.targetId === String(link.target) ? getDependencyType(drawnType.startsWith('start'), drop.isToStart) : drawnType;
        this._linkDrop = undefined;
        runQuietly(async () => {
            await this._dependencies?.createDependency({ predecessorTaskId: String(link.source), successorTaskId: String(link.target), type });
        });
        return false;
    };

    private _onLinkDblClick = (id: string | number): boolean => {
        const chart = this._gantt.services.find('chart');
        const link = chart?.isLinkExists(id) ? chart.getLink(id) : undefined;
        if (this.isEditable() && link && !this._isLinkSaving(link)) {
            runQuietly(() => this._deleteLink(String(id)));
        }
        return false;
    };

    private async _deleteLink(dependencyId: string): Promise<void> {
        const navigation = this._gantt.getTaskRuntime().services.get('pcfContext').navigation;
        const confirmation = await navigation.openConfirmDialog({ text: this._labels.get('links.confirmDeleteLink') });
        if (confirmation.confirmed) {
            await this._dependencies?.deleteDependency(dependencyId);
        }
    }
}

declare module "../../interfaces" {
    interface IGanttModuleMap {
        /** The dependencies drawn between the bars. */
        links: ILinks;
    }
}
