import { _decorator, Component, Node, Button, Sprite, tween, Vec3 } from 'cc';
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

        this.icon.spriteFrame = this.iconsData.find(i => i.id === color)?.icon;
        
        if(predictions.includes(color)) {
            tween(this.node).stop();
            tween(this.node)
                .to(0.3, { scale: new Vec3(0, 0, 0) }, { easing: 'backIn' })
                .start();
        }
        else if(!predictions.includes(color)) {
            tween(this.node).stop();
            
            tween(this.node)
                .to(0.3, { scale: new Vec3(1, 1, 1) }, { easing: 'backIn' })
                .start();
        }
    }


    onMakeMoveBtnClick() {
        this.node.emit("move", this.currentColor);
    }
}


