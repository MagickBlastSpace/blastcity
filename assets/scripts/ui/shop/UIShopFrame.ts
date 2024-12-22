import { _decorator, Component, Node, Button, assetManager, Sprite, SpriteFrame } from 'cc';
import { UIShopItem } from './UIShopItem';
import { GameData, ShopItemData } from '../../data/GameData';
import { Shop } from '../../game/Shop';
import { UIFrameBase } from '../UIFrameBase';
import { UserData } from '../../data/UserData';
import { UIPopupReward } from '../UIPopupReward';
const { ccclass, property } = _decorator;

@ccclass('UIShopFrame')
export class UIShopFrame extends UIFrameBase {

    @property([UIShopItem])
    items: UIShopItem[] = [];
    @property([UIShopItem])
    bundles: UIShopItem[] = [];

    @property(Shop)
    shop: Shop = null;

    @property([Node])
    hiddenItems: Node[] = [];

    @property(Button)
    showHiddenBtn: Button = null;
    @property(Button)
    bpActivateBtn: Button = null;

    @property(Node)
    bpItem: Node = null;
    @property(Node)
    showHiddenItem: Node = null;

    @property(UIPopupReward)
    rewardPopup: UIPopupReward;

    @property(Sprite)
    picture_bp: Sprite = null;

    private isHiddenState: boolean = true;


    start() {
        for(let i = 0; i < this.items.length && i < GameData.instance.shopItems.length; i++) {
            this.items[i].init(GameData.instance.shopItems[i]);

            this.items[i].node.on("buy", (itemData) => this.buy(itemData));
        }

        for(let i = 0; i < this.bundles.length && i < GameData.instance.shopBundles.length; i++) {
            this.bundles[i].init(GameData.instance.shopBundles[i]);

            this.bundles[i].node.on("buy", (itemData) => this.buy(itemData));
        }

        this.shop.node.on("buy", (itemData) => this.showRewardPopup(itemData));

        this.bpActivateBtn.node.on(Button.EventType.CLICK, this.onBpActivateClick, this);
        this.showHiddenBtn.node.on(Button.EventType.CLICK, this.onShowHiddenClick, this);

        this.loadAsstets();
    }


    buy(data: ShopItemData) {
        this.shop.buy(data);
    }


    show() {
        super.show();

        this.isHiddenState = true;

        this.refresh();
    }


    refresh() {
        for(let i = 0; i < this.hiddenItems.length; i++) {
            this.hiddenItems[i].active = !this.isHiddenState;
        }

        this.showHiddenItem.active = this.isHiddenState;

        this.bpItem.active = !UserData.instance.getIsPremium();
    }


    onBpActivateClick() {
        UserData.instance.buyPremium();

        this.refresh();
    }

    onShowHiddenClick() {
        this.isHiddenState = false;

        this.refresh();
    }


    showRewardPopup(data: ShopItemData) {
        this.rewardPopup.show();

        this.rewardPopup.init_Shop(data);
    }


    loadAsstets() {
        assetManager.loadBundle("shop", (err, bundle) => {
            if (err) {
                console.error(`Failed to load bundle: shop`, err);
                return;
            }

            console.log(`Successfully loaded bundle: shop"`);


            bundle.load("banner_battlepass/spriteFrame", SpriteFrame, (err, spriteFrame) => {
                if (err) {
                    console.error(`Failed to load prefab: banner_battlepass`, err);
                    return;
                }

                console.log(`Successfully loaded prefab: banner_battlepass`);

                this.picture_bp.spriteFrame = spriteFrame;
            });
        });
    }
}


