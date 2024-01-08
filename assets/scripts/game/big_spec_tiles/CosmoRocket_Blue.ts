import { _decorator, Component, Node } from 'cc';
import { CosmoRocket } from './CosmoRocket';
const { ccclass, property } = _decorator;

@ccclass('CosmoRocket_Blue')
export class CosmoRocket_Blue extends CosmoRocket {

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
