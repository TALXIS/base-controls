import { Card } from "@ui";
import { MapPopupRenderer } from "./MapPopupRenderer";
import { MapPopupHeader } from "./MapPopupHeader";
import { MapPopupFieldList } from "./MapPopupFieldList";
import { MapPopupField } from "./MapPopupField";

/** The parts a pin's popup is composed of; each reads the record of the pin it is in. */
export interface IMapPopupParts {
    /** The default popup, built from the parts below. */
    Renderer: typeof MapPopupRenderer;
    /** The record's name, with its status beside it. */
    Header: typeof MapPopupHeader;
    /** Holds the fields below the header. */
    Body: typeof Card.Body;
    /** The band at the bottom, below a divider. */
    Footer: typeof Card.Footer;
    /** Holds the fields, one under another. */
    FieldList: typeof MapPopupFieldList;
    /** Any column of the record. */
    Field: typeof MapPopupField;
}

export const MapPopup: IMapPopupParts = {
    Renderer: MapPopupRenderer,
    Header: MapPopupHeader,
    Body: Card.Body,
    Footer: Card.Footer,
    FieldList: MapPopupFieldList,
    Field: MapPopupField,
};
