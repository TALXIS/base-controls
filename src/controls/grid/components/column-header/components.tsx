import { IColumnHeaderContainerComponents } from "./container/components";
import { IColumnHeaderContentComponents } from "./content/components";
import { IColumnHeaderLabelComponents } from "./label/components";
import { IColumnHeaderMenuComponents } from "./menu/components";
import { IColumnHeaderRequiredMarkerComponents } from "./required-marker/components";
import { IColumnHeaderPrefixComponents } from "./prefix/components";
import { IColumnHeaderSuffixComponents } from "./suffix/components";

/** The replaceable pieces of a column header, by the part they belong to. */
export interface IColumnHeaderRendererComponents {
    /** What the header is drawn in. */
    container?: Partial<IColumnHeaderContainerComponents>;
    /** What the modules draw before the name. */
    prefix?: Partial<IColumnHeaderPrefixComponents>;
    /** What the header says the column is, drawn in. */
    content?: Partial<IColumnHeaderContentComponents>;
    /** What the column is called. */
    label?: Partial<IColumnHeaderLabelComponents>;
    /** What says the column asks for a value. */
    requiredMarker?: Partial<IColumnHeaderRequiredMarkerComponents>;
    /** What is drawn after the name, the uneditable icon included. */
    suffix?: Partial<IColumnHeaderSuffixComponents>;
    /** The menu the header opens. */
    menu?: Partial<IColumnHeaderMenuComponents>;
}
