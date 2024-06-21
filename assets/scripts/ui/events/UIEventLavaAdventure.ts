import { _decorator, Component, Node, Button, Label, tween, Vec3, Prefab, instantiate } from 'cc';
import { UIEventPopupFrameBase } from './UIEventPopupFrameBase';
const { ccclass, property } = _decorator;

@ccclass('UIEventLavaAdventure')
export class UIEventLavaAdventure extends UIEventPopupFrameBase {

    @property(Button)
    startBtn: Button = null;
    @property(Button)
    closeBtn: Button = null;
    @property(Button)
    closeBtn_2: Button = null;
    @property(Button)
    playBtn: Button = null;

    @property(Label)
    progressLabel: Label = null;
    @property(Label)
    playersLabel: Label = null;
    @property(Label)
    levelReqLabel: Label = null;
    @property(Label)
    timeLabel: Label = null;
    @property(Label)
    timeLabel_duplicate: Label = null;
    @property(Label)
    cooldownTimeLabel: Label = null;

    @property(Node)
    miniGame: Node = null;
    @property(Node)
    background: Node = null;
    @property(Node)
    player: Node = null;

    @property(Prefab)
    playerPrefab: Prefab = null;

    private bckg_start_Y: number = 1700;
    private bckg_total_length: number = 3400;

    private player_start_X: number = -368;
    private player_end_X: number = 368;
    private player_Y: number = -435;

    private isEventStarted = false;


    start() {
        this.startBtn.node.on(Button.EventType.CLICK, this.onStartBtnClick, this);
        this.closeBtn.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);
        this.closeBtn_2.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);

        this.playBtn.node.on(Button.EventType.CLICK, this.onPlayBtnClick, this);
    }

    update(deltaTime: number) {
        if(!this.isInited) {
            return;
        }

        this.timeLabel.string = this.eventController.getRemainingTimeString();
        this.timeLabel_duplicate.string = this.eventController.getRemainingTimeString();

        this.cooldownTimeLabel.string = this.eventController.getRemainingCooldownString();
    }


    refresh() {
        if(!this.isInited) {
            return;
        }

        this.destroyAllPlayers();

        this.eventController.refresh();

        this.isEventStarted = this.eventController.getIsStarted();

        this.miniGame.active = this.isEventStarted;

        if(this.isEventStarted) {
            this.progressLabel.string = "Level " + this.eventController.getCurrentStage() + "/" + this.eventController.getTotalSteps();

            let playersCount = this.eventController.getCollectable();
            this.playersLabel.string = "Players " + playersCount + "/100";

            for(let i = 0; i < playersCount; i++) {
                const newPlayerNode = instantiate(this.playerPrefab);
                this.player.addChild(newPlayerNode);
            }

            let bckg_Y = this.bckg_start_Y - (this.bckg_total_length / (this.eventController.getTotalSteps() - 1) * this.eventController.getCurrentStage());

            this.background.setPosition(0, this.bckg_start_Y);

            tween(this.background)
                .to(0.5, { position: new Vec3(0, bckg_Y, 0) })
                .start();

            let player_X = this.eventController.getCurrentStage() % 2 === 0 ? this.player_start_X : this.player_end_X;

            tween(this.player)
                .to(0.5, { position: new Vec3(player_X, this.player_Y, 0) })
                .start();
        }

        if(!this.eventController.isRequiredLevelReached()) {
            this.levelReqLabel.string = "Required Level " + this.eventController.getLevelRequired();
        }
        else {
            this.levelReqLabel.string = "";
        }
        
        this.startBtn.node.active = this.eventController.canParticipate() && !this.isEventStarted;
    }

    private destroyAllPlayers() {
        const children = this.player.children;

        for (let i = children.length - 1; i >= 0; i--) {
            children[i].destroy();
        }

        this.player.removeAllChildren();
    }


    show() {
        super.show();

        this.refresh();
    }


    onStartBtnClick() {
        if(!this.isInited) {
            return;
        }

        this.eventController.activateEvent();

        this.refresh();
    }

    onCloseBtnClick() {
        this.hide();
    }


    onPlayBtnClick() {
        this.hide();

        this.node.emit("play");
    }
}


