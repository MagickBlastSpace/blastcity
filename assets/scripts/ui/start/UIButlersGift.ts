import { _decorator, Component, Node, Sprite, ProgressBar, Label, tween } from 'cc';
import { ButlersGift } from '../../game/boosters/ButlersGift';
import { SpriteTileData } from '../../game/Tile';
const { ccclass, property } = _decorator;

@ccclass('UIButlersGift')
export class UIButlersGift extends Component {

    @property(Sprite)
    icon: Sprite = null;

    @property([SpriteTileData])
    commonIcons: SpriteTileData[] = [];

    @property(Label)
    progressLabel: Label = null;
    @property(ProgressBar)
    progressBar: ProgressBar = null;

    @property(ButlersGift)
    butlersGift: ButlersGift;

    @property(Node)
    unavailable: Node = null;


    start() {
        this.butlersGift.node.on("refresh", () => this.refresh());

        this.refresh();
    }
    
    refresh() {
        let streak = this.butlersGift.getStreak();
        let maxStreak = this.butlersGift.getMaxStreak();

        this.icon.spriteFrame = this.commonIcons.find(i => i.id === streak.toString())?.icon;
        this.progressLabel.string = streak + "/" + maxStreak;

        tween(this.progressBar)
            .to(0.8, { progress: streak / maxStreak })
            .start();

        if(this.unavailable) {
            this.unavailable.active = !this.butlersGift.isAvailable();
        }
    }
}


