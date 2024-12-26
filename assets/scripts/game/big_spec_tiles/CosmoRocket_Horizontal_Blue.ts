import { _decorator, Component, Node } from 'cc';
import { CosmoRocket_Horizontal } from './CosmoRocket_Horizontal';
const { ccclass, property } = _decorator;

@ccclass('CosmoRocket_Horizontal_Blue')
export class CosmoRocket_Horizontal_Blue extends CosmoRocket_Horizontal {

    private fieldNode: Node = null;
    private destroyTileCallback: Function = null;

    subscribeOnFieldEvents(field: Node) {
        if(this.isSubscribed) {
            return;
        }
        
        super.subscribeOnFieldEvents(field);

        this.fieldNode = field;

        this.destroyTileCallback = (tileType) => {
            if(tileType === "blue") {
                this.getDamageFromEvent();
            }
        };

        field.on("destroy", this.destroyTileCallback);

        const fieldComp = field.getComponent("Field");

        let goals = fieldComp.getCosmorocketGoals();
        let curGoal = goals.find((goal) => goal.id === "blue");
        
        this.strength = curGoal.count === 0 ? this.strength : curGoal.count;

        this.refresh();
    }

    destroyTile() {
        if(this.fieldNode) {
            this.fieldNode.off("destroy", this.destroyTileCallback);
        }

        super.destroyTile();
    }

    destroyClear() {
        if(this.fieldNode) {
            this.fieldNode.off("destroy", this.destroyTileCallback);
        }

        super.destroyClear();
    }
}
