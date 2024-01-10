import { _decorator, Component, Node } from 'cc';
import { SpecTileBase } from '../SpecTileBase';
const { ccclass, property } = _decorator;

@ccclass('Tower')
export class Tower extends SpecTileBase {

    @property([Node])
    hpNodes: Node[] = [];


    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = false;
        this.strength = 4;
        this.refresh();
    }

    getDamage(damageType: string) {
        if(!this.isDamaged) {
            this.strength--;
            this.setAsDamaged();
        }

        this.refresh();
    }

    isReadyToDestroy(): boolean {
        if(this.strength <= 0) {
            return true;
        }
        return false;
    }


    refresh() {
        for(let i = 0; i < this.hpNodes.length; i++) {
            this.hpNodes[i].active = this.strength > i;
        }
    }

    startDestroyConsequences() {
        this.node.emit("goal", "tower");
    }
}


