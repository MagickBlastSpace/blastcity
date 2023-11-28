import { _decorator, Component, Node, instantiate, Prefab, Vec2, Vec3 } from 'cc';
import { GameData, LevelData } from '../data/GameData';
const { ccclass, property } = _decorator;

@ccclass('Field')
export class Field extends Component {
    @property(Prefab)
    tilePrefab: Prefab = null;

    @property(Prefab)
    emptyPrefab: Prefab = null;

    @property(Prefab)
    bombPrefab: Prefab = null;
    @property(Prefab)
    rocketPrefab: Prefab = null;
    @property(Prefab)
    discoballPrefab: Prefab = null;

    @property([Prefab])
    specialPrefabs: Prefab[] = [];

    @property
    numRows: number = 8;
    @property
    numCols: number = 8;

    @property
    tileSpacing: number = 5;
    @property
    xOffset: number = -150;
    @property
    yOffset: number = -175;

    private tileArray: Node[][] = [];

    private isClickAvailable: bool = false;


    start() {
        this.spawnInitialBoard(GameData.instance.levels[0]);
    }


    spawnInitialBoard(level: LevelData) {
        for (let row = 0; row < this.numRows; row++) {
            this.tileArray[row] = [];
            for (let col = 0; col < this.numCols; col++) {
                this.spawnCommonTile(row, col);
            }
        }

        for(let i = 0; i < level.emptyTiles.length; i++) {
            const tile = this.tileArray[level.emptyTiles[i].y][level.emptyTiles[i].x];
            let tileComponent = tile.getComponent("TileBase");
            tileComponent.destroyTile();
            this.spawnEmptyTile(level.emptyTiles[i].y, level.emptyTiles[i].x);
        }

        for(let i = 0; i < level.specialTiles.length; i++) {
            const tile = this.tileArray[level.specialTiles[i].row][level.specialTiles[i].col];
            let tileComponent = tile.getComponent("TileBase");
            tileComponent.destroyTile();
            this.spawnSpecialTile(level.specialTiles[i].row, level.specialTiles[i].col, level.specialTiles[i].id);
        }

        this.checkForPotentialBonuses();
        this.isClickAvailable = true;
    }


    spawnCommonTile(row: number, col: number): Node {
        const tileNode = instantiate(this.tilePrefab);
        const tileComponent = tileNode.getComponent("Tile");
        const tileType = Math.floor(Math.random() * 4).toString();
        let spawnedTile = this.initTile(tileComponent, row, col, tileType);
        return spawnedTile;
    }

    spawnBomb(row: number, col: number): Node {
        const tileNode = instantiate(this.bombPrefab);
        const tileComponent = tileNode.getComponent("Bomb");
        let spawnedTile = this.initTile(tileComponent, row, col, "bomb");
        return spawnedTile;
    }

    spawnRocket(row: number, col: number, tileType: string): Node {
        const tileNode = instantiate(this.rocketPrefab);
        const tileComponent = tileNode.getComponent("Rocket");
        let spawnedTile = this.initTile(tileComponent, row, col, tileType);
        return spawnedTile;
    }

    spawnDiscoball(row: number, col: number, tileType: string): Node {
        const tileNode = instantiate(this.discoballPrefab);
        const tileComponent = tileNode.getComponent("Discoball");
        let spawnedTile = this.initTile(tileComponent, row, col, tileType);
        return spawnedTile;
    }

    spawnEmptyTile(row: number, col: number): Node {
        const tileNode = instantiate(this.emptyPrefab);
        const tileComponent = tileNode.getComponent("EmptyTile");
        let spawnedTile = this.initTile(tileComponent, row, col, "empty");
        return spawnedTile;
    }

    spawnSpecialTile(row: number, col: number, tileId: number): Node {
        const tileNode = instantiate(this.specialPrefabs[tileId]);
        const tileComponent = tileNode.getComponent("SpecTileBase");
        let spawnedTile = this.initTile(tileComponent, row, col, "special_" + tileId);
        return spawnedTile;
    }


