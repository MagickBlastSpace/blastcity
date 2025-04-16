import { _decorator, Component, Node, Button } from 'cc';
import { UIPopupFrameBase } from '../UIPopupFrameBase';
import { UIShopItem } from './UIShopItem';
import { Shop } from '../../game/Shop';
import { GameData, ShopItemData } from '../../data/GameData';
const { ccclass, property } = _decorator;

@ccclass('UIMiniShopPopup')
export class UIMiniShopPopup extends UIPopupFrameBase {
    
    @property([UIShopItem])
    items: UIShopItem[] = [];

    @property(Shop)
    shop: Shop;

    @property(Button)
    closeBtn: Button = null;


    start() {
        for(let i = 0; i < this.items.length && i < GameData.instance.shopItems.length; i++) {
            this.items[i].init(GameData.instance.shopItems[i]);

            this.items[i].node.on("buy", (itemData) => this.buy(itemData));
        }

        this.closeBtn.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);
    }


    buy(data: ShopItemData) {
        this.shop.buy(data);
    }


    show() {
        super.show();

        this.refresh();
    }


    refresh() {}

    onCloseBtnClick() {
        this.hide();
    }
}


