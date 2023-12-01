import { _decorator, Component, Node, instantiate, Prefab, Vec2, Vec3 } from 'cc';
import { GameData, LevelData, SpecialPrefabData } from '../data/GameData';
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

    @property([SpecialPrefabData])
    specialPrefabs: SpecialPrefabData[] = [];

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

    private availableColors: string[] = [];


    start() {
        for (let row = 0; row < this.numRows; row++) {
            this.tileArray[row] = [];
            for (let col = 0; col < this.numCols; col++) {
                this.tileArray[row][col] = null;
            }
        }

        this.availableColors = ["blue", "red", "green", "yellow"];

        this.spawnInitialBoard(GameData.instance.levels[0]);
    }


    spawnInitialBoard(level: LevelData) {
        /*const jsonString = JSON.stringify(level);
        console.log(jsonString);*/

        this.clearBoard();

        for (let row = 0; row < this.numRows; row++) {
            for (let col = 0; col < this.numCols; col++) {
                this.spawnCommonTile(row, col);
            }
        }

        for(let i = 0; i < level.emptyTiles.length; i++) {
            this.spawnEmptyTile(level.emptyTiles[i].y, level.emptyTiles[i].x);
        }

        for(let i = 0; i < level.specialTiles.length; i++) {
            this.spawnSpecialTile(level.specialTiles[i].row, level.specialTiles[i].col, level.specialTiles[i].id);
        }

        this.checkForPotentialBonuses();
        this.isClickAvailable = true;
    }

    clearBoard() {
        for (let row = 0; row < this.numRows; row++) {
            for (let col = 0; col < this.numCols; col++) {
                let tile = this.tileArray[row][col];
                if(tile !== null) {
                    tile.destroy();
                    this.tileArray[row][col] = null;
                }
            }
        }
    }


    spawnCommonTile(row: number, col: number): Node {
        this.destroyTile(row, col);
        const tileNode = instantiate(this.tilePrefab);
        const tileComponent = tileNode.getComponent("Tile");
        const tileTypeIndex = Math.floor(Math.random() * this.availableColors.length).toString();
        const tileType = this.availableColors[tileTypeIndex];
        let spawnedTile = this.initTile(tileComponent, row, col, tileType);
        return spawnedTile;
    }

    spawnBomb(row: number, col: number): Node {
        this.destroyTile(row, col);
        const tileNode = instantiate(this.bombPrefab);
        const tileComponent = tileNode.getComponent("Bomb");
        let spawnedTile = this.initTile(tileComponent, row, col, "bomb");
        return spawnedTile;
    }

    spawnRocket(row: number, col: number, tileType: string): Node {
        this.destroyTile(row, col);
        const tileNode = instantiate(this.rocketPrefab);
        const tileComponent = tileNode.getComponent("Rocket");
        let spawnedTile = this.initTile(tileComponent, row, col, tileType);
        return spawnedTile;
    }

    spawnDiscoball(row: number, col: number, tileType: string): Node {
        this.destroyTile(row, col);
        const tileNode = instantiate(this.discoballPrefab);
        const tileComponent = tileNode.getComponent("Discoball");
        let spawnedTile = this.initTile(tileComponent, row, col, tileType);
        return spawnedTile;
    }

    spawnEmptyTile(row: number, col: number): Node {
        this.destroyTile(row, col);
        const tileNode = instantiate(this.emptyPrefab);
        const tileComponent = tileNode.getComponent("EmptyTile");
        let spawnedTile = this.initTile(tileComponent, row, col, "empty");
        return spawnedTile;
    }

    spawnSpecialTile(row: number, col: number, tileId: string): Node {
        const prefab = this.specialPrefabs.find(p => p.id === tileId)?.prefab;
        if(prefab === null) {
            return;
        }

        this.destroyTile(row, col);
        const tileNode = instantiate(prefab);
        const tileComponent = tileNode.getComponent("SpecTileBase");
        let spawnedTile = this.initTile(tileComponent, row, col, tileId);
        return spawnedTile;
    }

    spawnBonusTile(row: number, col: number, bonusId: string, timeToDestroy: number) {
        let spawnedTile = null;
        switch(bonusId) {
            case "bomb":
                spawnedTile = this.spawnBomb(row, col);
                break;
            case "rocket_horizontal": 
            case "rocket_vertical":
                spawnedTile = this.spawnRocket(row, col, bonusId);
                break;
            case "blue":
            case "red":
            case "green":
            case "yellow":
                spawnedTile = this.spawnDiscoball(row, col, bonusId);
                break;
        }

        console.log(timeToDestroy);
        this.scheduleOnce(() => {
            this.findAndDestroyMatches(spawnedTile, false);
        }, timeToDestroy);
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
        tileNode.on("change", (row, col, tileId) => {
            this.spawnSpecialTile(row, col, tileId);
        });
        tileNode.on("change_bonus", (row, col, bonusId, timeToDestroy) => {
            this.spawnBonusTile(row, col, bonusId, timeToDestroy);
        });
        tileNode.on("respawn", (timeToRespawn) => {
            this.scheduleRespawn(timeToRespawn);
        });

        this.tileArray[row][col] = tileNode;
        this.node.addChild(tileNode);

        return tileNode;
    }

    destroyTile(row: number, col: number) {
        const tile = this.tileArray[row][col];
        if(tile !== null) {
            let tileComponent = tile.getComponent("TileBase");
            tileComponent.destroyTile();
        }
    }


    findAndDestroyMatches(tile: Node, isRespawn: boolean): boolean {
        if(!tile) {
            return false;
        }

        let choosenTile = null;
        try {
            choosenTile = tile.getComponent("TileBase");
        } catch (error) {
            //console.error("Произошла ошибка при обработке tile:", error);
            return false;
        }

        const choosenRow = choosenTile.getRow();
        const choosenCol = choosenTile.getCol();
        const choosenType = choosenTile.getTileType();
        const isCommon = choosenTile.isCommonTile();
        const isBonus = choosenTile.isBonusTile();
        let potentialBonus = "";
        if(isCommon) {
            potentialBonus = choosenTile.getPotentialBonus();
        }
        
        console.log(choosenRow + " - " + choosenCol + " - " + choosenType);
        const matches = choosenTile.getMatches(this.tileArray);
        
        if(matches.length >= 2) {
            matches.forEach(matchedTile => {
                if(matchedTile !== null) {
                    let tileComponent = matchedTile.getComponent("TileBase");
                    tileComponent.giveDamage(this.tileArray);
                    this.tileArray[tileComponent.getRow()][tileComponent.getCol()] = null;
                    tileComponent.destroyTile();
                }
            })
        }
        else {
            if(isBonus) {
                return true;
            }
            return false;
        }

        if(!isRespawn) {
            return true;
        }

        this.checkSpecTilesForDestroy();

        if(isCommon) {
            if(matches.length >= 9) {
                this.spawnDiscoball(choosenRow, choosenCol, choosenType);
            }
            else if(matches.length >= 7) {
                this.spawnBomb(choosenRow, choosenCol);
            }
            else if(matches.length >= 5) {
                this.spawnRocket(choosenRow, choosenCol, potentialBonus);
            }
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
    
            this.scheduleOnce(() => {
                this.clearAll();
                this.checkForPotentialBonuses();
                this.isClickAvailable = true;
            }, 0.1);
        }, 0.2);
    }

    scheduleRespawn(timeToRespawn: number) {
        this.scheduleOnce(() => {
            this.spawnNewTiles();
        }, timeToRespawn);
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

        let isMatchesFound = this.findAndDestroyMatches(tile, true);
        
        this.isClickAvailable = !isMatchesFound;
    }



    checkForPotentialBonuses() {
        let checkedTiles = [];

        for(let i = 0; i < this.numRows; i++) {
            for(let j = 0; j < this.numCols; j++) {
                let tile = this.tileArray[i][j];

                if(!checkedTiles.includes(tile) && tile !== null) {
                    const tileComponent = tile.getComponent("TileBase");
                    let matches = [];

                    if(tileComponent.isCommonTile()) {
                        matches = tileComponent.getMatches(this.tileArray);

                        if(matches.length >= 9) {
                            this.setPotentialBonus(matches, "discoball");
                        }
                        else if(matches.length >= 7) {
                            this.setPotentialBonus(matches, "bomb");
                        }
                        else if(matches.length >= 5) {
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


