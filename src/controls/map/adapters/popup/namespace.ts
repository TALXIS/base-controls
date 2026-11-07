import { MapPopupRenderer } from "./MapPopupRenderer";
import { MapPopupCard } from "./MapPopupCard";
import { MapPopupHeader } from "./MapPopupHeader";
import { MapPopupFieldRows } from "./MapPopupFieldRows";
import { MapPopupFieldRow } from "./MapPopupFieldRow";

/** The parts a pin's popup is composed of; each reads the record of the pin it is in. */
export interface IMapPopupParts {
    /** The default popup, built from the parts below. */
    Renderer: typeof MapPopupRenderer;
    /** The box the content sits in. */
    Card: typeof MapPopupCard;
    /** The record's name, with its status beside it. */
    Header: typeof MapPopupHeader;
    /** Holds the field rows. */
    FieldRows: typeof MapPopupFieldRows;
    /** Any column of the record. */
    FieldRow: typeof MapPopupFieldRow;
}

export const MapPopup: IMapPopupParts = {
    Renderer: MapPopupRenderer,
    Card: MapPopupCard,
    Header: MapPopupHeader,
    FieldRows: MapPopupFieldRows,
    FieldRow: MapPopupFieldRow,
};
