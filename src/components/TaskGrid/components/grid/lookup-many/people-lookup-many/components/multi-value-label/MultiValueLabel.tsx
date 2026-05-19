import * as React from 'react';
import { Link, Persona, PersonaSize, TooltipHost } from '@fluentui/react';
import { MultiValueGenericProps } from 'react-select';
import { getMultiValueLabelStyles } from './styles';
import { usePeopleLookupManyProps } from '../../context';

export const MultiValueLabel = ({ data, selectProps }: MultiValueGenericProps<ComponentFramework.EntityReference, boolean, any>) => {
    const styles = React.useMemo(() => getMultiValueLabelStyles(), []);
    const {imageUrlPropertyName = 'imageurl'} = usePeopleLookupManyProps();
    const { onNavigate } = selectProps as any;
    const imageUrl = (data as any).rawData?.[imageUrlPropertyName] ?? undefined;


    const persona = (
        <TooltipHost content={data.name}>
            <Persona
                text={data.name}
                size={PersonaSize.size24}
                imageUrl={imageUrl}
                hidePersonaDetails
                styles={{ root: styles.persona }}
            />
        </TooltipHost>
    );

    if (onNavigate) {
        return (
            <Link
                onClick={(e) => {
                    e.preventDefault();
                    onNavigate(data);
                }}
            >
                {persona}
            </Link>
        );
    }

    return <>{persona}</>;
};
