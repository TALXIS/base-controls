import type { IEventEmitter, IField, IFieldValidationResult } from "@talxis/client-libraries";
import type {
    FormXml as MetadataFormXml,
    FormXmlAncestor as MetadataFormXmlAncestor,
    FormXmlCell as MetadataFormXmlCell,
    FormXmlClientResources as MetadataFormXmlClientResources,
    FormXmlColumn as MetadataFormXmlColumn,
    FormXmlControl as MetadataFormXmlControl,
    FormXmlControlDescriptions as MetadataFormXmlControlDescriptions,
    FormXmlDisplayConditions as MetadataFormXmlDisplayConditions,
    FormXmlExternalDependencies as MetadataFormXmlExternalDependencies,
    FormXmlHeaderFooter as MetadataFormXmlHeaderFooter,
    FormXmlHiddenControls as MetadataFormXmlHiddenControls,
    FormXmlLabels as MetadataFormXmlLabels,
    FormXmlLibraryType as MetadataFormXmlLibraryType,
    FormXmlNavigation as MetadataFormXmlNavigation,
    FormXmlOpaqueElement as MetadataFormXmlOpaqueElement,
    FormXmlOpaqueNode as MetadataFormXmlOpaqueNode,
    FormXmlPrimitiveValue as MetadataFormXmlPrimitiveValue,
    FormXmlSection as MetadataFormXmlSection,
    FormXmlSections as MetadataFormXmlSections,
    FormXmlTab as MetadataFormXmlTab,
    FormXmlTabs as MetadataFormXmlTabs,
    FormXmlFormParameters as MetadataFormXmlFormParameters,
    FormXmlControlParameters,
    RequiredLevelEnum,
} from "@talxis/client-metadata";
import type { IForm } from "@components/Form/internal/FormModel";

export interface IFormXmlFormProps {
    formXml: string;
    form: IForm;
    lcid: number;
}

export interface IFormXmlTabsEvents {
    onExpandedTabChanged: (tabId: string) => void;
    onTabFocusChanged: (tabId: string, focused: boolean) => void;
    onTabVisibilityChanged: (tabId: string, visible: boolean) => void;
}

export interface IFormXmlTabs extends Omit<MetadataFormXmlTabs, 'tab'> {
    tab: IFormXmlTab[];
    events: IEventEmitter<IFormXmlTabsEvents>;
    getExpandedTab: () => IFormXmlTab;
    getVisibleTabs: () => IFormXmlTab[];
    setExpandedTab: (tabId: string) => void;
}

export interface IFormXmlTabEvents {
    onVisibilityChanged: (visible: boolean) => void;
    onExpandedChanged: (expanded: boolean) => void;
    onSectionVisibilityChanged: (sectionId: string, visible: boolean) => void;
    onLabelChanged: (label: string) => void;
}

export interface IFormXmlTab extends Omit<MetadataFormXmlTab, 'events' | 'columns'> {
    id: string;
    formXmlModel: IFormXmlModel;
    events: IEventEmitter<IFormXmlTabEvents>;
    getLabel: () => string | null;
    setExpanded: () => void;
    getExpanded: () => boolean;
    getVisible: () => boolean;
    setVisible: (visible: boolean) => void;
    setLabel: (label: string) => void;
    getColumns: () => IFormXmlColumn[];
    getVisibleSections: () => IFormXmlSection[];
    getSections: () => IFormXmlSection[];
}

export interface IFormXmlSectionEvents {
    onVisibilityChanged: (visible: boolean) => void;
    onCellVisibilityChanged: (cellId: string, visible: boolean) => void;
    onLabelChanged: (label: string) => void;
}

export interface IFormXmlSection extends Omit<MetadataFormXmlSection, 'events' | 'columns'> {
    events: IEventEmitter<IFormXmlSectionEvents>;
    getLabel: () => string | null;
    getCells: () => IFormXmlCell[];
    getControls: () => IFormXmlControl[];
    getVisibleCells: () => IFormXmlCell[];
    getVisible: () => boolean;
    setVisible: (visible: boolean) => void;
    setLabel: (label: string) => void;
    getNumberOfColumns: () => number;
    getCellLabelPosition: () => "Top" | "Left";
}

