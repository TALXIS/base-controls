
import { ILookup } from "./interfaces";
import { useLookup } from "./useLookup";
import React from 'react';

export const Lookup = (props: ILookup) => {
    const parameters = props.parameters;
    const context = props.context;
    const value = parameters.value;
    const [entities] = useLookup(props);
    if(!entities) {
        return <></>
    }
    return (
        <div>
            {JSON.stringify(entities)}
        </div>
    );
};