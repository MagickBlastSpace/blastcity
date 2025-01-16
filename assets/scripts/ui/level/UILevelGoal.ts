import { _decorator, Component, Node, Label, Sprite, SpriteFrame, Vec2, Vec3, UITransform, assetManager } from 'cc';
import { GoalData } from '../../data/GameData';
const { ccclass, property } = _decorator;

@ccclass('UILevelGoal')
export class UILevelGoal extends Component {

    @property(Label)
    count: Label = null;

    @property(Sprite)
    icon: Sprite = null;

    private goalId: string = "";

    
    refresh(goal: GoalData) {
        if(goal.id === "common") {
            this.node.active = false;
            return;
        }
        
        this.node.active = true;
        this.count.string = goal.count;

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


    getPosition(): Vec2 {
        let worldPosition = new Vec3(0, 0, 0);
        
        const parent = this.node.parent;
        const uiTransform = this.node.getComponent(UITransform);
        
        if (parent && uiTransform) {
            const parentUITransform = parent.getComponent(UITransform);
            if (parentUITransform) {
                worldPosition = parentUITransform.convertToWorldSpaceAR(new Vec3(this.node.position.x, this.node.position.y, 0));
            } else {
                console.error("UITransform component is missing on parent node");
            }
        } else {
            console.error("UITransform component is missing on this node or node has no parent");
        }
    
        return new Vec2(worldPosition.x, worldPosition.y);
    }
        
        
    getGoalId(): string {
        return this.goalId;
    }
}


