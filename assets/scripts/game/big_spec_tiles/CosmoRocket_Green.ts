import { _decorator, Component, Node } from 'cc';
import { CosmoRocket } from './CosmoRocket';
const { ccclass, property } = _decorator;

@ccclass('CosmoRocket_Green')
export class CosmoRocket_Green extends CosmoRocket {

    private fieldNode: Node = null;
    private destroyTileCallback: Function = null;

    subscribeOnFieldEvents(field: Node) {
        if(this.isSubscribed) {
            return;
        }
        
        super.subscribeOnFieldEvents(field);

        this.fieldNode = field;

        this.destroyTileCallback = (tileType) => {
            if(tileType === "green") {
                this.getDamageFromEvent();
            }
        };

        field.on("destroy", this.destroyTileCallback);

        const fieldComp = field.getComponent("Field");

        let goals = fieldComp.getCosmorocketGoals();
        let curGoal = goals.find((goal) => goal.id === "green");
        
        this.strength = curGoal.count === 0 ? this.strength : curGoal.count;

        this.refresh();
    }

    destroyTile() {
        this.fieldNode.off("destroy", this.destroyTileCallback);

        super.destroyTile();
    }

    destroyClear() {
        this.fieldNode.off("destroy", this.destroyTileCallback);

        super.destroyClear();
    }
}
