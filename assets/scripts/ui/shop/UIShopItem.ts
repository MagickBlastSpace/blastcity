import { _decorator, Component, Node, Label, Button, tween, Vec3 } from 'cc';
import { ShopItemData } from '../../data/GameData';
const { ccclass, property } = _decorator;

@ccclass('UIShopItem')
export class UIShopItem extends Component {

    @property(Label)
    priceLabel: Label = null;

    @property(Label)
    gold: Label = null;

    @property(Label)
    hammer: Label = null;
    @property(Label)
    arrow: Label = null;
    @property(Label)
    cannon: Label = null;
    @property(Label)
    jester: Label = null;

    @property(Label)
    startBonuses: Label = null;
    @property(Label)
    lives: Label = null;

    @property(Button)
    buyBtn: Button = null;

    private itemData: ShopItemData = null;


    start() {
        this.buyBtn.node.on(Button.EventType.CLICK, this.onBtnBuyClick, this);
    }
    
    init(data: ShopItemData) {
        this.itemData = data;

        this.priceLabel.string = data.price + " Rub";

        if(this.gold) {
            this.gold.string = data.gold;
        }
        
        if(this.hammer) {
            this.hammer.string = "x" + data.booster_Hammer;
        }
        if(this.arrow) {
            this.arrow.string = "x" + data.booster_Bow;
        }
        if(this.cannon) {
            this.cannon.string = "x" + data.booster_Cannon;
        }
        if(this.jester) {
            this.jester.string = "x" + data.booster_Jester;
        }

        if(this.startBonuses) {
            let hours = data.bonuses_Minutes / 60;
            this.startBonuses.string = hours + "h";
        }
        if(this.lives) {
            let hours = data.endlessLives_Minutes / 60;
            this.lives.string = hours + "h";
        }
    }


    onBtnBuyClick() {
        this.node.emit("buy", this.itemData);

        tween(this.node)
            .to(0.05, { scale: new Vec3(0.92, 1.08, 1) }, { easing: 'linear' })
            .to(0.07, { scale: new Vec3(1.03, 0.97, 1) }, { easing: 'elasticInOut' })
            .to(0.07, { scale: new Vec3(0.97, 1.03, 1) }, { easing: 'elasticInOut' })
            .to(0.07, { scale: new Vec3(1, 1, 1) }, { easing: 'elasticInOut' })
            .start();
    }
}


