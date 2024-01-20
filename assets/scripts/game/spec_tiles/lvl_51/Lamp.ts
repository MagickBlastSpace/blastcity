import { _decorator, Component, Node, Label } from 'cc';
import { SpecTileBase } from '../SpecTileBase';
const { ccclass, property } = _decorator;

@ccclass('Lamp')
export class Lamp extends SpecTileBase {

    @property(Node)
    hp: Node = null;


    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = true;
        this.strength = 2;
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
        this.hp.active = this.strength === 1;
    }

    startDestroyConsequences() {
        this.node.emit("goal", "lamp");
    }

    clearExtra() {
        this.isDamaged = false;
    }
}


