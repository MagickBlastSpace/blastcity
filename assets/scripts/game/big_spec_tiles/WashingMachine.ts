import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
import { Jars } from './Jars';
const { ccclass, property } = _decorator;

@ccclass('WashingMachine')
export class WashingMachine extends Jars {

    @property(Sprite)
    picture: Sprite = null;

    @property(SpriteFrame)
    hp5: SpriteFrame | null = null;
    @property(SpriteFrame)
    hp4: SpriteFrame | null = null;
    @property(SpriteFrame)
    hp3: SpriteFrame | null = null;
    @property(SpriteFrame)
    hp2: SpriteFrame | null = null;
    @property(SpriteFrame)
    hp1: SpriteFrame | null = null;


    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.strength = 5;
        this.refresh();
    }

    getDamage(damageType: string) {
        if(this.isDamaged) {
            return;
        }

        this.strength--;

        this.setAsDamaged();

        this.refresh();
    }

    startDestroyConsequences() {
        this.node.emit("status_static", this.row, this.col, "bubble");
        this.node.emit("status_static", this.row + 1, this.col, "bubble");
        this.node.emit("status_static", this.row, this.col + 1, "bubble");
        this.node.emit("status_static", this.row - 1, this.col, "bubble");
        this.node.emit("status_static", this.row, this.col - 1, "bubble");
        this.node.emit("status_static", this.row + 1, this.col + 1, "bubble");
        this.node.emit("status_static", this.row + 1, this.col - 1, "bubble");
        this.node.emit("status_static", this.row - 1, this.col + 1, "bubble");
        this.node.emit("status_static", this.row - 1, this.col - 1, "bubble");

        this.node.emit("status_static", this.row + 2, this.col, "bubble");
        this.node.emit("status_static", this.row + 2, this.col + 1, "bubble");
        this.node.emit("status_static", this.row + 2, this.col - 1, "bubble");
        this.node.emit("status_static", this.row + 2, this.col + 2, "bubble");
        this.node.emit("status_static", this.row, this.col + 2, "bubble");
        this.node.emit("status_static", this.row + 1, this.col + 2, "bubble");
        this.node.emit("status_static", this.row - 1, this.col + 2, "bubble");

        this.node.emit("goal", "washing_machine");
    }

    clearExtra() {
        this.isDamaged = false;
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
            case 5:
                this.picture.spriteFrame = this.hp5;
                break;
        }
    }
}


