import { useMemo } from "react";
import { Persona, PersonaSize } from "@fluentui/react";
import { TooltipHost } from "@ui";
import { ILookupManyUiPillProps, LookupManyUiPill } from "../lookup-many-pill";
import { getReferenceDataValue } from "../lookup-many-pill/getReferenceDataValue";
import { getLookupManyUiPersonPillStyles } from "./styles";

/** Props for {@link LookupManyUiPersonPill}. */
export interface ILookupManyUiPersonPillProps extends ILookupManyUiPillProps {
    /** The record field holding the person's picture, `imageurl` by default. */
    imageUrlPropertyName?: string;
}

/** A person drawn as their avatar, named in its tooltip. */
export const LookupManyUiPersonPill = (props: ILookupManyUiPersonPillProps) => {
    const { imageUrlPropertyName = 'imageurl', ...pillProps } = props;
    const styles = useMemo(() => getLookupManyUiPersonPillStyles(), []);
    return <LookupManyUiPill {...pillProps} className={styles.pill} components={{
        onRenderLabel: () => <TooltipHost content={props.reference.name}>
            <Persona text={props.reference.name} imageUrl={getReferenceDataValue(props.reference, imageUrlPropertyName)} size={PersonaSize.size24} imageShouldFadeIn={false} hidePersonaDetails className={styles.persona} />
        </TooltipHost>,
        ...props.components,
    }} />;
};
