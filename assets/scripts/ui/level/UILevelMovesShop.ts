declare const gamepush: any;

import { _decorator, Component, Node, Label, Button, assetManager, Sprite, SpriteFrame } from 'cc';
import { MovesShopStageData } from '../../data/GameData';
import { MovesShop } from '../../game/boosters/MovesShop';
import { Level } from '../../game/Level';
import { UserData } from '../../data/UserData';
import { Localization } from '../../utils/Localization';
const { ccclass, property } = _decorator;

@ccclass('UILevelMovesShop')
export class UILevelMovesShop extends Component {

    @property(MovesShop)
    movesShop: MovesShop = null;

    @property(Button)
    buyBtn: Button = null;
    @property(Button)
    showAdBtn: Button = null;
    @property(Button)
    closeBtn: Button = null;

    @property(Button)
    activateBpBtn: Button = null;

    @property(Node)
    bp_mini: Node = null;

    @property(Label)
    stageDataLabel: Label = null;
    @property(Label)
    additinalStageDataLabel: Label = null;
    @property(Label)
    buyBtnLabel: Label = null;
    @property(Label)
    goldLabel: Label = null;

    @property(Sprite)
    picture_1: Sprite = null;
    @property(Sprite)
    picture_2: Sprite = null;

    private data: MovesShopStageData = null;

    private state: number = 0;


    start() {
        this.buyBtn.node.on(Button.EventType.CLICK, this.onBuyBtnClick, this);
        this.showAdBtn.node.on(Button.EventType.CLICK, this.onShowAdBtnClick, this);
        this.closeBtn.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);

        this.activateBpBtn.node.on(Button.EventType.CLICK, this.onActivateBpBtnClick, this);

        this.loadAsstets();
    }

    refresh() {
        this.goldLabel.string = UserData.instance.getResource("gold");

        this.bp_mini.active = !UserData.instance.getIsPremium();

        if(this.movesShop.isMovesShopAvailable()) {
            this.data = this.movesShop.getStageData();

            const totalMoves = this.movesShop.getTotalMovesCount();

            this.stageDataLabel.string = Localization.instance.getLabelByKey("combat.failbuy") + " " + totalMoves + " " + Localization.instance.getLabelByKey("combat.failmoves"); 

            this.additinalStageDataLabel.string = "";
            if(this.isAdditionalDataAvailable(this.data)) {
                this.additinalStageDataLabel.string = "+";

                if(this.data.rockets > 0) {
                    this.additinalStageDataLabel.string += Localization.instance.getLabelByKey("combat.rocket") + " x" + this.data.rockets;
                }
                if(this.data.bombs > 0) {
                    this.additinalStageDataLabel.string += Localization.instance.getLabelByKey("combat.bomb") + " x" + this.data.bombs;
                }
                if(this.data.discoballs > 0) {
                    this.additinalStageDataLabel.string += Localization.instance.getLabelByKey("combat.dball") + " x" + this.data.discoballs;
                }
            }

            this.buyBtnLabel.string = this.data.price;

            this.buyBtn.node.active = this.data.price > 0;
            this.showAdBtn.node.active = this.data.price === 0;
        }
        else {
            this.additinalStageDataLabel.string = "";
            this.stageDataLabel.string = Localization.instance.getLabelByKey("combat.extramovesend");

            this.buyBtn.node.active = false;
        }
    }

    isAdditionalDataAvailable(data: MovesShopStageData): boolean {
        return data.rockets !== 0 || data.bombs !== 0 || data.discoballs !== 0;
    }


    onBuyBtnClick() {
        let isSuccess = this.movesShop.buyStage();

        if(isSuccess) {
            this.node.emit("buy");
        }
        else {
            //show mini gold shop
        }
    }

    async onShowAdBtnClick() {
        const success = await gamepush.ads.showRewardedVideo();
        if (success) {
            this.onBuyBtnClick();
        }
    }

    onCloseBtnClick() {
        if(this.state === 0) {
            this.node.emit("show_panel_lose_progress");

            this.state = this.state + 1;
        }
        else {
            this.node.emit("close");
        }
    }

    onActivateBpBtnClick() {
        UserData.instance.buyPremium();

        this.refresh();
    }


    setBasicState() {
        this.state = 0;
    }


    loadAsstets() {
        assetManager.loadBundle("start", (err, bundle) => {
            if (err) {
                console.error(`Failed to load bundle: start`, err);
                return;
            }

            console.log(`Successfully loaded bundle: start"`);


            bundle.load("fail_owl/spriteFrame", SpriteFrame, (err, spriteFrame) => {
                if (err) {
                    console.error(`Failed to load prefab: fail_owl`, err);
                    return;
                }

                console.log(`Successfully loaded prefab: fail_owl`);

                this.picture_1.spriteFrame = spriteFrame;
                this.picture_2.spriteFrame = spriteFrame;
            });
        });
    }
}


