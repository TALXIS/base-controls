import { useMemo } from "react";
import { Persona, PersonaSize } from "@fluentui/react";
import { components, OptionProps } from "react-select";
import { getReferenceDataValue } from "../lookup-many-pill/getReferenceDataValue";
import { getPersonLookupManyOptionStyles } from "./styles";

/** Props for {@link PersonLookupManyOption}. */
export interface IPersonLookupManyOptionProps extends OptionProps<ComponentFramework.EntityReference, true, never> {
    /** The record field holding the person's picture, `imageurl` by default. */
    imageUrlPropertyName?: string;
}

/** A person offered with their avatar. */
export const PersonLookupManyOption = (props: IPersonLookupManyOptionProps) => {
    const { imageUrlPropertyName = 'imageurl', ...optionProps } = props;
    const styles = useMemo(() => getPersonLookupManyOptionStyles(), []);
    return <components.Option {...optionProps}>
        <div className={styles.option}>
            <Persona text={props.data.name} imageUrl={getReferenceDataValue(props.data, imageUrlPropertyName)} size={PersonaSize.size24} hidePersonaDetails className={styles.persona} />
            {props.children}
        </div>
    </components.Option>;
};
