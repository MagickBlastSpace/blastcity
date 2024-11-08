import { _decorator, Component, Node, Label, Sprite, SpriteFrame } from 'cc';
import { PlayerEventData } from '../../data/EventData';
const { ccclass, property } = _decorator;

@ccclass('UIEventMinifiedPlayerItem')
export class UIEventMinifiedPlayerItem extends Component {

    @property(Label)
    playerName: Label = null;
    @property(Label)
    progressLabel: Label = null;

    @property(Sprite)
    placeIcon: Sprite = null;
    @property([SpriteFrame])
    placeIcons: SpriteFrame[] = [];

    private index: number = 0;


    init(index: number) {
        this.index = index;
    }
    
    refresh(data: PlayerEventData) {
        this.playerName.string = data.playerName;
        this.progressLabel.string = data.progressValue;

        if(this.placeIcon && this.placeIcon !== undefined) {
            if(this.index > 2 || this.index < 0) {
                this.placeIcon.spriteFrame = null;
            }
            else if(this.index > this.placeIcons.length - 1) {

            }
            else {
                this.placeIcon.spriteFrame = this.placeIcons[this.index];
            }
        }
    }
}


