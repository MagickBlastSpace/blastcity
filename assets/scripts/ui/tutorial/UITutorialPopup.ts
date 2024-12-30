import { _decorator, Component, Node, Label, Button } from 'cc';
import { UIFrameBase } from '../UIFrameBase';
import { UIPopupFrameBase } from '../UIPopupFrameBase';
import { Field } from '../../game/Field';
import { Localization } from '../../utils/Localization';
const { ccclass, property } = _decorator;

@ccclass('UITutorialPopup')
export class UITutorialPopup extends UIPopupFrameBase {

    @property(Label)
    description: Label = null;

    @property(Node)
    isActive: Node = null;
    @property(Node)
    shadow: Node = null;

    @property(Node)
    level: Node = null;
    @property(Field)
    field: Field;

    /*@property(Button)
    btnContinue: Button = null;*/

    @property(Localization)
    l10n: Localization;


    start() {
        this.level.on("tutorial", (tutorialString) => this.init(tutorialString));
        this.level.on("destroy", (id) => this.onBtnContinueClick());

        //this.btnContinue.node.on(Button.EventType.CLICK, this.onBtnContinueClick, this);

        this.hideClean();
    }

    init(tutorialString: string) {
        if(tutorialString === "") {
            this.hideClean();

            this.shadow.active = false;

            return;
        }

        console.log("Getting Tutorial Label: " + tutorialString);
        this.description.string = this.l10n.getLabelByKey(tutorialString);

        this.show();
    }


    onBtnContinueClick() {
        this.hide();
    }

    
    show() {
        super.show();

        this.shadow.active = true;
    }
    
    hide() {
        super.hide();

        this.shadow.active = false;

        this.field.resetTutorial();
    }
}


