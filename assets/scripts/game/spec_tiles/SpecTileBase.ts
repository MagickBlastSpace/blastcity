import { _decorator, Component, Node } from 'cc';
import { TileBase } from '../TileBase';
const { ccclass, property } = _decorator;

@ccclass('SpecTileBase')
export class SpecTileBase extends TileBase {

    private strength: number;
    private strengthType: string;

    private isDamaged: boolean;


    init(row: number, col: number, tileType: string) {
        this.row = row;
        this.col = col;
        this.tileType = tileType;

        this.isBonus = false;
        this.isEmpty = false;

        this.isDamaged = false;
    }


    destroyTile() {
        this.startDestroyConsequences();
        this.node.destroy();
    }

    onTouchStart(event: cc.Event.EventTouch) {}

    startDestroyConsequences() {}


    getDamage(damageType: string) {
        if(this.strengthType === "untouchable") {
            return;
        }
        else if(damageType === "bonus") {
            this.strength--;
        }
        else if((this.strengthType === "any" || this.strengthType === damageType) && !this.isDamaged) {
            this.strength--;
            this.isDamaged = true;
        }
    }


    isReadyToDestroy(): boolean {
        if(this.strength <= 0 && this.strengthType !== "untouchable") {
            return true;
        }
        return false;
    }


    checkSpecialCondition(): boolean {
        return false;
    }


    clear() {
        this.isDamaged = false;
    }
}


