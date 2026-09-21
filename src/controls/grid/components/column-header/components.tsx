import { IGridColumnHeaderContainerComponents } from "./container/components";
import { IGridColumnHeaderContentComponents } from "./content/components";
import { IGridColumnHeaderLabelComponents } from "./label/components";
import { IGridColumnHeaderMenuComponents } from "./menu/components";
import { IGridColumnHeaderRequiredMarkerComponents } from "./required-marker/components";
import { IGridColumnHeaderPrefixComponents } from "./prefix/components";
import { IGridColumnHeaderSuffixComponents } from "./suffix/components";

/**
 * The replaceable pieces of a column header, by the part they belong to.
 *
 * Each slot names the `ColumnHeaderUi` component it is drawn by and the props that component takes -
 * `IColumnHeader*Props`, where a part's own props are `IGridColumnHeader*Props` - so changing one is
 * importing that component and spreading what the slot was handed:
 *
 * ```tsx
 * components={{ label: { onRenderLabel: props => <ColumnHeaderUi.Label {...props} name={props.name?.toUpperCase()} /> } }}
 * ```
 */
export interface IGridColumnHeaderComponents {
    /** What the header is drawn in. */
    container?: Partial<IGridColumnHeaderContainerComponents>;
    /** What the modules draw before the name. */
    prefix?: Partial<IGridColumnHeaderPrefixComponents>;
    /** What the header says the column is, drawn in. */
    content?: Partial<IGridColumnHeaderContentComponents>;
    /** What the column is called. */
    label?: Partial<IGridColumnHeaderLabelComponents>;
    /** What says the column asks for a value. */
    requiredMarker?: Partial<IGridColumnHeaderRequiredMarkerComponents>;
    /** What is drawn after the name, the uneditable icon included. */
    suffix?: Partial<IGridColumnHeaderSuffixComponents>;
    /** The menu the header opens. */
    menu?: Partial<IGridColumnHeaderMenuComponents>;
}
