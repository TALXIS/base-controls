import { useMemo } from "react";
import { Persona, PersonaSize } from "@fluentui/react";
import { components, OptionProps } from "react-select";
import { getDataValue } from "../getDataValue";
import { getPersonLookupManyOptionStyles } from "./styles";

/** Props for {@link PersonLookupManyOption}. */
export interface IPersonLookupManyOptionProps extends OptionProps<ComponentFramework.EntityReference, true, never> {
    /** The record field holding the person's picture; `imageurl` when left out. */
    imageUrlPropertyName?: string;
}

/** A person offered with their avatar. */
export const PersonLookupManyOption = (props: IPersonLookupManyOptionProps) => {
    const { imageUrlPropertyName = 'imageurl', ...optionProps } = props;
    const styles = useMemo(() => getPersonLookupManyOptionStyles(), []);
    return <components.Option {...optionProps}>
        <div className={styles.option}>
            <Persona text={props.data.name} imageUrl={getDataValue(props.data, imageUrlPropertyName)} size={PersonaSize.size24} hidePersonaDetails styles={{ root: { margin: 0 } }} />
            {props.children}
        </div>
    </components.Option>;
};
