import { useRef } from "react"
import { IEntity } from "../interfaces";
import { FetchXmlBuilder } from "@talxis/client-libraries";

export const useFetchXml = (context: ComponentFramework.Context<any>): [
    (viewId: string) => Promise<{ fetchxml: string, layoutjson: string }>,
    (entity: IEntity, fetchXml: string, query: string) => Promise<string>
] => {
    const cachedFetchXml = useRef<{
        [viewId: string]: Promise<any>
    }>({});

    const get = async (viewId: string): Promise<{ fetchxml: string, layoutjson: string }> => {
        if (!cachedFetchXml.current[viewId]) {
            cachedFetchXml.current[viewId] = context.webAPI.retrieveRecord('savedquery', viewId, '?$select=fetchxml,layoutjson');
        }

        return cachedFetchXml.current[viewId];
    }
    const applyLookupQuery = async (entity: IEntity, fetchXml: string, query: string): Promise<string> => {
        const parser = new DOMParser();
        const parsedFetchXml = parser.parseFromString(fetchXml, "application/xml");
        const conditions = parsedFetchXml.getElementsByTagName("condition");
        const placeholderConditions: Element[] = [];
        for (const cond of conditions) {
            if (cond.getAttribute('value') === "{0}") {
                if(query) {
                    cond.setAttribute('value', `%${query}%`);
                }
                placeholderConditions.push(cond);
            }
        }
        if (!query) {
            for (const cond of placeholderConditions) {
                const parentFilter = cond.parentElement;
                parentFilter?.removeChild(cond);
                if(parentFilter?.children.length === 0) {
                    const grandParent = parentFilter.parentElement;
                    grandParent?.removeChild(parentFilter);
                }
            }
            return new XMLSerializer().serializeToString(parsedFetchXml);
        }
        if (placeholderConditions.length > 0) {
            return new XMLSerializer().serializeToString(parsedFetchXml);
        }
        else {
            const metadata = await entity.metadata;
            const xmlObject = FetchXmlBuilder.fetch.fromXml(fetchXml);
            xmlObject.entity.addFilter(new FetchXmlBuilder.filter(FetchXmlBuilder.FilterType.Or, [
                new FetchXmlBuilder.condition(metadata.PrimaryNameAttribute, FetchXmlBuilder.Operator.Like, [new FetchXmlBuilder.value(`%${query}%`)])
            ]))
            return xmlObject.toXml();
        }
    }
    return [get, applyLookupQuery]
}