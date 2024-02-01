import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
import { Soda } from '../Soda';
import { SpriteTileData } from '../../Tile';
const { ccclass, property } = _decorator;

@ccclass('BigFlask')
export class BigFlask extends Soda {

    @property([Sprite])
    icons: Sprite[] = [];

    @property([SpriteTileData])
    colorIcons: SpriteTileData[] = [];

    private availableColors: string[] = [];
    private currentColorIndex = 0;

    private isBlockingDamage: boolean = false;


    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isTripleX = true;
        this.isTripleY = true;

        this.strength = 8;
        this.currentColorIndex = 0;

        this.isBlockingDamage = false;

        this.refresh();
    }


    getDamage(damageType: string) {
        if(this.isBlockingDamage) {
            return;
        }

        if(damageType === "bonus" || damageType === this.availableColors[this.currentColorIndex]) {
            this.strength--;
            this.isBlockingDamage = true;

            this.node.emit("goal", "big_flask");

            this.refresh();
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

        this.clear();
    }

    refresh() {
        super.refresh();

        for(let i = 0; i < this.icons.length; i++) {
            this.icons[i].spriteFrame = this.colorIcons.find(i => i.id === this.availableColors[this.currentColorIndex])?.icon;
        }
    }


    clear() {
        super.clear();

        this.isBlockingDamage = false;
    }

    clearExtra() {
        this.isBlockingDamage = false;
    }
}


