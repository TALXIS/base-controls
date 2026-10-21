import { Liquid } from "liquidjs";
import type { IDataverseUserQueriesProviderParameters } from "./DataverseUserQueriesProvider";

const FETCH_XML = `
<fetch>
    <entity name="{{ table.name }}">
        {% for attribute in attributes %}
        <attribute name="{{ attribute }}" />
        {% endfor %}
        <filter type="and">
            <condition attribute="{{ table.fieldMapping.returnedTypeCode }}" operator="eq" value="{{ entityName }}" />
            {% if ownerId %}
            <condition attribute="ownerid" operator="eq" value="{{ ownerId }}" />
            {% endif %}
            {% if table.fieldMapping.recordId %}
            {% if recordId %}
            <condition attribute="{{ table.fieldMapping.recordId }}" operator="eq" value="{{ recordId }}" />
            {% else %}
            <condition attribute="{{ table.fieldMapping.recordId }}" operator="null" />
            {% endif %}
            {% endif %}
        </filter>
        <order attribute="{{ table.fieldMapping.name }}" />
    </entity>
</fetch>
`;

//the values land inside FetchXML attributes
const LIQUID = new Liquid({ outputEscape: 'escape' });

//the user's views of the entity, with only these attributes
export const renderViewsFetchXml = (parameters: IDataverseUserQueriesProviderParameters, attributes: string[] = []): string => LIQUID.parseAndRenderSync(FETCH_XML, { ...parameters, attributes });
