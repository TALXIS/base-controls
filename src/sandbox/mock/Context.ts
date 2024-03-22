import { IContext } from "../../interfaces";
import { Formatting } from "./Formatting";
import { Mode } from "./Mode";
import { UserSettings } from "./UserSettings";

export class Context implements IContext {
    mode: ComponentFramework.Mode;
    userSettings: ComponentFramework.UserSettings;
    formatting: ComponentFramework.Formatting;
    
    constructor() {
        this.mode = new Mode();
        this.userSettings = new UserSettings();
        this.formatting = new Formatting();
    }
}