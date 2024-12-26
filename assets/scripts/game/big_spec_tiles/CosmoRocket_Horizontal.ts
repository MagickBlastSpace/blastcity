import { _decorator, Component, Node, Label } from 'cc';
import { BigTileBase } from './BigTileBase';
const { ccclass, property } = _decorator;


@ccclass('CosmoRocket_Horizontal')
export class CosmoRocket_Horizontal extends BigTileBase {

    @property(Label)
    hpLabel: Label = null;

    private extraDamage: number = 5;


    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = false;
        this.isDoubleX = true;
        this.isDoubleY = false;
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
        this.playAnimation("rocket_horizontal", false, 1);

        this.rowExtraHit();

        this.node.emit("goal", "cosmorocket");
    }


    setRespawnEvent(timeToRespawn: number) {
        this.node.emit("respawn", timeToRespawn);
    }


    rowExtraHit() {
        for(let j = this.getCol(); j < 9; j++) {
                this.node.emit("increased_extra_hit", this.getRow(), j, this.extraDamage);
        }

        for(let j = this.getCol() - 1; j >= 0; j--) {
                this.node.emit("increased_extra_hit", this.getRow(), j, this.extraDamage);
        }
    }
}


