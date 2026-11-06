import { useMemo } from "react";
import { Persona, PersonaSize } from "@fluentui/react";
import { components, OptionProps } from "react-select";
import { getReferenceDataValue } from "../lookup-many-pill/getReferenceDataValue";
import { getLookupManyUiPersonOptionStyles } from "./styles";

/** Props for {@link LookupManyUiPersonOption}. */
export interface ILookupManyUiPersonOptionProps extends OptionProps<ComponentFramework.EntityReference, true, never> {
    /** The record field holding the person's picture, `imageurl` by default. */
    imageUrlPropertyName?: string;
}

/** A person offered with their avatar. */
export const LookupManyUiPersonOption = (props: ILookupManyUiPersonOptionProps) => {
    const { imageUrlPropertyName = 'imageurl', ...optionProps } = props;
    const styles = useMemo(() => getLookupManyUiPersonOptionStyles(), []);
    return <components.Option {...optionProps}>
        <div className={styles.option}>
            <Persona text={props.data.name} imageUrl={getReferenceDataValue(props.data, imageUrlPropertyName)} size={PersonaSize.size24} hidePersonaDetails className={styles.persona} />
            {props.children}
        </div>
    </components.Option>;
};
