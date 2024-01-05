import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
import { Watermelon } from '../lvl_241/Watermelon';
const { ccclass, property } = _decorator;

@ccclass('Penguin')
export class Penguin extends Watermelon {
    @property(SpriteFrame)
    hp4: SpriteFrame | null = null;

    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.strength = 4;
        this.refresh();
    }

    refresh() {
        switch(this.strength) {
            case 1:
                this.picture.spriteFrame = this.hp1;
                break;
            case 2:
                this.picture.spriteFrame = this.hp2;
                break;
            case 3:
                this.picture.spriteFrame = this.hp3;
                break;
            case 4:
                this.picture.spriteFrame = this.hp4;
                break;
        }
    }
}


