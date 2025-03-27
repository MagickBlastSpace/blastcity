import { _decorator, Component, Node } from 'cc';
import * as i18n from '../../../extensions/i18n/assets/LanguageData';
const { ccclass, property } = _decorator;

@ccclass('Localization')
export class Localization extends Component {

    public static instance: Localization = null;


    onLoad() {
        Localization.instance = this;
    }

    start() {
        this.setLanguage("ru");
    }

    setLanguage(langId: string) {
        //i18n.setLanguage(langId);
        //const i18n = require('LanguageData');
        i18n.init(langId);
        i18n.updateSceneRenderers();
    }


    getLabelByKey(key: string): string {
        return i18n.t(key);
    }
}


