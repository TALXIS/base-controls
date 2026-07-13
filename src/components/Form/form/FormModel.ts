import { EventEmitter, IEventEmitter, IRecord } from "@talxis/client-libraries";
import {
    AttributeTypeEnum,
    FormXml,
    FormXmlLabels,
    FormXmlTab,
    IEntityDefinition,
    IMetadataProvider,
    Option,
    OptionSetDefinition,
    RequiredLevelEnum,
    parseFormXml,
    serializeFormXml,
} from "@talxis/client-metadata";
import { ITheme } from "@talxis/react-components";
import { getTheme } from "@fluentui/react";
import { ITranslation } from "../../../hooks";
import { formTranslations } from "../translations";
import { IForm as IRuntimeForm, IFormOutputs, IFormParameters, IAttributeConfiguration, AttributeRequiredLevel, IAttributeOption, IFieldValidationResult, FieldValidator, VALID_RESULT } from "../interfaces";
import { XrmFormContext } from "./xrm/XrmFormContext";
import { XrmExecutionContext } from "./xrm/XrmExecutionContext";
import { XrmOnLoadEventArgs, XrmOnSaveEventArgs } from "./xrm/XrmEventArgs";
import { IFormCellProps, IFormColumnProps, IFormSectionProps, IFormTabProps } from "../..";

const HANDLER_TIMEOUT_MS = 10_000;

interface IFormDependencies {
    labels: Required<ITranslation<typeof formTranslations>>;
    onGetProps: () => IRuntimeForm;
    theme?: ITheme;
    metadataProvider?: IMetadataProvider;
    scriptLoader?: IScriptLoader;
}

interface IAttributeMetadataOverride {
    requiredLevel?: Xrm.Attributes.RequirementLevel;
    addedOptions?: IAttributeOption[];
    removedOptionValues?: Set<number>;
}


export interface ITab extends IFormTabProps {
    id: string;
    update: (props: IFormTabProps) => void;
}

export interface ICell extends IFormCellProps {
    id: string;
    update: (props: IFormCellProps) => void;
}

export interface ISectionEvents {
    onCellAdded: (cell: ICell) => void;
}

export interface ISection extends IFormSectionProps {
    id: string;
    events: IEventEmitter<ISectionEvents>
    addCell: (props: IFormCellProps) => ICell;
    getCells: () => ICell[];
    getCell: (id: string) => ICell | null;
    update: (props: IFormSectionProps) => void;
}

export interface IColumn extends IFormColumnProps {

}


export class Section implements ISection {
    //we need to be aware which cells belong to a section
    private _cells: ICell[] = [];
    public id: string = crypto.randomUUID();
    public events: IEventEmitter<ISectionEvents> = new EventEmitter<ISectionEvents>();
    public name?: IFormSectionProps["name"];
    public group?: IFormSectionProps["group"];
    public showLabel?: IFormSectionProps["showLabel"];
    public labelId?: IFormSectionProps["labelId"];
    public showBar?: IFormSectionProps["showBar"];
    public isUserDefined?: IFormSectionProps["isUserDefined"];
    public height?: IFormSectionProps["height"];
    public lockLevel?: IFormSectionProps["lockLevel"];
    public layout?: IFormSectionProps["layout"];
    public addedBy?: IFormSectionProps["addedBy"];
    public visible?: IFormSectionProps["visible"];
    public autoExpand?: IFormSectionProps["autoExpand"];
    public columns?: IFormSectionProps["columns"];
    public labelWidth?: IFormSectionProps["labelWidth"];
    public cellLabelTopBreakpoint?: IFormSectionProps["cellLabelTopBreakpoint"];
    public availableForPhone?: IFormSectionProps["availableForPhone"];
    public cellLabelAlignment?: IFormSectionProps["cellLabelAlignment"];
    public cellLabelPosition?: IFormSectionProps["cellLabelPosition"];
    public rowHeight?: IFormSectionProps["rowHeight"];
    public label?: IFormSectionProps["label"];

    constructor(props: IFormSectionProps) {
        this.update(props);
    }

    public update(props: IFormSectionProps): void {
        Object.assign(this, props);
    }

