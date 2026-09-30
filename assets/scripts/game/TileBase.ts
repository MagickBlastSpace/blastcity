import {
    _decorator,
    Component,
    EventTouch,
    Node,
    sp,
} from 'cc';

import { GoalData } from '../data/GameData';
import { UITile } from '../ui/UITile';

const { ccclass } = _decorator;

@ccclass('TileBase')
export class TileBase extends Component {

    protected tileType: string;
    protected row: number;
    protected col: number;

    protected isBonus: boolean;
    protected isEmpty: boolean;
    protected isShifts: boolean;
    protected isSpecial: boolean;

    private currentTween: any = null;
    private isSubscribed: boolean = false;

    protected uiComponent: UITile = null;


    onLoad() {
        this.node.on(
            Node.EventType.TOUCH_START,
            this.onTouchStart,
            this
        );
    }

    onDestroy() {
        this.node.off(
            Node.EventType.TOUCH_START,
            this.onTouchStart,
            this
        );
    }


    init(row: number, col: number, tileType: string) {
        this.row = row;
        this.col = col;
        this.tileType = tileType;

        this.currentTween = null;
        this.isSubscribed = false;

        this.uiComponent = this.node.getComponent(UITile);
    }


    getTileType(): string {
        return this.tileType;
    }

    setTileType(newType: string) {
        this.tileType = newType;
    }


    getRow(): number {
        return this.row;
    }

    getCol(): number {
        return this.col;
    }


    setRow(row: number) {
        this.row = row;
    }

    setCol(col: number) {
        this.col = col;
    }


    isBonusTile(): boolean {
        return this.isBonus;
    }

    isEmptyTile(): boolean {
        return this.isEmpty;
    }

    isTileShifts(): boolean {
        return this.isShifts;
    }

    setIsShifts(isShifts: boolean) {
        this.isShifts = isShifts;
    }

    isSpecialTile(): boolean {
        return this.isSpecial;
    }

    isCommonTile(): boolean {
        return !this.isBonus && !this.isSpecial && !this.isEmpty;
    }


    isCurrentTile(row: number, col: number): boolean {
        return row === this.row && col === this.col;
    }


    destroyTile(delay: number) {
        const uiComponent = this.node.getComponent(UITile);

        if (uiComponent) {
            uiComponent.destroyTile(delay);
        }
    }


    playAnimation(
        animation: string,
        isLooped: boolean,
        timeScale: number
    ) {
        const uiComponent = this.node.getComponent(UITile);

        if (uiComponent) {
            uiComponent.playAnimation(
                animation,
                isLooped,
                timeScale
            );
        }
    }


    playAdditionalAnimation(
        skeleton: sp.Skeleton,
        animation: string,
        disableNode: Node
    ) {
        const uiComponent = this.node.getComponent(UITile);

        if (uiComponent) {
            uiComponent.playAdditionalAnimation(
                skeleton,
                animation,
                disableNode
            );
        }
    }


    startShake() {
        const uiComponent = this.node.getComponent(UITile);

        if (uiComponent) {
            uiComponent.startShake();
        }
    }


    stopShake() {
        const uiComponent = this.node.getComponent(UITile);

        if (uiComponent) {
            uiComponent.stopShake();
        }
    }


    destroyClear() {
        this.node.destroy();
    }


    getMatches(
        field: Node[][],
        statuses: Node[][],
        isBlockingCombo: boolean
    ) {
        const matches = [];
        return matches;
    }


    getMatchesByType(field: Node[][]): Node[] {
        const matches: Node[] = [];
        return matches;
    }


    giveDamage(field: Node[][], statuses: Node[][]) {}


    onTouchStart(event: EventTouch) {
        this.node.emit("click", this.node);
    }


    clear() {}

    clearExtra() {}


    getAdjacentTiles(field: Node[][]): Node[] {
        const matches: Node[] = [];

        const numRows = field.length;
        const numCols =
            field.length > 0 ? field[0].length : 0;

        if (this.row < numRows - 1) {
            matches.push(
                field[this.row + 1][this.col]
            );
        }

        if (this.col > 0) {
            matches.push(
                field[this.row][this.col - 1]
            );
        }

        if (this.col < numCols - 1) {
            matches.push(
                field[this.row][this.col + 1]
            );
        }

        if (this.row > 0) {
            matches.push(
                field[this.row - 1][this.col]
            );
        }

        return matches;
    }


