import { _decorator, Component, Node, Label, Button } from 'cc';
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
    }
}


