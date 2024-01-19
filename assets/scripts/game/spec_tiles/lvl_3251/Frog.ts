import { _decorator, Component, Node } from 'cc';
import { Fish } from '../lvl_321/Fish';
const { ccclass, property } = _decorator;

@ccclass('Frog')
export class Frog extends Fish {
    isReadyToDestroy(): boolean {
        /*if(this.goalCount <= 0) {
            return true;
        }*/

        return false;
    }


    startInActionEffect(field: Node[][]): boolean {
        if(this.isGenerate) {
            if(this.goalCount > 1) {
                this.node.emit("status", "bubble");
                this.node.emit("status", "bubble");
            }
            else if(this.goalCount > 0) {
                this.node.emit("status", "bubble");
            }
        }

        return false;
    }


    subscribeOnFieldEvents(field: Node) {
        if(this.isSubscribed) {
            return;
        }
        
        this.isSubscribed = true;

        this.fieldNode = field;

        this.destroyTileCallback = (tileType) => {
            if(tileType === "bubble") {
                this.goalCount--;

                if(this.goalCount <= 0) {
                    this.node.emit("destroy_tile", this.getRow(), this.getCol());
                    this.node.emit("respawn", 0.2);
                }
            }
        };

        field.on("spawn", this.destroyTileCallback);
    }
}


