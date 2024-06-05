import { _decorator, Component, Node, Label, Button, tween, Vec3 } from 'cc';
import { ShopItemData } from '../../data/GameData';
const { ccclass, property } = _decorator;

@ccclass('UIShopItem')
export class UIShopItem extends Component {

    @property(Label)
    priceLabel: Label = null;

    @property(Button)
    buyBtn: Button = null;

    private itemData: ShopItemData = null;


    start() {
        this.buyBtn.node.on(Button.EventType.CLICK, this.onBtnBuyClick, this);
    }
    
    init(data: ShopItemData) {
        this.itemData = data;

        this.priceLabel.string = data.price + " Rub";
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


