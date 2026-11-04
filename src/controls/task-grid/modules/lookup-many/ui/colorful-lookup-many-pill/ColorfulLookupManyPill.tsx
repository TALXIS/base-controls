import { ILookupManyPillProps, LookupManyPill } from "../lookup-many-pill";
import { getReferenceDataValue } from "../lookup-many-pill/getReferenceDataValue";

/** Props for {@link ColorfulLookupManyPill}. */
export interface IColorfulLookupManyPillProps extends ILookupManyPillProps {
    /** The record field holding the pill's colour, `color` by default. */
    colorPropertyName?: string;
}

/** A record drawn as a tag tinted with its own colour. */
export const ColorfulLookupManyPill = (props: IColorfulLookupManyPillProps) => {
    const { colorPropertyName = 'color', ...pillProps } = props;
    return <LookupManyPill {...pillProps} color={getReferenceDataValue(props.reference, colorPropertyName)} />;
};
