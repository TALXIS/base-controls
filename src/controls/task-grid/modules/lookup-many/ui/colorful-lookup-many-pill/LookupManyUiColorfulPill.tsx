import { ILookupManyUiPillProps, LookupManyUiPill } from "../lookup-many-pill";
import { getReferenceDataValue } from "../lookup-many-pill/getReferenceDataValue";

/** Props for {@link LookupManyUiColorfulPill}. */
export interface ILookupManyUiColorfulPillProps extends ILookupManyUiPillProps {
    /** The record field holding the pill's colour, `color` by default. */
    colorPropertyName?: string;
}

/** A record drawn as a tag tinted with its own colour. */
export const LookupManyUiColorfulPill = (props: ILookupManyUiColorfulPillProps) => {
    const { colorPropertyName = 'color', ...pillProps } = props;
    return <LookupManyUiPill {...pillProps} color={getReferenceDataValue(props.reference, colorPropertyName)} />;
};