    public addCell(props: IFormCellProps): ICell {
        const cell = new Cell(props);
        if (this._cells.find(c => c.id === cell.id)) {
            throw new Error(`[Form] Cell with id "${cell.id}" already exists in section "${this.id}".`);
        }
        this._cells.push(cell);
        this.events.dispatchEvent('onCellAdded', cell);
        return cell;
    }

    public getCells(): ICell[] {
        return this._cells;
    }

    public getCell(id: string): ICell | null {
        return this._cells.find(c => c.id === id) ?? null;
    }
}

export class Cell implements ICell {
    public id: string = crypto.randomUUID();
    public labelId?: IFormCellProps["labelId"];
    public label?: IFormCellProps["label"];
    public lockLevel?: IFormCellProps["lockLevel"];
    public showLabel?: IFormCellProps["showLabel"];
    public visible?: IFormCellProps["visible"];
    public colspan?: IFormCellProps["colspan"];
    public rowspan?: IFormCellProps["rowspan"];
    public userspacer?: IFormCellProps["userspacer"];
    public availableForPhone?: IFormCellProps["availableForPhone"];
    public isPreviewCell?: IFormCellProps["isPreviewCell"];
    public isStreamCell?: IFormCellProps["isStreamCell"];
    public isChartCell?: IFormCellProps["isChartCell"];
    public isTileCell?: IFormCellProps["isTileCell"];
    public auto?: IFormCellProps["auto"];
    public addedBy?: IFormCellProps["addedBy"];

    constructor(props: IFormCellProps) {
        this.update(props);
    }

    public update(props: IFormCellProps): void {
        Object.assign(this, props);
    }
}

export class Tab implements ITab {
    public id: string = crypto.randomUUID();
    public name?: IFormTabProps["name"];
    public group?: IFormTabProps["group"];
    public verticalLayout?: IFormTabProps["verticalLayout"];
    public showLabel?: IFormTabProps["showLabel"];
    public labelId?: IFormTabProps["labelId"];
    public isUserDefined?: IFormTabProps["isUserDefined"];
    public lockLevel?: IFormTabProps["lockLevel"];
    public addedBy?: IFormTabProps["addedBy"];
    public expanded?: IFormTabProps["expanded"];
    public visible?: IFormTabProps["visible"];
    public availableForPhone?: IFormTabProps["availableForPhone"];
    public collapsible?: IFormTabProps["collapsible"];
    public label?: IFormTabProps["label"];

    constructor(props: IFormTabProps) {
        this.update(props);
    }

    public update(props: IFormTabProps): void {
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
    addCell: (props: IFormCellProps) => ICell;
    getCells: () => ICell[];
    getTabs(): ITab[];
    getTab(id: string): ITab | null;
    addTab(props: IFormTabProps): ITab;
    getExpandedTab(): ITab | null;
    getSections: () => ISection[];
    getSection: (id: string) => ISection | null;
    addSection: (props: IFormSectionProps) => ISection;

}

export class Form implements IForm {
    public id: string = crypto.randomUUID();
    public readonly events: IEventEmitter<IFormEvents> = new EventEmitter<IFormEvents>();
    private _tabs: ITab[] = [];
    private _sections: ISection[] = [];

    public getTabs(): ITab[] {
        return this._tabs;
    }
    public getTab(id: string): ITab | null {
        const tab = this._tabs.find((currentTab) => currentTab.id === id) ?? null;
        return tab;
    }
    public addTab(props: IFormTabProps): ITab {
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
        return this._sections;
    }
    public getSection(id: string): ISection | null {
        return this._sections.find(section => section.id === id) ?? null;
    }
    public addSection(props: IFormSectionProps): ISection {
        const section = new Section(props);
        if (this.getSection(section.id)) {
            throw new Error(`[Form] Section with id "${section.id}" already exists.`);
        }
        this._sections.push(section);
        return section;
    }
    public getCell(id: string): ICell | null {
        return this._sections.flatMap(section => section.getCells()).find(cell => cell.id === id) ?? null;
    }
    public getCells(): ICell[] {
        return this._sections.flatMap(section => section.getCells());
    }
    //should only be called when adding without a section, otherwise use section.addCell
    public addCell(props: IFormCellProps): ICell {
        const cell = new Cell(props);
        if(this.getCell(cell.id)) {
            throw new Error(`[Form] Cell with id "${cell.id}" already exists.`);
        }
        return cell;
    }

}
