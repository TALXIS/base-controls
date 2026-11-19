import { CardRoot } from './card';
import { CardHeader } from './header';
import { CardHeaderStart } from './header-start';
import { CardHeaderEnd } from './header-end';
import { CardTitle } from './title';
import { CardBody } from './body';
import { CardFooter } from './footer';
import { CardFooterStart } from './footer-start';
import { CardFooterEnd } from './footer-end';

/** The pieces of a card, attached to the card itself. */
export interface ICardParts {
    /** The row at the top; `Header.Start` and `Header.End` are its two sides. */
    Header: typeof CardHeader & ICardHeaderParts;
    /** The card's title. */
    Title: typeof CardTitle;
    /** The card's content. */
    Body: typeof CardBody;
    /** The row at the bottom; `Footer.Start` and `Footer.End` are its two sides. */
    Footer: typeof CardFooter & ICardFooterParts;
}

/** The two sides of the header, attached to the header itself. */
export interface ICardHeaderParts {
    /** The start, holding the title. */
    Start: typeof CardHeaderStart;
    /** The end, such as its buttons. */
    End: typeof CardHeaderEnd;
}

/** The two sides of the footer, attached to the footer itself. */
export interface ICardFooterParts {
    /** The start, such as a status or a hint. */
    Start: typeof CardFooterStart;
    /** The end, such as its buttons. */
    End: typeof CardFooterEnd;
}

/** A box with the look of a form section, composed of `Card.Header`, `Card.Body` and `Card.Footer`. */
export const Card: typeof CardRoot & ICardParts = Object.assign(CardRoot, {
    Header: Object.assign(CardHeader, { Start: CardHeaderStart, End: CardHeaderEnd }),
    Title: CardTitle,
    Body: CardBody,
    Footer: Object.assign(CardFooter, { Start: CardFooterStart, End: CardFooterEnd }),
});
