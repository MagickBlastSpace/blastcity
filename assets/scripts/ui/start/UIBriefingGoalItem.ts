import { _decorator, Component, Node, Label, Sprite, SpriteFrame, assetManager } from 'cc';
import { GoalData } from '../../data/GameData';
const { ccclass, property } = _decorator;

@ccclass('UIBriefingGoalItem')
export class UIBriefingGoalItem extends Component {

    @property(Sprite)
    icon: Sprite = null;

    @property(Node)
    isComplete: Node = null;
    @property(Node)
    isFailed: Node = null;

    private goalId: string = "";

    
    refresh(goal: GoalData) {
        if(goal.id === "common") {
            this.node.active = false;
            return;
        }

        this.isComplete.active = goal.count === 0 && goal.id !== "coin";
        this.isFailed.active = goal.count > 0 ;
        
        this.node.active = true;

        if(this.goalId !== goal.id) {
            assetManager.loadBundle("goals", (err, bundle) => {
                if (err) {
                    console.error(`Failed to load bundle: goals: `, err);
                    return;
                }
    
                console.log(`Successfully loaded bundle: goals`);
    
                bundle.load(goal.id + "_goal" + "/spriteFrame", SpriteFrame, (err, spriteFrame) => {
                    if (err) {
                        console.error(`Failed to load prefab: ` + goal.id, err);
                        return;
                    }
    
                    console.log(`Successfully loaded prefab: ` + goal.id + "_goal");
    
                    this.icon.spriteFrame = spriteFrame;
                });
            });
        }

        this.goalId = goal.id;
    }
}


