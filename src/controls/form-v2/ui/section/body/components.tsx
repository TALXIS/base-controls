import { Card } from "@ui";

/** The replaceable pieces of a section's body. */
export interface IFormV2UiSectionBodyComponents {
    /** The card's body, laid out as the grid of cells; the ref measures its width. */
    onRender: (props: React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link IFormV2UiSectionBodyComponents}. */
export const FormV2UiSectionBodyComponents: IFormV2UiSectionBodyComponents = {
    onRender: ({ ref, className, children, ...gridProps }) => <Card.Body className={className} components={{ onRender: bodyProps => <div {...bodyProps} {...gridProps} ref={ref} /> }}>
        {children}
    </Card.Body>,
};
