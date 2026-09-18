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

    private assetsLoaded: boolean = false;
    private assetsLoadPromise: Promise<void> = null;


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

        void this.preloadAssets();
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


    public async preloadAssets(): Promise<void> {
        if(this.assetsLoaded) {
            return;
        }

        if(this.assetsLoadPromise) {
            await this.assetsLoadPromise;
            return;
        }

        this.assetsLoadPromise = new Promise<void>((resolve) => {
            const loadBanner = (bundle: any) => {
                bundle.load("banner_battlepass/spriteFrame", SpriteFrame, (err, spriteFrame) => {
                    if(err) {
                        console.error("[SHOP] Failed to load battlepass banner", err);
                        this.assetsLoadPromise = null;
                        resolve();
                        return;
                    }

                    if(this.picture_bp) {
                        this.picture_bp.spriteFrame = spriteFrame;
                    }

                    this.assetsLoaded = true;
                    this.assetsLoadPromise = null;

                    console.log("[SHOP] Battlepass banner preloaded");
                    resolve();
                });
            };

            const loadedBundle = assetManager.getBundle("shop");

            if(loadedBundle) {
                loadBanner(loadedBundle);
                return;
            }

            assetManager.loadBundle("shop", (err, bundle) => {
                if(err) {
                    console.error("[SHOP] Failed to load bundle", err);
                    this.assetsLoadPromise = null;
                    resolve();
                    return;
                }

                loadBanner(bundle);
            });
        });

        await this.assetsLoadPromise;
    }
}


