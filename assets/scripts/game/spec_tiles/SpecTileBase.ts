import { _decorator, EventTouch, Node } from 'cc';
import { TileBase } from '../TileBase';

const { ccclass } = _decorator;

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


    onTouchStart(event: EventTouch) {
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
        if (!this.isReadyToDestroy()) {
            return false;
        }

        const tiles = this.getGroupedTiles(field);

        for (let i = 0; i < tiles.length; i++) {
            const tileComp = tiles[i].getComponent(SpecTileBase);

            if (!tileComp) {
                continue;
            }

            if (!tileComp.isReadyToDestroy()) {
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
        let matches: Node[] = [];

        matches = this.checkMatchesInDirection(field, 1, 0)
            .concat(this.checkMatchesInDirection(field, -1, 0))
            .concat(this.checkMatchesInDirection(field, 0, 1))
            .concat(this.checkMatchesInDirection(field, 0, -1));

        let newMatchesCount = matches.length;
        let startIndex = 0;

        while (newMatchesCount > 0) {
            newMatchesCount = 0;

            for (let i = startIndex; i < matches.length; i++) {
                const tileComponent = matches[i].getComponent(SpecTileBase);

                if (!tileComponent) {
                    continue;
                }

                const newMatches = tileComponent
                    .checkMatchesInDirection(field, 1, 0)
                    .concat(
                        tileComponent.checkMatchesInDirection(
                            field,
                            -1,
                            0
                        )
                    )
                    .concat(
                        tileComponent.checkMatchesInDirection(
                            field,
                            0,
                            1
                        )
                    )
                    .concat(
                        tileComponent.checkMatchesInDirection(
                            field,
                            0,
                            -1
                        )
                    );

                for (let j = 0; j < newMatches.length; j++) {
                    if (matches.indexOf(newMatches[j]) === -1) {
                        newMatchesCount++;
                        matches.push(newMatches[j]);
                    }
                }
            }

            startIndex =
                matches.length - newMatchesCount - 1;
        }

        return matches;
    }


    checkMatchesInDirection(
        field: Node[][],
        dirX: number,
        dirY: number
    ): Node[] {
        const matches: Node[] = [];

        let currentRow = this.row + dirY;
        let currentCol = this.col + dirX;

        const numRows = field.length;
        const numCols =
            field.length > 0 ? field[0].length : 0;

        while (
            currentRow >= 0 &&
            currentRow < numRows &&
            currentCol >= 0 &&
            currentCol < numCols
        ) {
            const currentTile =
                field[currentRow][currentCol];

            if (currentTile === null) {
                break;
            }

            const tileBase =
                currentTile.getComponent(TileBase);

            if (!tileBase) {
                break;
            }

            if (!tileBase.isSpecialTile()) {
                break;
            }

            const currentTileComponent =
                currentTile.getComponent(SpecTileBase);

            if (!currentTileComponent) {
                break;
            }

            if (!currentTileComponent.isGroupedTile()) {
                break;
            }

            if (
                currentTileComponent.getTileType() !==
                this.tileType
            ) {
                break;
            }

            matches.push(currentTile);

            currentRow += dirY;
            currentCol += dirX;
        }

        return matches;
    }


    findAllTilesThisType(field: Node[][]): Node[] {
        let tiles = [];

        const numRows = field.length;
        const numCols =
            field.length > 0 ? field[0].length : 0;

        for (let i = 0; i < numRows; i++) {
            for (let j = 0; j < numCols; j++) {
                const tile = field[i][j];

                if (tile !== null) {
                    const tileComp =
                        tile.getComponent(TileBase);

                    if (
                        tileComp &&
                        tileComp.getTileType() ===
                            this.tileType
                    ) {
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


    getStrengthRed(): number {
        return 0;
    }


    getStrengthBlue(): number {
        return 0;
    }


    getStrengthGreen(): number {
        return 0;
    }


    getStrengthYellow(): number {
        return 0;
    }


    getStrengthPurple(): number {
        return 0;
    }


    getCustomParameter(): number {
        return 0;
    }


    setStrengthRed(strength: number) {}


    setStrengthBlue(strength: number) {}


    setStrengthGreen(strength: number) {}


    setStrengthYellow(strength: number) {}


    setStrengthPurple(strength: number) {}


    setCustomParameter(index: number) {}


    refresh() {}
}
