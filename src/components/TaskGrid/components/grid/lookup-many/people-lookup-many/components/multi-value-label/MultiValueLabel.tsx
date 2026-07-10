import * as React from 'react';
import { Persona, PersonaSize, TooltipHost } from '@fluentui/react';
import { MultiValueGenericProps } from 'react-select';
import { getMultiValueLabelStyles } from './styles';
import { usePeopleLookupManyProps } from '../../context';
import { MultiValueLabel as MultiValueLabelBase } from '../../../components/multi-value-label';

export const MultiValueLabel = (props: MultiValueGenericProps<ComponentFramework.EntityReference, boolean, any>) => {
    const styles = React.useMemo(() => getMultiValueLabelStyles(), []);
    const {imageUrlPropertyName = 'imageurl'} = usePeopleLookupManyProps();
    const imageUrl = (props.data as any).rawData?.[imageUrlPropertyName] ?? undefined;

    const persona = (
        <TooltipHost content={props.data.name}>
            <Persona
                imageShouldFadeIn={false}
                text={props.data.name}
                size={PersonaSize.size24}
                imageUrl={imageUrl}
                hidePersonaDetails
                styles={{ root: styles.persona }}
            />
        </TooltipHost>
    );

    return <MultiValueLabelBase {...props}>
        {persona}
    </MultiValueLabelBase>
};
