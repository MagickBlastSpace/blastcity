import { _decorator, Component, Node, Label } from 'cc';
import { UIFrameBase } from '../UIFrameBase';
const { ccclass, property } = _decorator;

@ccclass('UITutorialPopup')
export class UITutorialPopup extends Component {

    @property(Label)
    description: Label = null;

    @property(Node)
    isActive: Node = null;

    @property(Node)
    level: Node = null;


    start() {
        this.level.on("tutorial", (tutorialString) => this.init(tutorialString));
        this.level.on("destroy", (id) => this.checkTutorialCompletion(id));

        this.show(false);
    }

    init(tutorialString: string) {
        this.show(tutorialString !== "");

        this.description.string = tutorialString;
    }


    checkTutorialCompletion(id: string) {
        if(id === "tutorial") {
            this.show(false);
        }
    }

    show(isActive: boolean) {
        this.isActive.active = isActive;
    }
}


