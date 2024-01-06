import { _decorator, Component, Node } from 'cc';
import { Coconut } from '../lvl_1401/Coconut';
const { ccclass, property } = _decorator;

@ccclass('Tomb')
export class Tomb extends Coconut {
    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = false;
    }

    refresh() {
        this.hp.active = this.strength === 2;
    }
}