export interface IFormXmlColumn extends MetadataFormXmlColumn {
    getSections: () => IFormXmlSection[];
    getVisibleSections: () => IFormXmlSection[];
}

export interface IFormXmlCellEvents {
    onVisibilityChanged: (visible: boolean) => void;
    onLabelChanged: (label: string) => void;
}

export interface IFormXmlControlEvents {
    onDisabledChanged: (disabled: boolean) => void;
    onValidationChanged: (validation: IFieldValidationResult | null) => void;
}

export interface IFormXmlCell extends Omit<MetadataFormXmlCell, 'events' | 'control'> {
    control?: IFormXmlControl;
    events: IEventEmitter<IFormXmlCellEvents>;
    getLabel: () => string | null;
    getVisible: () => boolean;
    setVisible: (visible: boolean) => void;
    setLabel: (label: string) => void;
}

export interface IFormXmlControl extends MetadataFormXmlControl {
    events: IEventEmitter<IFormXmlControlEvents>;
    setDisabled: (disabled: boolean) => void;
    getDisabled: () => boolean;
    getCell: () => IFormXmlCell;
}

export interface IFormXmlFormEvents {
    onRenderRequested: () => void;
    onNotificationsChanged: (notifications: INotification[]) => void;
}

export interface IFormXmlModel extends Omit<MetadataFormXml, 'tabs' | 'events'> {
    tabs: IFormXmlTabs;
    events: IEventEmitter<IFormXmlFormEvents>;
    getForm: () => IForm;
    getVisibleTabs: () => IFormXmlTab[];
    getSections: () => IFormXmlSection[];
    getCells: () => IFormXmlCell[];
    getAttribute: (name: string) => IFormXmlAttribute | null;
    getAttributes: () => IFormXmlAttribute[];
    getControls: () => IFormXmlControl[];
    getTabs: () => IFormXmlTab[];
    getNotifications: () => INotification[];
    setNotifications: (notifications: INotification[]) => void;
    getLocalizedLabel: (labels?: MetadataFormXmlLabels) => string | null;
    requestRender: () => void;
}

export interface INotification {
    message: string;
    level: 'ERROR' | 'WARNING' | 'INFO';
}

export interface IFormXmlAttributeEvents {
    onValidationChanged: (validation: IFieldValidationResult | null) => void;
    onRequiredLevelChanged: (requiredLevel: RequiredLevelEnum) => void;
}

export interface IFormXmlAttribute {
    events: IEventEmitter<IFormXmlAttributeEvents>;
    getField: () => IField;
    getRequiredLevel: () => RequiredLevelEnum | null;
    setRequiredLevel: (requiredLevel: RequiredLevelEnum) => void;
    getValidation: () => IFieldValidationResult | null;
    setValidation: (validation: IFieldValidationResult) => void;
}

export type {
    MetadataFormXmlAncestor,
    MetadataFormXmlCell,
    MetadataFormXmlClientResources,
    MetadataFormXmlColumn,
    MetadataFormXmlControl,
    MetadataFormXmlControlDescriptions,
    MetadataFormXmlDisplayConditions,
    MetadataFormXmlExternalDependencies,
    MetadataFormXmlFormParameters,
    MetadataFormXmlHeaderFooter,
    MetadataFormXmlHiddenControls,
    MetadataFormXmlLabels,
    MetadataFormXmlLibraryType,
    MetadataFormXmlNavigation,
    MetadataFormXmlOpaqueElement,
    MetadataFormXmlOpaqueNode,
    MetadataFormXmlPrimitiveValue,
    MetadataFormXmlSection,
    MetadataFormXmlSections,
    MetadataFormXmlTab,
    MetadataFormXmlTabs,
    FormXmlControlParameters,
    RequiredLevelEnum,
};
