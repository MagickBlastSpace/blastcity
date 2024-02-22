import { _decorator, Component, Node } from 'cc';
import { TileBase } from '../TileBase';
const { ccclass, property } = _decorator;

@ccclass('SpecTileBase')
export class SpecTileBase extends TileBase {

    private strength: number;

    private isDamaged: boolean;
    private isGrouped: boolean;

    private isDoubleX: boolean;
    private isDoubleY: boolean;

    private isTripleX: boolean;
    private isTripleY: boolean;


    init(row: number, col: number, tileType: string) {
        this.row = row;
        this.col = col;
        this.tileType = tileType;

        this.isBonus = false;
        this.isEmpty = false;

        this.isDamaged = false;
        this.isSpecial = true;

        this.isDoubleX = false;
        this.isDoubleY = false;

        this.isTripleX = false;
        this.isTripleY = false;
    }


    destroyTile(delay: number) {
        this.startDestroyConsequences();
        super.destroyTile(delay);
    }

    onTouchStart(event: cc.Event.EventTouch) {
        this.node.emit("click", this.node);
    }

    startDestroyConsequences() {}

    startInActionEffect(): boolean {
        return false;
    }

    startPreActionEffect(): boolean {
        return false;
    }


    getDamage(damageType: string) {}

    setAsDamaged() {
        this.isDamaged = true;
    }


    isReadyToDestroy(): boolean {
        return false;
    }

    isGroupReadyToDestroy(field: Node[][]): boolean {
        if(!this.isReadyToDestroy()) {
            return false;
        }

        let tiles = this.getGroupedTiles(field);
        for(let i = 0; i < tiles.length; i++) {
            const tileComp = tiles[i].getComponent("SpecTileBase");
            if(!tileComp.isReadyToDestroy()) {
                return false;
            }
        }

        return true;
    }

    isGroupedTile(): boolean {
        return this.isGrouped;
    }


    isDoubleWidth(): boolean {
        return this.isDoubleX;
    }

    isDoubleHeight(): boolean {
        return this.isDoubleY;
    }

    isTripleWidth(): boolean {
        return this.isTripleX;
    }

    isTripleHeight(): boolean {
        return this.isTripleY;
    }


    clear() {
        this.isDamaged = false;
    }

    isTileDamaged(): boolean {
        return this.isDamaged;
    }


    getGroupedTiles(field: Node[][]): Node[] {
        let matches = [];

        matches = this.checkMatchesInDirection(field, 1, 0)
            .concat(this.checkMatchesInDirection(field, -1, 0))
            .concat(this.checkMatchesInDirection(field, 0, 1))
            .concat(this.checkMatchesInDirection(field, 0, -1));

        let newMatchesCount = matches.length;
        let startIndex = 0;
        while(newMatchesCount > 0) {
            newMatchesCount = 0;
            for(let i = startIndex; i < matches.length; i++) {
                let tileComponent = matches[i].getComponent("TileBase");
                const newMatches = tileComponent.checkMatchesInDirection(field, 1, 0)
                    .concat(tileComponent.checkMatchesInDirection(field, -1, 0))
                    .concat(tileComponent.checkMatchesInDirection(field, 0, 1))
                    .concat(tileComponent.checkMatchesInDirection(field, 0, -1));

                for(let j = 0; j < newMatches.length; j++) {
                    if (!matches.includes(newMatches[j])) {
                        newMatchesCount++;
                        matches.push(newMatches[j]);
                    }
                }
            }

            startIndex = matches.length - newMatchesCount - 1;
        }

        return matches;
    }

    checkMatchesInDirection(field: Node[][], dirX: number, dirY: number): Node[] {
        let matches: Node[] = [];

        let currentRow = this.row + dirY;
        let currentCol = this.col + dirX;

        const numRows: number = field.length;
        const numCols: number = field.length > 0 ? field[0].length : 0;

        while (currentRow >= 0 && currentRow < numRows &&
            currentCol >= 0 && currentCol < numCols) {
            const currentTile = field[currentRow][currentCol];
            if(currentTile !== null) {
                const currentTileComponent = currentTile.getComponent("TileBase");
                const isSpecial = currentTileComponent.isSpecialTile();

                if(isSpecial) {
                    const isGrouped = currentTileComponent.isGroupedTile();
                    if(isGrouped) {
                        if(currentTileComponent.getTileType() === this.tileType) {
                            matches.push(currentTile);
                            currentRow += dirY;
                            currentCol += dirX;
                        }
                        else {
                            break;
                        }
                    }
                    else {
                        break;
                    }
                }
                else {
                    break;
                }
            }
            else {
                break;
            }
        }

        return matches;
    }


    findAllTilesThisType(field: Node[][]): Node[] {
        let tiles = [];

        const numRows: number = field.length;
        const numCols: number = field.length > 0 ? field[0].length : 0;

        for(let i = 0; i < numRows; i++) {
            for(let j = 0; j < numCols; j++) {
                const tile = field[i][j];
                if(tile !== null) {
                    const tileComp = tile.getComponent("TileBase");
                    if(tileComp.getTileType() === this.tileType) {
                        tiles.push(tileComp);
                    }
                }
            }
        }

        return tiles;
    }


    getStrength(): number {
        return this.strength;
    }

    setStrength(strength: number) {
        this.strength = strength;

        this.refresh();
    }

    refresh() {}
}


