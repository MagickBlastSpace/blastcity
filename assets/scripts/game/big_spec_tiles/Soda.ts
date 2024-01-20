import { _decorator, Component, Node } from 'cc';
import { BigTileBase } from './BigTileBase';
const { ccclass, property } = _decorator;

@ccclass('Soda')
export class Soda extends BigTileBase {

    @property([Node])
    hps: Node[] = [];


    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = false;
        this.isDoubleX = true;
        this.isDoubleY = true;

        this.strength = 4;

        this.refresh();
    }


    isReadyToDestroy(): boolean {
        if(this.strength <= 0) {
            return true;
        }
        return false;
    }


    refresh() {
        for(let i = 0; i < this.hps.length; i++) {
            this.hps[i].active = false;
        }

        for(let i = 0; i < this.strength && i < this.hps.length; i++) {
            this.hps[i].active = true;
        }
    }


    setAsDamaged() {
        super.setAsDamaged();

        this.node.emit("goal", "soda");
    }


    clearExtra() {
        this.isDamaged = false;
    }
}


