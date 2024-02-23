import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
import { Soda } from '../Soda';
import { SpriteTileData } from '../../Tile';
const { ccclass, property } = _decorator;

@ccclass('BigFlask')
export class BigFlask extends Soda {

    @property([Sprite])
    icons: Sprite[] = [];

    @property([SpriteTileData])
    colorIcons_1: SpriteTileData[] = [];
    @property([SpriteTileData])
    colorIcons_2: SpriteTileData[] = [];
    @property([SpriteTileData])
    colorIcons_3: SpriteTileData[] = [];
    @property([SpriteTileData])
    colorIcons_4: SpriteTileData[] = [];
    @property([SpriteTileData])
    colorIcons_5: SpriteTileData[] = [];
    @property([SpriteTileData])
    colorIcons_6: SpriteTileData[] = [];
    @property([SpriteTileData])
    colorIcons_7: SpriteTileData[] = [];
    @property([SpriteTileData])
    colorIcons_8: SpriteTileData[] = [];

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

        this.icons[0].spriteFrame = this.colorIcons_1.find(i => i.id === this.availableColors[this.currentColorIndex])?.icon;
        this.icons[1].spriteFrame = this.colorIcons_2.find(i => i.id === this.availableColors[this.currentColorIndex])?.icon;
        this.icons[2].spriteFrame = this.colorIcons_3.find(i => i.id === this.availableColors[this.currentColorIndex])?.icon;
        this.icons[3].spriteFrame = this.colorIcons_4.find(i => i.id === this.availableColors[this.currentColorIndex])?.icon;
        this.icons[4].spriteFrame = this.colorIcons_5.find(i => i.id === this.availableColors[this.currentColorIndex])?.icon;
        this.icons[5].spriteFrame = this.colorIcons_6.find(i => i.id === this.availableColors[this.currentColorIndex])?.icon;
        this.icons[6].spriteFrame = this.colorIcons_7.find(i => i.id === this.availableColors[this.currentColorIndex])?.icon;
        this.icons[7].spriteFrame = this.colorIcons_8.find(i => i.id === this.availableColors[this.currentColorIndex])?.icon;
    }


    clear() {
        super.clear();

        this.isBlockingDamage = false;
    }

    clearExtra() {
        this.isBlockingDamage = false;
    }


    getCustomParameter(): number {
        return this.currentColorIndex;
    }

    setCustomParameter(index: number) {
        this.currentColorIndex = index;

        this.refresh();
    }
}


