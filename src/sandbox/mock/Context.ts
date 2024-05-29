import { Formatting } from "./Formatting";
import { Mode } from "./Mode";
import { UserSettings } from "./UserSettings";
import { Utility } from "./Utility";

export class Context implements Context {
    mode: ComponentFramework.Mode;
    userSettings: ComponentFramework.UserSettings;
    formatting: ComponentFramework.Formatting;
    utils: ComponentFramework.Utility;
    
    constructor() {
        this.mode = new Mode();
        this.userSettings = new UserSettings();
        this.formatting = new Formatting();
        this.utils = new Utility();
    }
}