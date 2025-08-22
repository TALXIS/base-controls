import { Client } from "@talxis/client-libraries";
import { IRibbon } from "./interfaces";

interface IRibbonModelDeps {
    getProps: () => IRibbon;
}

const client = new Client();

export class RibbonModel {

    public getIconUrl(iconName: string) {
        if (client.isTalxisPortal()) {
            return iconName;
        }
        const array = iconName.split('$webresource:');
        return `https://${window.location.host}${window.Xrm.Utility.getGlobalContext().getWebResourceUrl(array[1] ?? iconName)}`
    }

    public getIconType(iconName: string): 'url' | 'fluent' {
        if(iconName.includes('.')) {
            return 'url';
        }
        return 'fluent'
    }
}