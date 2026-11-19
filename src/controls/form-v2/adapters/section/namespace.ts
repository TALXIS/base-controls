import { SectionRoot } from './section';
import { SectionHeader } from './header';
import { SectionHeaderStart } from './header-start';
import { SectionHeaderEnd } from './header-end';
import { SectionTitle } from './title';
import { SectionBody } from './body';
import { SectionFooter } from './footer';
import { SectionFooterStart } from './footer-start';
import { SectionFooterEnd } from './footer-end';

/** The parts of a section, attached to the section itself. */
export interface IFormV2SectionParts {
    /** The header row; `Header.Start` and `Header.End` are its two sides. */
    Header: typeof SectionHeader & { Start: typeof SectionHeaderStart; End: typeof SectionHeaderEnd };
    /** The section's label. */
    Title: typeof SectionTitle;
    /** The controls, laid out by the section's width. */
    Body: typeof SectionBody;
    /** The bottom band; `Footer.Start` and `Footer.End` are its two sides. */
    Footer: typeof SectionFooter & { Start: typeof SectionFooterStart; End: typeof SectionFooterEnd };
}

/** A group of controls in a card, composed of `Section.Header`, `Section.Body` and `Section.Footer`. */
export const Section: typeof SectionRoot & IFormV2SectionParts = Object.assign(SectionRoot, {
    Header: Object.assign(SectionHeader, { Start: SectionHeaderStart, End: SectionHeaderEnd }),
    Title: SectionTitle,
    Body: SectionBody,
    Footer: Object.assign(SectionFooter, { Start: SectionFooterStart, End: SectionFooterEnd }),
});
