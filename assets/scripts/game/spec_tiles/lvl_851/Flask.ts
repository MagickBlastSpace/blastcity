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

        this.currentColorIndex = 0;
    }

    getDamage(damageType: string) {
        if(damageType === "bonus" || damageType === this.availableColors[this.currentColorIndex]) {
            this.strength--;
        }
    }

    startInActionEffect(field: Node[][]): boolean {
        this.setNextColor();

        return false;
    }


    subscribeOnFieldEvents(field: Node) {
        if(this.isSubscribed) {
            return;
        }
        
        super.subscribeOnFieldEvents(field);

        let fieldComp = field.getComponent("Field");
        this.availableColors = fieldComp.getAvailableColors();

        this.refresh();
    }


    setNextColor() {
        if(this.currentColorIndex >= this.availableColors.length - 1) {
            this.currentColorIndex = 0;
        }
        else {
            this.currentColorIndex++;
        }

        this.refresh();
    }

    refresh() {
        this.icon.spriteFrame = this.colorIcons.find(i => i.id === this.availableColors[this.currentColorIndex])?.icon;
    }


    startDestroyConsequences() {
        this.node.emit("goal", "flask");
    }


    getStrength(): number {
        return this.currentColorIndex;
    }

    setStrength(strength: number) {
        this.currentColorIndex = strength;

        this.refresh();
    }
}


