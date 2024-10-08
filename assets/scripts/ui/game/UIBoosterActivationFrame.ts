import { _decorator, Component, Node, Button, Label } from 'cc';
import { UIPopupFrameBase } from '../UIPopupFrameBase';
const { ccclass, property } = _decorator;

@ccclass('UIBoosterActivationFrame')
export class UIBoosterActivationFrame extends UIPopupFrameBase {

    @property([Button])
    closeBtns: Button[] = [];

    @property(Node)
    hammer: Node = null;
    @property(Node)
    bow: Node = null;
    @property(Node)
    cannon: Node = null;
    @property(Node)
    jester: Node = null;

    @property(Node)
    jesterBtn: Node = null;

    @property(Button)
    shuffleBtn: Button = null;

    @property(Label)
    description: Label = null;

    @property(Node)
    boosters: Node = null;


    start() {
        this.shuffleBtn.node.on(Button.EventType.CLICK, this.onShuffleBtnClick, this);

        for(let i = 0; i < this.closeBtns.length; i++) {
            this.closeBtns[i].node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);
        }
    }

    refresh(booster: string) {
        if(booster === "") {
            this.hide();
        }

        this.hideAllBoosterNodes();

        switch(booster) {
            case "hammer":
                this.description.string = "Коснись предмета, чтобы разбить его!";

                this.hammer.active = true;

                break;
            case "arrow":
                this.description.string = "Коснись строки, чтобы уничтожить её!";

                this.bow.active = true;
                
                break;
            case "cannon":
                this.description.string = "Коснись столбца, чтобы уничтожить его!";

                this.cannon.active = true;
                
                break;
            case "jester":
                this.description.string = "Нажми на кнопку, чтобы перемешать поле!";

                this.jester.active = true;

                this.jesterBtn.active = true;
                
                break;
        }

        this.show();
    }

    onCloseBtnClick() {
        let boostersComp = this.boosters.getComponent("Boosters");
        boostersComp.deactivateAll();
    }

    onShuffleBtnClick() {
        let boostersComp = this.boosters.getComponent("Boosters");
        boostersComp.setShuffleEvent();
    }


    hideAllBoosterNodes() {
        this.hammer.active = false;
        this.bow.active = false;
        this.cannon.active = false;
        this.jester.active = false;

        this.jesterBtn.active = false;
    }
}


