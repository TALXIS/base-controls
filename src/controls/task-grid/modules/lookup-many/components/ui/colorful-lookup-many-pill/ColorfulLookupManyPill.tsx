import { ILookupManyPillProps, LookupManyPill } from "../lookup-many-pill";
import { getRawValue } from "../getRawValue";

/** Props for {@link ColorfulLookupManyPill}. */
export interface IColorfulLookupManyPillProps extends ILookupManyPillProps {
    /** The record field holding the pill's colour; `color` when left out. */
    colorPropertyName?: string;
}

/** A record drawn as a tag tinted with its own colour. */
export const ColorfulLookupManyPill = (props: IColorfulLookupManyPillProps) => {
    const { colorPropertyName = 'color', ...pillProps } = props;
    return <LookupManyPill {...pillProps} color={getRawValue(props.reference, colorPropertyName)} />;
};