    initTile(tileComponent: any, row: number, col: number, tileType: string): Node {
        tileComponent.init(row, col, tileType);
        const tileNode = tileComponent.node;
        const posX = col * (tileNode.width + this.tileSpacing) + this.xOffset;
        const posY = row * (tileNode.height + this.tileSpacing) + this.yOffset;
        tileComponent.node.setPosition(posX, posY + tileNode.height);

        cc.tween(tileNode)
            .to(0.2, { position: new Vec3(posX, posY, 0) })
            .start();

        tileNode.on("click", (tile) => {
            this.onTileClick(tile);
        });

        this.tileArray[row][col] = tileNode;
        this.node.addChild(tileNode);

        return tileNode;
    }


    findAndDestroyMatches(tile: Node): boolean {
        let choosenTile = tile.getComponent("TileBase");
        const choosenRow = choosenTile.getRow();
        const choosenCol = choosenTile.getCol();
        const choosenType = choosenTile.getTileType();
        const isBonus = choosenTile.isBonusTile();
        const potentialBonus = choosenTile.getPotentialBonus();

        const matches = choosenTile.getMatches(this.tileArray);
        
        if(matches.length >= 2) {
            matches.forEach(matchedTile => {
                let tileComponent = matchedTile.getComponent("TileBase");
                tileComponent.giveDamage(this.tileArray);
                this.tileArray[tileComponent.getRow()][tileComponent.getCol()] = null;
                tileComponent.destroyTile();
            })
        }
        else {
            return false;
        }

        this.checkSpecTilesForDestroy();

        if(matches.length >= 9 && !isBonus) {
            this.spawnDiscoball(choosenRow, choosenCol, choosenType);
        }
        else if(matches.length >= 7 && !isBonus) {
            this.spawnBomb(choosenRow, choosenCol);
        }
        else if(matches.length >= 5 && !isBonus) {
            this.spawnRocket(choosenRow, choosenCol, potentialBonus);
        }

        this.spawnNewTiles();

        return true;
    }


    spawnNewTiles() {
        this.fallTiles();
    
        this.scheduleOnce(() => {
            if (this.checkSpecTilesForDestroy()) {
                this.spawnNewTiles();
                return;
            }
    
            for (let col = 0; col < this.numCols; col++) {
                let shouldSpawnNewTile = true;
    
                for (let row = this.numRows - 1; row >= 0; row--) {
                    const tile = this.tileArray[row][col];
                    if (tile !== null) {
                        const tileComponent = tile.getComponent("TileBase");
                        if (!tileComponent.isTileShifts()) {
                            shouldSpawnNewTile = false;
                            break;
                        }
                    }
                    if (tile === null && shouldSpawnNewTile) {
                        this.spawnCommonTile(row, col);
                    }
                }
            }

            this.checkForPotentialBonuses();
    
            this.scheduleOnce(() => {
                this.clearAll();
                this.isClickAvailable = true;
            }, 0.25);
        }, 0.2);
    }
    


    fallTiles() {
        for (let col = 0; col < this.numCols; col++) {
            let emptySpaces = 0;
            let holes = 0;
            let continueProcessing = true;
    
            for (let row = 0; row < this.numRows && continueProcessing; row++) {
                const tile = this.tileArray[row][col];
    
                if (tile === null) {
                    emptySpaces++;
                } else {
                    let tileComponent = tile.getComponent("TileBase");

                    if(!tileComponent.isTileShifts()) {
                        continueProcessing = false;
                    }
                    else if (tileComponent.isEmptyTile()) {
                        if (!tileComponent.isBorder(this.tileArray)) {
                            holes++;
                        }
                    } else if (emptySpaces > 0) {
                        let newRow = row - emptySpaces;
    
                        while (holes > 0 && this.checkPlaceForEmptyTile(newRow, col)) {
                            newRow = row - emptySpaces - holes;
                            holes--;
                        }
    
                        if (!this.checkPlaceForEmptyTile(newRow, col)) {
                            tileComponent.setRow(newRow);
                            this.tileArray[newRow][col] = tile;
                            this.tileArray[row][col] = null;
    
                            const posX = col * (tile.width + this.tileSpacing) + this.xOffset;
                            const posY = newRow * (tile.height + this.tileSpacing) + this.yOffset;
                            cc.tween(tile)
                                .to(0.25, { position: new cc.Vec3(posX, posY, 0) })
                                .start();
                        }
                    }
                }
            }
        }
    }


