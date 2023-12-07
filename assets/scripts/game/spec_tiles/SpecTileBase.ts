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
    }


    destroyTile() {
        this.startDestroyConsequences();
        super.destroyTile();
    }

    onTouchStart(event: cc.Event.EventTouch) {}

    startDestroyConsequences() {}


    getDamage(damageType: string) {}

    setAsDamaged() {
        this.isDamaged = true;
    }


    isReadyToDestroy(): boolean {
        return false;
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


    clear() {
        this.isDamaged = false;
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
}


