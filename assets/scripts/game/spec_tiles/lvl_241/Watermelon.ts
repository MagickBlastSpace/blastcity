import { _decorator, Component, Node } from 'cc';
import { Lamp } from '../lvl_51/Lamp';
const { ccclass, property } = _decorator;

@ccclass('Watermelon')
export class Watermelon extends Lamp {
    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.strength = 3;
        this.refresh();
    }
}