    getAdditionalTiles_1(field: Node[][]): Node[] {
        const matches: Node[] = [];

        const numRows = field.length;
        const numCols =
            field.length > 0 ? field[0].length : 0;

        if (
            this.row < numRows - 1 &&
            this.col < numCols - 1
        ) {
            matches.push(
                field[this.row + 1][this.col + 1]
            );
        }

        if (this.col > 0 && this.row > 0) {
            matches.push(
                field[this.row - 1][this.col - 1]
            );
        }

        if (
            this.col < numCols - 1 &&
            this.row > 0
        ) {
            matches.push(
                field[this.row - 1][this.col + 1]
            );
        }

        if (
            this.col > 0 &&
            this.row < numRows - 1
        ) {
            matches.push(
                field[this.row + 1][this.col - 1]
            );
        }

        return matches;
    }


    getAdditionalTiles_2(field: Node[][]): Node[] {
        const matches: Node[] = [];

        const numRows = field.length;
        const numCols =
            field.length > 0 ? field[0].length : 0;

        if (this.row < numRows - 2) {
            matches.push(
                field[this.row + 2][this.col]
            );

            if (this.col > 0) {
                matches.push(
                    field[this.row + 2][this.col - 1]
                );
            }

            if (this.col > 1) {
                matches.push(
                    field[this.row + 2][this.col - 2]
                );
                matches.push(
                    field[this.row + 1][this.col - 2]
                );
                matches.push(
                    field[this.row][this.col - 2]
                );
            }

            if (this.col < numCols - 1) {
                matches.push(
                    field[this.row + 2][this.col + 1]
                );
            }

            if (this.col < numCols - 2) {
                matches.push(
                    field[this.row + 2][this.col + 2]
                );
                matches.push(
                    field[this.row + 1][this.col + 2]
                );
                matches.push(
                    field[this.row][this.col + 2]
                );
            }
        }
        else if (this.row < numRows - 1) {
            if (this.col > 1) {
                matches.push(
                    field[this.row + 1][this.col - 2]
                );
                matches.push(
                    field[this.row][this.col - 2]
                );
            }

            if (this.col < numCols - 2) {
                matches.push(
                    field[this.row + 1][this.col + 2]
                );
                matches.push(
                    field[this.row][this.col + 2]
                );
            }
        }
        else {
            if (this.col > 1) {
                matches.push(
                    field[this.row][this.col - 2]
                );
            }

            if (this.col < numCols - 2) {
                matches.push(
                    field[this.row][this.col + 2]
                );
            }
        }

        if (this.row > 1) {
            matches.push(
                field[this.row - 2][this.col]
            );

            if (this.col > 0) {
                matches.push(
                    field[this.row - 2][this.col - 1]
                );
            }

            if (this.col > 1) {
                matches.push(
                    field[this.row - 2][this.col - 2]
                );
                matches.push(
                    field[this.row - 1][this.col - 2]
                );
            }

            if (this.col < numCols - 1) {
                matches.push(
                    field[this.row - 2][this.col + 1]
                );
            }

            if (this.col < numCols - 2) {
                matches.push(
                    field[this.row - 2][this.col + 2]
                );
                matches.push(
                    field[this.row - 1][this.col + 2]
                );
            }
        }

        return matches;
    }


    canFall(
        field: Node[][],
        rowIndexToFall: number
    ): boolean {
        if (this.row <= 0) {
            return false;
        }

        for (
            let i = this.row - 1;
            i >= rowIndexToFall;
            i--
        ) {
            const tile = field[i][this.col];

            if (tile !== null) {
                const tileComp =
                    tile.getComponent(TileBase);

                if (!tileComp) {
                    continue;
                }

                if (!tileComp.isEmptyTile()) {
                    return false;
                }

                if (
                    tileComp.isEmptyTile() &&
                    i === rowIndexToFall
                ) {
                    return false;
                }
            }
        }

        return true;
    }


    subscribeOnFieldEvents(field: Node) {
        this.isSubscribed = true;
    }


    subscribeOnGoals(goals: GoalData[]) {}


    clearTiles() {
        this.node.emit("clear");
    }


    playSound(soundIndex: number) {
        const uiComponent = this.node.getComponent(UITile);

        if (uiComponent) {
            uiComponent.playAdditionalSound(soundIndex);
        }
    }
}
