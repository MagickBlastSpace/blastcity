import { _decorator, Component, Node, Vec2 } from 'cc';
import { TileBase } from '../TileBase';
import { AudioController } from '../../utils/AudioController';
const { ccclass, property } = _decorator;

@ccclass('BonusTileBase')
export class BonusTileBase extends TileBase {

    private combo: string = "";
    private comboPosition: Vec2 = null;

    private availableColors: string[] = [];

    private respawnDelay: number = 0.5;
    private timeBetweenTiles: number = 0.1;

    private isActivated: boolean = false;

    private disco_combo_time: number = 2;

    private isBonusPoolState: boolean = false;


    init(row: number, col: number, tileType: string) {
        this.row = row;
        this.col = col;
        this.tileType = tileType;

        this.isBonus = true;
        this.isEmpty = false;
        this.isShifts = true;
        this.isSpecial = false;

        this.combo = "";

        this.isActivated = false;
    }


    getCombo(field: Node[][]) {
        let possibleCombos = [];
        let possibleCombosPositions = [];

        let adjTiles = this.getAdjacentTiles(field);
        for(let i = 0; i < adjTiles.length; i++) {
            const tile = adjTiles[i];
            if(tile !== null) {
                const tileComponent = tile.getComponent("TileBase");
                if(tileComponent.isBonusTile()) {
                    possibleCombos.push(tileComponent.getTileType());
                    possibleCombosPositions.push(new Vec2(tileComponent.getRow(), tileComponent.getCol()));
                }
            }
        }

        if(possibleCombos.includes("super")) {
            this.combo = "super";
        }
        else if(possibleCombos.includes("multi")) {
            this.combo = "multi";
        }
        else if(possibleCombos.includes("bomb")) {
            this.combo = "bomb";
        }
        else if(possibleCombos.includes("rocket_vertical")) {
            this.combo = "rocket_vertical";
        }
        else if(possibleCombos.includes("rocket_horizontal")) {
            this.combo = "rocket_horizontal";
        }

        this.comboPosition = possibleCombosPositions[possibleCombos.indexOf(this.combo)];
    }


    isCombo(): boolean {
        return this.combo !== "";
    }

    getComboName(): string {
        return this.combo;
    }


    clear() {
        this.combo = "";
    }


    rowExtraHit(field: Node[][], row: number, col: number) {
        const numCols: number = field.length > 0 ? field[0].length : 0;

        const totalTime = this.respawnDelay;

        for(let j = col; j < numCols; j++) {
            let isBonusChain = this.isCombo() ? j !== col && j !== col + 1 && j !== col - 1 : j !== col;
            isBonusChain = isBonusChain && !this.isBonusPoolState;

            this.node.emit("extra_hit", row, j, isBonusChain, totalTime / numCols * (j - col));
        }

        for(let j = col - 1; j >= 0; j--) {
            let isBonusChain = this.isCombo() ? j !== col && j !== col + 1 && j !== col - 1 : j !== col;
            isBonusChain = isBonusChain && !this.isBonusPoolState;

            this.node.emit("extra_hit", row, j, isBonusChain, totalTime / numCols * (col - j));
        }

        this.clearTiles();
    }

    colExtraHit(field: Node[][], row: number, col: number) {
        const numRows: number = field.length;

        const totalTime = this.respawnDelay;

        for(let j = row; j < numRows; j++) {
            let isBonusChain = this.isCombo() ? j !== row && j !== row + 1 && j !== row - 1 : j !== row;
            isBonusChain = isBonusChain && !this.isBonusPoolState;

            this.node.emit("extra_hit", j, col, isBonusChain, totalTime / numRows * (j - row));
        }

        for(let j = row - 1; j >= 0; j--) {
            let isBonusChain = this.isCombo() ? j !== row && j !== row + 1 && j !== row - 1 : j !== row;
            isBonusChain = isBonusChain && !this.isBonusPoolState;

            this.node.emit("extra_hit", j, col, isBonusChain, totalTime / numRows * (row - j));
        }

        this.clearTiles();
    }


    getBiggestCommonTilesGroup(field: Node[][], statuses: Node[][]): TileBase[] {
        const numRows: number = field.length;
        const numCols: number = field.length > 0 ? field[0].length : 0;

        let biggestGroup = [];

        this.availableColors = ["blue", "red", "green", "yellow", "purple", "orange"];
        
        for(let color = 0; color < this.availableColors.length; color++) {
            let tiles = [];

            for(let i = numRows - 1; i >= 0; i--) {
                for(let j = 0; j < numCols; j++) {
                    const tile = field[i][j];
                    const status = statuses[i][j];

                    if(status !== null && status !== undefined) {
                        const statusComp = status.getComponent("StatusBase");
                        if(statusComp.isBlockingInteraction()) {
                            continue;
                        }
                    }
                    if(tile !== null && tile !== this.node) {
                        const tileComp = tile.getComponent("TileBase");
                        if(tileComp.getTileType() === this.availableColors[color]) {
                            tiles.push(tileComp);
                        }
                    }
                }
            }

            if(tiles.length > biggestGroup.length) {
                biggestGroup = [];
                for(let i = 0; i < tiles.length; i++) {
                    biggestGroup.push(tiles[i]);
                }
            }
        }
        
        return biggestGroup;
    }


    getTwoBiggestCommonTilesGroups(field: Node[][], statuses: Node[][]): TileBase[] {
        const numRows: number = field.length;
        const numCols: number = field.length > 0 ? field[0].length : 0;

        let biggestGroup = [];
        let secondBiggestGroup = [];

        this.availableColors = ["blue", "red", "green", "yellow", "purple", "orange"];
        
        for(let color = 0; color < this.availableColors.length; color++) {
            let tiles = [];

            for(let i = numRows - 1; i >= 0; i--) {
                for(let j = 0; j < numCols; j++) {
                    const tile = field[i][j];
                    const status = statuses[i][j];

                    if(status !== null && status !== undefined) {
                        const statusComp = status.getComponent("StatusBase");
                        if(statusComp.isBlockingInteraction()) {
                            continue;
                        }
                    }
                    if(tile !== null && tile !== this.node) {
                        const tileComp = tile.getComponent("TileBase");
                        if(tileComp.getTileType() === this.availableColors[color]) {
                            tiles.push(tileComp);
                        }
                    }
                }
            }

            if(tiles.length > biggestGroup.length) {
                biggestGroup = [];
                for(let i = 0; i < tiles.length; i++) {
                    biggestGroup.push(tiles[i]);
                }
            }
            else if(tiles.length > secondBiggestGroup.length) {
                secondBiggestGroup = [];
                for(let i = 0; i < tiles.length; i++) {
                    secondBiggestGroup.push(tiles[i]);
                }
            }
        }
        
        return biggestGroup.concat(secondBiggestGroup);
    }

    isTileActivated(): boolean {
        return this.isActivated;
    }


    destroyTile(delay: number) {
        super.destroyTile(delay);
        
        this.node.emit("goal", this.tileType);
    }


    renderLine(start: Vec2, end: Vec2) {
        try {
            this.node.emit("render_line", start, end);
        }
        catch (error) {
            console.log("Render Line Error: " + error);
        }
    }


    playComboSound() {
        AudioController.instance.playCombo();
    }

    playRocketSound() {
        AudioController.instance.playRocket();
    }

    playBombSound() {
        AudioController.instance.playBomb();
    }

    playDiscoballSound() {
        AudioController.instance.playDiscoball();
    }

    playDoubleDiscoballSound() {
        AudioController.instance.playDoubleDiscoball();
    }


    setBonusPoolAnimation() {}
}


