import { _decorator, Component, Node, Label, Button } from 'cc';
import { UIEventPopupFrameBase } from '../UIEventPopupFrameBase';
import { UIShopItem } from '../../shop/UIShopItem';
import { GameData, ShopItemData } from '../../../data/GameData';
const { ccclass, property } = _decorator;

@ccclass('UIEventClanGift')
export class UIEventClanGift extends UIEventPopupFrameBase {

    @property([UIShopItem])
    bundles: UIShopItem[] = [];

    @property(Button)
    closeBtn: Button = null;

    @property(Label)
    timeLabel: Label = null;


    start() {
        for(let i = 0; i < this.bundles.length && i < GameData.instance.shopBundles.length; i++) {
            this.bundles[i].init(GameData.instance.clanGiftBundles[i]);

            this.bundles[i].node.on("buy", (itemData) => this.buy(itemData, i));
        }

        this.closeBtn.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);
    }


    update(deltaTime: number) {
        /*if(!this.isInited) {
            return;
        }*/
        
        this.timeLabel.string = this.eventController.getRemainingTimeString();
    }


    buy(data: ShopItemData, index: number) {
        this.eventController.takeReward(data, index);
    }


    show() {
        super.show();

        this.refresh();
    }


    refresh() {
        for(let i = 0; i < this.bundles.length; i++) {
            this.bundles[i].node.active = !this.eventController.isRewardTaken(i);
        }
    }


    onCloseBtnClick() {
        this.hide();
    }
}


