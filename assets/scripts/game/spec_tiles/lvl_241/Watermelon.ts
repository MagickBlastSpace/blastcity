import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
import { Lamp } from '../lvl_51/Lamp';
const { ccclass, property } = _decorator;

@ccclass('Watermelon')
export class Watermelon extends Lamp {

    @property(Sprite)
    picture: Sprite = null;

    @property(SpriteFrame)
    hp3: SpriteFrame | null = null;
    @property(SpriteFrame)
    hp2: SpriteFrame | null = null;
    @property(SpriteFrame)
    hp1: SpriteFrame | null = null;

    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.strength = 3;
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
        }
    }

    startDestroyConsequences() {
        this.node.emit("goal", "watermelon");
    }
}


