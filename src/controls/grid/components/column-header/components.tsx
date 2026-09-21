import { IColumnHeaderContainerComponents } from "./container/components";
import { IColumnHeaderContentComponents } from "./content/components";
import { IColumnHeaderLabelComponents } from "./label/components";
import { IColumnHeaderMenuComponents } from "./menu/components";
import { IColumnHeaderRequiredMarkerComponents } from "./required-marker/components";
import { IColumnHeaderPrefixComponents } from "./prefix/components";
import { IColumnHeaderSuffixComponents } from "./suffix/components";

/**
 * The replaceable pieces of a column header, by the part they belong to.
 *
 * Each slot names the piece it is drawn by, whose props are `IColumnHeaderUi*Props` where a part's own
 * are `IColumnHeader*Props`, so changing one is taking that piece and spreading what the slot was handed:
 *
 * ```tsx
 * components={{ label: { onRenderLabel: props => <Grid.ColumnHeader.Ui.Label {...props} name={props.name?.toUpperCase()} /> } }}
 * ```
 */
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
