import { _decorator, Component, Node, Label, Sprite, SpriteFrame } from 'cc';
import { GoalData } from '../../data/GameData';
import { SpriteTileData } from '../../game/Tile';
const { ccclass, property } = _decorator;

@ccclass('UILevelGoal')
export class UILevelGoal extends Component {

    @property(Label)
    count: Label = null;

    @property(Sprite)
    icon: Sprite = null;

    @property([SpriteTileData])
    icons: SpriteTileData[] = [];

    
    refresh(goal: GoalData) {
        if(goal.id === "common") {
            this.node.active = false;
            return;
        }
        
        this.node.active = true;
        this.icon.spriteFrame = this.icons.find(i => i.id === goal.id)?.icon;
        this.count.string = goal.count;
    }
}


