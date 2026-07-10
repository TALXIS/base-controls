import * as React from 'react';
import { components, OptionProps } from 'react-select';
import { Persona, PersonaSize } from '@fluentui/react';
import { usePeopleLookupManyProps } from '../../context';
import { getOptionStyles } from './styles';

export const Option = (props: OptionProps<ComponentFramework.EntityReference, boolean, any>) => {
    const { imageUrlPropertyName = 'imageurl' } = usePeopleLookupManyProps();
    const styles = React.useMemo(() => getOptionStyles(), []);
    const imageUrl = (props.data as any).rawData?.[imageUrlPropertyName] ?? undefined;

    return (
        <components.Option {...props}>
            <div style={styles.container}>
                <Persona
                    text={props.data.name}
                    size={PersonaSize.size32}
                    imageUrl={imageUrl}
                    hidePersonaDetails
                    styles={{ root: styles.persona }}
                />
                {props.children}
            </div>
        </components.Option>
    );
};
