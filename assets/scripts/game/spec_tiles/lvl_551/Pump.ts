import { _decorator, Component, Node } from 'cc';
import { SpecTileBase } from '../SpecTileBase';
const { ccclass, property } = _decorator;

@ccclass('Pump')
export class Pump extends SpecTileBase {

    private isGenerate: boolean = false;

    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = false;
        this.isGrouped = true;
        this.isGenerate = false;
    }

    getDamage(damageType: string) {
        if(this.isDamaged) {
            return;
        }
        this.setAsDamaged();

        this.isGenerate = true;
    }

    startInActionEffect(field: Node[][]): boolean {
        if(this.isGenerate) {
            this.node.emit("special", "sticker");

            let tiles = this.getGroupedTiles(field);
            tiles.forEach(tile => {
                let tileComponent = tile.getComponent("Pump");
                tileComponent.clearGenerate();
            })
        }

        return true;
    }

    clearGenerate() {
        this.isGenerate = false;
    }
}


