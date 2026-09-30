import {
    IColumnHeaderUiContainerComponents, IColumnHeaderUiContentComponents, IColumnHeaderUiLabelComponents, IColumnHeaderUiMenuComponents,
    IColumnHeaderUiPrefixComponents, IColumnHeaderUiRequiredMarkerComponents, IColumnHeaderUiSuffixComponents,
} from "./ui";

/** The replaceable pieces of a column header, by the part they belong to. */
export interface IColumnHeaderRendererComponents {
    /** What the header is drawn in. */
    container?: Partial<IColumnHeaderUiContainerComponents>;
    /** What the modules draw before the name. */
    prefix?: Partial<IColumnHeaderUiPrefixComponents>;
    /** What the header says the column is, drawn in. */
    content?: Partial<IColumnHeaderUiContentComponents>;
    /** What the column is called. */
    label?: Partial<IColumnHeaderUiLabelComponents>;
    /** What says the column asks for a value. */
    requiredMarker?: Partial<IColumnHeaderUiRequiredMarkerComponents>;
    /** What is drawn after the name, the lock icon included. */
    suffix?: Partial<IColumnHeaderUiSuffixComponents>;
    /** The menu the header opens. */
    menu?: Partial<IColumnHeaderUiMenuComponents>;
}
