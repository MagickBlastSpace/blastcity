import { _decorator, Component, Node, Label } from 'cc';
import { BigTileBase } from './BigTileBase';
const { ccclass, property } = _decorator;


@ccclass('CosmoRocket')
export class CosmoRocket extends BigTileBase {

    @property(Label)
    hpLabel: Label = null;

    private extraDamage: number = 5;


    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = false;
        this.isDoubleX = false;
        this.isDoubleY = true;
        this.strength = 8;

        this.refresh();
    }


    isReadyToDestroy(): boolean {
        if(this.strength <= 0) {
            return true;
        }
        return false;
    }

    getDamage(damageType: string) {}

    getDamageFromEvent() {
        if(this.strength <= 0) {
            return;
        }
        this.strength--;
        this.refresh();
    }

    refresh() {
        this.hpLabel.string = this.strength;
    }


    startDestroyConsequences() {
        this.playAnimation("rocket_vertical", false, 1);

        this.colExtraHit();

        this.node.emit("goal", "cosmorocket");
    }


    setRespawnEvent(timeToRespawn: number) {
        this.node.emit("respawn", timeToRespawn);
    }


    colExtraHit() {
        for(let j = this.getRow(); j < 9; j++) {
                this.node.emit("increased_extra_hit", j, this.getCol(), this.extraDamage);
        }

        for(let j = this.getRow() - 1; j >= 0; j--) {
                this.node.emit("increased_extra_hit", j, this.getCol(), this.extraDamage);
        }
    }
}


