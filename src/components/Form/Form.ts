import { EventEmitter, IEventEmitter } from "@talxis/client-libraries";
import { IFormControlProps } from "./components";
import type { ICellProps } from "./components/cell";
import type { IColumnProps } from "./components/column";
import type { ISectionProps } from "./components/section";
import type { ITabProps } from "./components/tab";

export interface IRequiredId {
    id: string
}

type WithRequiredId<TProps extends { id?: string }> = Omit<TProps, 'id'> & IRequiredId;

export interface ITab extends WithRequiredId<ITabProps> {
    addSection: (props: WithRequiredId<ISectionProps>) => ISection;
    getSections: () => ISection[];
    getSection: (id: string) => ISection | null;
    update: (props: ITabProps) => void;
}

export interface IControl extends WithRequiredId<IFormControlProps> {
    addControl: (props: WithRequiredId<IFormControlProps>) => IControl;
    getControls: () => IControl[];
    getControl: (id: string) => IControl | null;
    update: (props: IFormControlProps) => void;
}

export interface ICell extends WithRequiredId<ICellProps> {
    events: IEventEmitter<ICellEvents>;
    update: (props: ICellProps) => void;
}

export interface ISectionEvents {
    onCellDisabledChanged: (cell: ICell) => void;
}

export interface ISection extends WithRequiredId<ISectionProps> {
    events: IEventEmitter<ISectionEvents>
    addCell: (props: WithRequiredId<ICellProps>) => ICell;
    getCells: () => ICell[];
    getCell: (id: string) => ICell | null;
    addControl: (props: WithRequiredId<IFormControlProps>) => IControl;
    getControls: () => IControl[];
    getControl: (id: string) => IControl | null;
    update: (props: ISectionProps) => void;
}

export interface IColumn extends IColumnProps {

}

export class Control implements IControl {
    private _controls: IControl[] = [];
    public id!: string;
    public classid!: IFormControlProps["classid"];
    public datafieldname?: IFormControlProps["datafieldname"];
    public disabled?: IFormControlProps["disabled"];
    public isrequired?: IFormControlProps["isrequired"];
    public relationship?: IFormControlProps["relationship"];

    constructor(props: WithRequiredId<IFormControlProps>) {
        this.update(props);
    }

    public addControl(props: WithRequiredId<IFormControlProps>): IControl {
        const control = new Control(props);
        if (this.getControl(control.id)) {
            throw new Error(`[Form] Control with id "${control.id}" already exists in control "${this.id}".`);
        }
        this._controls.push(control);
        return control;
    }

    public getControls(): IControl[] {
        return this._controls;
    }

    public getControl(id: string): IControl | null {
        return this._controls.find(control => control.id === id) ?? null;
    }

    public update(props: IFormControlProps): void {
        Object.assign(this, props);
    }
}


export class Section implements ISection {
    //we need to be aware which cells belong to a section
    private _cells: ICell[] = [];
    private _controls: IControl[] = [];
    public id!: string;
    public events: IEventEmitter<ISectionEvents> = new EventEmitter<ISectionEvents>();
    public name?: ISectionProps["name"];
    public group?: ISectionProps["group"];
    public showLabel?: ISectionProps["showLabel"];
    public labelId?: ISectionProps["labelId"];
    public showBar?: ISectionProps["showBar"];
    public isUserDefined?: ISectionProps["isUserDefined"];
    public height?: ISectionProps["height"];
    public lockLevel?: ISectionProps["lockLevel"];
    public layout?: ISectionProps["layout"];
    public addedBy?: ISectionProps["addedBy"];
    public visible?: ISectionProps["visible"];
    public autoExpand?: ISectionProps["autoExpand"];
    public columns?: ISectionProps["columns"];
    public labelWidth?: ISectionProps["labelWidth"];
    public cellLabelTopBreakpoint?: ISectionProps["cellLabelTopBreakpoint"];
    public availableForPhone?: ISectionProps["availableForPhone"];
    public cellLabelAlignment?: ISectionProps["cellLabelAlignment"];
    public cellLabelPosition?: ISectionProps["cellLabelPosition"];
    public rowHeight?: ISectionProps["rowHeight"];
    public label?: ISectionProps["label"];

    constructor(props: WithRequiredId<ISectionProps>) {
        this.update(props);
    }

    public update(props: ISectionProps): void {
        Object.assign(this, props);
    }

    public addCell(props: WithRequiredId<ICellProps>): ICell {
        const cell = new Cell(props);
        if (this._cells.find(c => c.id === cell.id)) {
            throw new Error(`[Form] Cell with id "${cell.id}" already exists in section "${this.id}".`);
        }
        cell.events.addEventListener('onDisabledChanged', (this._onCellDisabledChanged));
        this._cells.push(cell);
        return cell;
    }

    public getCells(): ICell[] {
        return this._cells;
    }

    public getCell(id: string): ICell | null {
        return this._cells.find(c => c.id === id) ?? null;
    }

    public addControl(props: WithRequiredId<IFormControlProps>): IControl {
        const control = new Control(props);
        if (this.getControl(control.id)) {
            throw new Error(`[Form] Control with id "${control.id}" already exists in section "${this.id}".`);
        }
        this._controls.push(control);
        return control;
    }

