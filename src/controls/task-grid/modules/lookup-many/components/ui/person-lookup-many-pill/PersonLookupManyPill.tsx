import { useMemo } from "react";
import { Persona, PersonaSize } from "@fluentui/react";
import { TooltipHost } from "@ui";
import { ILookupManyPillProps, LookupManyPill } from "../lookup-many-pill";
import { getReferenceDataValue } from "../lookup-many-pill/getReferenceDataValue";
import { getPersonLookupManyPillStyles } from "./styles";

/** Props for {@link PersonLookupManyPill}. */
export interface IPersonLookupManyPillProps extends ILookupManyPillProps {
    /** The record field holding the person's picture, `imageurl` by default. */
    imageUrlPropertyName?: string;
}

/** A person drawn as their avatar, named in its tooltip. */
export const PersonLookupManyPill = (props: IPersonLookupManyPillProps) => {
    const { imageUrlPropertyName = 'imageurl', ...pillProps } = props;
    const styles = useMemo(() => getPersonLookupManyPillStyles(), []);
    return <LookupManyPill {...pillProps} className={styles.pill} components={{
        onRenderDot: () => null,
        onRenderLabel: () => <TooltipHost content={props.reference.name}>
            <Persona text={props.reference.name} imageUrl={getReferenceDataValue(props.reference, imageUrlPropertyName)} size={PersonaSize.size24} imageShouldFadeIn={false} hidePersonaDetails className={styles.persona} />
        </TooltipHost>,
        ...props.components,
    }} />;
};
