import { _decorator, Component, Node } from 'cc';
import { UIShopItem } from './UIShopItem';
import { GameData, ShopItemData } from '../../data/GameData';
import { Shop } from '../../game/Shop';
import { UIFrameBase } from '../UIFrameBase';
const { ccclass, property } = _decorator;

@ccclass('UIShopFrame')
export class UIShopFrame extends UIFrameBase {

    @property([UIShopItem])
    items: UIShopItem[] = [];

    @property(Shop)
    shop: Shop = null;


    start() {
        for(let i = 0; i < this.items.length && i < GameData.instance.shopItems.length; i++) {
            this.items[i].init(GameData.instance.shopItems[i]);

            this.items[i].node.on("buy", (itemData) => this.buy(itemData));
        }
    }


    buy(data: ShopItemData) {
        this.shop.buy(data);
    }
}