    public getControls(): IControl[] {
        return this._controls;
    }

    public getControl(id: string): IControl | null {
        return this._controls.find(control => control.id === id) ?? null;
    }

    private _onCellDisabledChanged = (cell: ICell, disabled: boolean) => {
        this.events.dispatchEvent('onCellDisabledChanged', cell);
    }
}

export interface ICellEvents {
    onDisabledChanged: (cell: ICell, disabled: boolean) => void;
}

export class Cell implements ICell {
    public id!: string;
    public events: IEventEmitter<ICellEvents> = new EventEmitter<ICellEvents>();
    public labelId?: ICellProps["labelId"];
    public label?: ICellProps["label"];
    public lockLevel?: ICellProps["lockLevel"];
    public showLabel?: ICellProps["showLabel"];
    public visible?: ICellProps["visible"];
    public colspan?: ICellProps["colspan"];
    public rowspan?: ICellProps["rowspan"];
    public userspacer?: ICellProps["userspacer"];
    public availableForPhone?: ICellProps["availableForPhone"];
    public isPreviewCell?: ICellProps["isPreviewCell"];
    public isStreamCell?: ICellProps["isStreamCell"];
    public isChartCell?: ICellProps["isChartCell"];
    public isTileCell?: ICellProps["isTileCell"];
    public auto?: ICellProps["auto"];
    public addedBy?: ICellProps["addedBy"];
    public disabled?: ICellProps["disabled"];

    constructor(props: WithRequiredId<ICellProps>) {
        Object.assign(this, props);
    }

    public update(props: ICellProps): void {
        const previousDisabled = this.disabled;
        Object.assign(this, props);
        if (previousDisabled !== props.disabled) {
            this.events.dispatchEvent('onDisabledChanged', this, !!this.disabled);
        }
    }
}

export class Tab implements ITab {
    private _sections: ISection[] = [];
    public id!: string;
    public name?: ITabProps["name"];
    public group?: ITabProps["group"];
    public verticalLayout?: ITabProps["verticalLayout"];
    public showLabel?: ITabProps["showLabel"];
    public labelId?: ITabProps["labelId"];
    public isUserDefined?: ITabProps["isUserDefined"];
    public lockLevel?: ITabProps["lockLevel"];
    public addedBy?: ITabProps["addedBy"];
    public expanded?: ITabProps["expanded"];
    public visible?: ITabProps["visible"];
    public availableForPhone?: ITabProps["availableForPhone"];
    public collapsible?: ITabProps["collapsible"];
    public label?: ITabProps["label"];

    constructor(props: WithRequiredId<ITabProps>) {
        this.update(props);
    }

    public addSection(props: WithRequiredId<ISectionProps>): ISection {
        const section = new Section(props);
        if (this.getSection(section.id)) {
            throw new Error(`[Form] Section with id "${section.id}" already exists in tab "${this.id}".`);
        }
        this._sections.push(section);
        return section;
    }

    public getSections(): ISection[] {
        return this._sections;
    }

    public getSection(id: string): ISection | null {
        return this._sections.find(section => section.id === id) ?? null;
    }

    public update(props: ITabProps): void {
        Object.assign(this, props);
    }
}



export interface IFormEvents {
    onTabExpanded: (tab: ITab) => void;
}

export interface IForm {
    id: string;
    events: IEventEmitter<IFormEvents>;
    getCell: (id: string) => ICell | null;
    getCells: () => ICell[];
    getTabs(): ITab[];
    getTab(id: string): ITab | null;
    addTab(props: WithRequiredId<ITabProps>): ITab;
    getExpandedTab(): ITab | null;
    getSections: () => ISection[];
    getSection: (id: string) => ISection | null;

}

export class Form implements IForm {
    public id: string = crypto.randomUUID();
    public readonly events: IEventEmitter<IFormEvents> = new EventEmitter<IFormEvents>();
    private _tabs: ITab[] = [];

    public getTabs(): ITab[] {
        return this._tabs;
    }
    public getTab(id: string): ITab | null {
        const tab = this._tabs.find((currentTab) => currentTab.id === id) ?? null;
        return tab;
    }
    public addTab(props: WithRequiredId<ITabProps>): ITab {
        const tab = new Tab(props);
        if (this.getTab(tab.id)) {
            throw new Error(`[Form] Tab with id "${tab.id}" already exists.`);
        }
        this._tabs.push(tab);
        return tab;
    }
    public getExpandedTab(): ITab {
        return this._tabs.find(tab => tab.expanded) ?? this._tabs[0];
    }
    public getSections(): ISection[] {
        return this._tabs.flatMap(tab => tab.getSections());
    }
    public getSection(id: string): ISection | null {
        return this._tabs.flatMap(tab => tab.getSections()).find(section => section.id === id) ?? null;
    }
    public getCell(id: string): ICell | null {
        return this.getSections().flatMap(section => section.getCells()).find(cell => cell.id === id) ?? null;
    }
    public getCells(): ICell[] {
        return this.getSections().flatMap(section => section.getCells());
    }
}
