import { _decorator, Component, Node, Label, Button } from 'cc';
import { UIFrameBase } from '../UIFrameBase';
import { UIPopupFrameBase } from '../UIPopupFrameBase';
import { Field } from '../../game/Field';
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

    @property(Button)
    btnContinue: Button = null;


    start() {
        this.level.on("tutorial", (tutorialString) => this.init(tutorialString));

        this.btnContinue.node.on(Button.EventType.CLICK, this.onBtnContinueClick, this);

        this.hideClean();
    }

    init(tutorialString: string) {
        if(tutorialString === "") {
            this.hideClean();

            this.shadow.active = false;

            return;
        }

        this.description.string = tutorialString;

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


