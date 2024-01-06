import { _decorator, Component, Node, Sprite } from 'cc';
import { Sticker } from '../lvl_6/Sticker';
import { SpriteTileData } from '../../Tile';
const { ccclass, property } = _decorator;

@ccclass('Flask')
export class Flask extends Sticker {

    @property(Sprite)
    icon: Sprite = null;

    @property([SpriteTileData])
    colorIcons: SpriteTileData[] = [];

    private availableColors: string[] = [];
    private currentColorIndex = 0;


    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isGenerate = false;
        this.currentColorIndex = 0;
    }

    getDamage(damageType: string) {
        if(damageType === "bonus" || damageType === this.availableColors[this.currentColorIndex]) {
            this.strength--;
            this.node.emit("damage_all", this.tileType);
        }
    }

    startInActionEffect(field: Node[][]): boolean {
        if(this.isDamaged) {
            this.setNextColor();
        }

        return true;
    }


    subscribeOnFieldEvents(field: Node) {
        let fieldComp = field.getComponent("Field");
        this.availableColors = fieldComp.getAvailableColors();

        this.refresh();
    }


    setNextColor() {
        if(this.currentColorIndex >= this.availableColors.length - 1) {
            this.currentColorIndex = 0;
        }
        this.currentColorIndex++;

        this.refresh();
    }

    refresh() {
        this.icon.spriteFrame = this.colorIcons.find(i => i.id === this.availableColors[this.currentColorIndex])?.icon;
    }
}


