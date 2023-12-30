import { _decorator, Component, Node } from 'cc';
import { CosmoRocket } from './CosmoRocket';
const { ccclass, property } = _decorator;

@ccclass('CosmoRocket_Green')
export class CosmoRocket_Green extends CosmoRocket {

    private fieldNode: Node = null;
    private destroyTileCallback: Function = null;

    subscribeOnFieldEvents(field: Node) {
        this.fieldNode = field;

        this.destroyTileCallback = (tileType) => {
            if(tileType === "green") {
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