    checkSpecTilesForDestroy(): boolean {
        let isDestroyed = false;
        for(let i = 0; i < this.numRows; i++) {
            for(let j = 0; j < this.numCols; j++) {
                let tile = this.tileArray[i][j];
                if(tile !== null) {
                    let tileComponent = tile.getComponent("TileBase");
                    if(tileComponent.isSpecialTile()) {
                        if(tileComponent.isReadyToDestroy()) {
                            this.tileArray[tileComponent.getRow()][tileComponent.getCol()] = null;
                            tileComponent.destroyTile();
                            isDestroyed = true;
                        }
                    }
                }
            }
        }
        return isDestroyed;
    }

    
    onTileClick(tile: Node) {
        if(!this.isClickAvailable) {
            return;
        }

        let isMatchesFound = this.findAndDestroyMatches(tile);
        
        this.isClickAvailable = !isMatchesFound;
    }



    checkForPotentialBonuses() {
        let checkedTiles = [];

        this.clearAllPotentialBonuses();

        for(let i = 0; i < this.numRows; i++) {
            for(let j = 0; j < this.numCols; j++) {
                let tile = this.tileArray[i][j];

                if(!checkedTiles.includes(tile) && tile !== null) {
                    const tileComponent = tile.getComponent("TileBase");
                    const isBonus = tileComponent.isBonusTile();
                    const isSpecial = tileComponent.isSpecialTile();
                    const isEmpty = tileComponent.isEmptyTile();
                    let matches = [];

                    if(!isBonus && !isSpecial && !isEmpty) {
                        matches = tileComponent.getMatches(this.tileArray); //bug

                        if(matches.length >= 9 && !isBonus) {
                            this.setPotentialBonus(matches, "discoball");
                        }
                        else if(matches.length >= 7 && !isBonus) {
                            this.setPotentialBonus(matches, "bomb");
                        }
                        else if(matches.length >= 5 && !isBonus) {
                            const tileType = Math.floor(Math.random() * 2);
                            if(tileType === 0) {
                                this.setPotentialBonus(matches, "rocket_vertical");
                            }
                            else {
                                this.setPotentialBonus(matches, "rocket_horizontal");
                            }
                        }

                        checkedTiles.concat(matches);
                    }
                    else {
                        checkedTiles.push(tile);
                    }
                }
            }
        }
    }

    setPotentialBonus(tiles: Node[], bonus: string) {
        tiles.forEach(matchedTile => {
            let tileComponent = matchedTile.getComponent("TileBase");
            tileComponent.setPotentialBonus(bonus);
        })
    }

    clearAllPotentialBonuses() {
        for(let i = 0; i < this.numRows; i++) {
            for(let j = 0; j < this.numCols; j++) {
                let tile = this.tileArray[i][j];
                if(tile !== null) {
                    let tileComponent = tile.getComponent("TileBase");
                    tileComponent.clearPotentialBonus();
                }
            }
        }
    }


    checkPlaceForEmptyTile(row: number, col: number): boolean {
        const tile = this.tileArray[row][col];
        if(tile === null) {
            return false;
        }
        const tileComponent = tile.getComponent("TileBase");
        return tileComponent.isEmptyTile();
    }


    clearAll() {
        for(let i = 0; i < this.numRows; i++) {
            for(let j = 0; j < this.numCols; j++) {
                let tile = this.tileArray[i][j];
                if(tile !== null) {
                    let tileComponent = tile.getComponent("TileBase");
                    tileComponent.clear();
                }
            }
        }
    }
}


