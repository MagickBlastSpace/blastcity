import { _decorator, Component, Node, Button, Sprite } from 'cc';
import { SpriteTileData } from '../../../game/Tile';
const { ccclass, property } = _decorator;

@ccclass('UIEventMagicCauldronPredictionButton')
export class UIEventMagicCauldronPredictionButton extends Component {

    @property(Sprite)
    icon: Sprite = null;

    @property([SpriteTileData])
    iconsData: SpriteTileData[] = [];

    @property(Button)
    makeMoveBtn: Button = null;

    private currentColor: string = "";


    start() {
        this.makeMoveBtn.node.on(Button.EventType.CLICK, this.onMakeMoveBtnClick, this);
    }


    refresh(color: string, predictions: string[]) {
        this.currentColor = color;
        
        this.node.active = !predictions.includes(color);

        this.icon.spriteFrame = this.iconsData.find(i => i.id === color)?.icon;
    }


    onMakeMoveBtnClick() {
        this.node.emit("move", this.currentColor);
    }
}


