import { _decorator, Component, Node, Label } from 'cc';
import { BigTileBase } from './BigTileBase';
const { ccclass, property } = _decorator;


@ccclass('CosmoRocket')
export class CosmoRocket extends BigTileBase {
    @property(Label)
    hpLabel: Label = null;

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


    startDestroyConsequences(): void {
        this.node.emit("change_bonus", this.getRow(), this.getCol(), "rocket_vertical", 0.2);
        this.setRespawnEvent(0.5);

        this.node.emit("goal", "cosmorocket");
    }


    setRespawnEvent(timeToRespawn: number) {
        this.node.emit("respawn", timeToRespawn);
    }
}


