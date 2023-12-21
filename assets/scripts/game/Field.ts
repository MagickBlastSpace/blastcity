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
    @property([SpecialPrefabData])
    statusPrefabs: SpecialPrefabData[] = [];

    @property(Node)
    tilesLayout: Node = null;
    @property(Node)
    statusLayout: Node = null;

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

    @property
    tileSize: number = 40;

    private tileArray: Node[][] = [];
    private statusArray: Node[][] = [];

    private isClickAvailable: bool = false;

    private availableColors: string[] = [];


    start() {
        for (let row = 0; row < this.numRows; row++) {
            this.tileArray[row] = [];
            this.statusArray[row] = [];
            for (let col = 0; col < this.numCols; col++) {
                this.tileArray[row][col] = null;
                this.statusArray[row][col] = null;
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

        for(let i = 0; i < level.statuses.length; i++) {
            this.spawnStatus(level.statuses[i].row, level.statuses[i].col, level.statuses[i].id);
        }

        this.checkForPotentialBonuses();
        this.isClickAvailable = true;
    }

    clearBoard() {
        for (let row = 0; row < this.numRows; row++) {
            for (let col = 0; col < this.numCols; col++) {
                let tile = this.tileArray[row][col];
                if(tile !== null) {
                    this.destroyTile(row, col, true);
                }

                let status = this.statusArray[row][col];
                if(status !== null) {
                    this.destroyStatus(row, col, true);
                }
            }
        }
    }


    spawnCommonTile(row: number, col: number): Node {
        this.destroyTile(row, col, true);
        const tileNode = instantiate(this.tilePrefab);
        const tileComponent = tileNode.getComponent("Tile");
        const tileTypeIndex = Math.floor(Math.random() * this.availableColors.length).toString();
        const tileType = this.availableColors[tileTypeIndex];
        let spawnedTile = this.initTile(tileComponent, row, col, tileType);
        return spawnedTile;
    }

    spawnBomb(row: number, col: number): Node {
        this.destroyTile(row, col, true);
        const tileNode = instantiate(this.bombPrefab);
        const tileComponent = tileNode.getComponent("Bomb");
        let spawnedTile = this.initTile(tileComponent, row, col, "bomb");
        return spawnedTile;
    }

    spawnRocket(row: number, col: number, tileType: string): Node {
        this.destroyTile(row, col, true);
        const tileNode = instantiate(this.rocketPrefab);
        const tileComponent = tileNode.getComponent("Rocket");
        let spawnedTile = this.initTile(tileComponent, row, col, tileType);
        return spawnedTile;
    }

    spawnDiscoball(row: number, col: number, tileType: string): Node {
        this.destroyTile(row, col, true);
        const tileNode = instantiate(this.discoballPrefab);
        const tileComponent = tileNode.getComponent("Discoball");
        let spawnedTile = this.initTile(tileComponent, row, col, tileType);
        return spawnedTile;
    }

    spawnEmptyTile(row: number, col: number): Node {
        this.destroyTile(row, col, true);
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

        this.destroyTile(row, col, true);
        const tileNode = instantiate(prefab);
        const tileComponent = tileNode.getComponent("SpecTileBase");
        let spawnedTile = this.initTile(tileComponent, row, col, tileId);
        return spawnedTile;
    }

    spawnStatus(row: number, col: number, statusId: string): Node {
        const prefab = this.statusPrefabs.find(p => p.id === statusId)?.prefab;
        if(prefab === null) {
            return;
        }

        this.destroyStatus(row, col, true);
        const statusNode = instantiate(prefab);
        const statusComponent = statusNode.getComponent("StatusBase");
        let spawnedStatus = this.initStatus(statusComponent, row, col, statusId);
        return spawnedStatus;
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

        this.scheduleOnce(() => {
            this.findAndDestroyMatches(spawnedTile, false);
        }, timeToDestroy);
    }


    initTile(tileComponent: any, row: number, col: number, tileType: string): Node {
        tileComponent.init(row, col, tileType);

        let isDoubleWidth = tileComponent.isSpecialTile() ? tileComponent.isDoubleWidth() : false;
        let isDoubleHeight = tileComponent.isSpecialTile() ? tileComponent.isDoubleHeight() : false;

        const tileNode = tileComponent.node;
        let posX = col * (this.tileSize + this.tileSpacing) + this.xOffset;
        let posY = row * (this.tileSize + this.tileSpacing) + this.yOffset;
        posX = isDoubleWidth ? posX + this.tileSize / 2 : posX;
        posY = isDoubleHeight ? posY + this.tileSize / 2 : posY;

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
        tileNode.on("damage_all", (tileId) => {
            this.setAllDamagedByType(tileId);
        });

        this.tileArray[row][col] = tileNode;
        if(isDoubleWidth) {
            this.destroyTile(row, col + 1, false);
            this.tileArray[row][col + 1] = tileNode;
        }
        if(isDoubleHeight) {
            this.destroyTile(row + 1, col, false);
            this.tileArray[row + 1][col] = tileNode;
        }
        if(isDoubleWidth && isDoubleHeight) {
            this.destroyTile(row + 1, col + 1, false);
            this.tileArray[row + 1][col + 1] = tileNode;
        }

        this.tilesLayout.addChild(tileNode);

        return tileNode;
    }

    initStatus(statusComponent: any, row: number, col: number, statusType: string): Node {
        statusComponent.init(row, col, statusType);

        const statusNode = statusComponent.node;
        let posX = col * (this.tileSize + this.tileSpacing) + this.xOffset;
        let posY = row * (this.tileSize + this.tileSpacing) + this.yOffset;

        statusComponent.node.setPosition(posX, posY);

        statusNode.on("change", (row, col, statusId) => {
            this.spawnStatus(row, col, statusId);
        });

        this.statusArray[row][col] = statusNode;
        this.statusLayout.addChild(statusNode);

        this.checkForPotentialBonuses();

        return statusNode;
    }

    destroyTile(row: number, col: number, isClear: boolean) {
        const tile = this.tileArray[row][col];
        if(tile !== null) {
            let tileComponent = tile.getComponent("TileBase");
            if(tileComponent.isEmptyTile()) {
                return;
            }
            if(isClear) {
                tileComponent.destroyClear();
            }
            else {
                tileComponent.destroyTile();
            }
            this.tileArray[row][col] = null;
        }
    }

    destroyStatus(row: number, col: number, isClear: boolean) {
        const status = this.statusArray[row][col];
        if(status !== null) {
            let statusComponent = status.getComponent("StatusBase");
            if(isClear) {
                statusComponent.destroyClear();
            }
            else {
                statusComponent.destroyStatus();
            }
            this.statusArray[row][col] = null;
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
        
        let matches = choosenTile.getMatches(this.tileArray, this.statusArray);
        
        if(matches.length >= 2 || isBonus) {
            matches.forEach(matchedTile => {
                if(matchedTile !== null) {
                    let tileComponent = matchedTile.getComponent("TileBase");
                    let isDestroyAvailable = this.isDestroyAvailable(tileComponent.getRow(), tileComponent.getCol());
                    if(this.availableColors.includes(choosenType) && isDestroyAvailable) {
                        tileComponent.giveDamage(this.tileArray, this.statusArray);
                    }

                    if(isDestroyAvailable && !tileComponent.isSpecialTile()) {
                        this.tileArray[tileComponent.getRow()][tileComponent.getCol()] = null;
                        tileComponent.destroyTile();
                    }

                    if(isBonus && !this.availableColors.includes(choosenType)) {
                        if(tileComponent.isSpecialTile() && isDestroyAvailable) {
                            tileComponent.getDamage("bonus");
                        }
                        this.giveStatusDamage(tileComponent.getRow(), tileComponent.getCol());
                    }
                }
            })
        }
        else {
            return false;
        }

        if(!isRespawn) {
            return true;
        }

        this.checkSpecTilesForDestroy();

        this.scheduleOnce(() => {
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

            if(matches.length > 0) {
                this.spawnNewTiles();
            }
        }, 0.2);

        return true;
    }

    isDestroyAvailable(row: number, col: number): boolean {
        let status = this.statusArray[row][col];
        if(status === null) {
            return true;
        }

        const statusComponent = status.getComponent("StatusBase");

        return !statusComponent.isBlockingDestroyTile();
    }

    giveStatusDamage(row: number, col: number) {
        if(this.statusArray[row][col] === null) {
            return;
        }

        const statusComp = this.statusArray[row][col].getComponent("StatusBase");
        statusComp.getDamage();
    }


    spawnNewTiles() {
        this.checkStatusesForDestroy();
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
                        if (!tileComponent.isTileShifts() || tileComponent.getRow() !== row || !this.isFallMovementAvailable(tileComponent.getRow(), tileComponent.getCol())) {
                            shouldSpawnNewTile = false;
                            break;
                        }
                    }
                    if (tile === null && shouldSpawnNewTile) {
                        this.spawnCommonTile(row, col);
                    }
                }
            }
    
            this.checkSpecTilesInActionEffect();
            this.checkForPotentialBonuses();
            this.isClickAvailable = true;

        }, 0.2);
    }

    scheduleRespawn(timeToRespawn: number) {
        this.isClickAvailable = false;
        this.scheduleOnce(() => {
            this.spawnNewTiles();
        }, timeToRespawn);
    }
    


    fallTiles() {
        for (let col = 0; col < this.numCols; col++) {
            let emptySpaces = 0;
            let holes = 0;
    
            for (let row = 0; row < this.numRows; row++) {
                const tile = this.tileArray[row][col];
    
                if (tile === null) {
                    emptySpaces++;
                } else {
                    let tileComponent = tile.getComponent("TileBase");

                    if(!tileComponent.isTileShifts() || tileComponent.getRow() !== row || !this.isFallMovementAvailable(tileComponent.getRow(), tileComponent.getCol())) {
                        emptySpaces = 0;
                        holes = 0;
                    }
                    else if (tileComponent.isEmptyTile()) {
                        if (!tileComponent.isBorder(this.tileArray)) {
                            holes++;
                        }
                    }
                    else if (emptySpaces > 0) {
                        let newRow = row - emptySpaces - holes;
    
                        let balance = 0;
                        while (holes >= 0 && newRow < row - 1 && !tileComponent.canFall(this.tileArray, newRow)) {
                            holes--;
                            newRow = row - emptySpaces - holes + balance;
                            if(holes <= 0) {
                                balance++;
                            }
                        }
    
                        if (tileComponent.canFall(this.tileArray, newRow)) {
                            tileComponent.setRow(newRow);

                            let isDoubleWidth = tileComponent.isSpecialTile() ? tileComponent.isDoubleWidth() : false;
                            let isDoubleHeight = tileComponent.isSpecialTile() ? tileComponent.isDoubleHeight() : false;

                            let posX = tileComponent.getCol() * (this.tileSize + this.tileSpacing) + this.xOffset;
                            let posY = newRow * (this.tileSize + this.tileSpacing) + this.yOffset;
                            posX = isDoubleWidth ? posX + this.tileSize / 2 : posX;
                            posY = isDoubleHeight ? posY + this.tileSize / 2 : posY;

                            this.tileArray[newRow][col] = tile;
                            this.tileArray[row][col] = null;

                            if(isDoubleWidth) {
                                this.tileArray[row][tileComponent.getCol()] = null;
                                this.tileArray[row][tileComponent.getCol() + 1] = null;
                                this.tileArray[newRow][tileComponent.getCol()] = tile;
                                this.tileArray[newRow][tileComponent.getCol() + 1] = tile;
                            }
                            if(isDoubleHeight) {
                                this.tileArray[row + 1][tileComponent.getCol()] = null;
                                this.tileArray[newRow + 1][tileComponent.getCol()] = tile;
                            }
                            if(isDoubleWidth && isDoubleHeight) {
                                this.tileArray[row + 1][tileComponent.getCol() + 1] = null;
                                this.tileArray[newRow + 1][tileComponent.getCol() + 1] = tile;
                            }
                            
                            cc.tween(tile)
                                .to(0.25, { position: new cc.Vec3(posX, posY, 0) })
                                .call(() => {
                                    if(isDoubleWidth) {
                                        //this.showMatrixDebugMessage();
                                        this.fallTiles();
                                        return;
                                    }
                                })
                                .start();
                        }
                        else {
                            emptySpaces = 0;
                            holes = 0;
                        }
                    }
                }
            }
        }
    }


    isFallMovementAvailable(row: number, col: number): boolean {
        let status = this.statusArray[row][col];
        if(status === null) {
            return true;
        }

        const statusComponent = status.getComponent("StatusBase");

        return !statusComponent.isBlockingMovement();
    }


    checkSpecTilesForDestroy(): boolean {
        let isDestroyed = false;
        for(let i = 0; i < this.numRows; i++) {
            for(let j = 0; j < this.numCols; j++) {
                let tile = this.tileArray[i][j];
                if(tile !== null) {
                    let tileComponent = null;
                    try {
                        tileComponent = tile.getComponent("TileBase");
                    } catch (error) {
                        this.tileArray[i][j] = null;
                        continue;
                    }

                    if(tileComponent.isSpecialTile()) {
                        if(tileComponent.isReadyToDestroy()) {
                            this.tileArray[tileComponent.getRow()][tileComponent.getCol()] = null;
                            if(tileComponent.isDoubleWidth()) {
                                this.tileArray[tileComponent.getRow()][tileComponent.getCol() + 1] = null;
                            }
                            if(tileComponent.isDoubleHeight()) {
                                this.tileArray[tileComponent.getRow() + 1][tileComponent.getCol()] = null;
                            }
                            if(tileComponent.isDoubleWidth() && tileComponent.isDoubleHeight()) {
                                this.tileArray[tileComponent.getRow() + 1][tileComponent.getCol() + 1] = null;
                            }
                            tileComponent.destroyTile();
                            isDestroyed = true;
                        }
                    }
                }
            }
        }
        return isDestroyed;
    }

    checkStatusesForDestroy() {
        for(let i = 0; i < this.numRows; i++) {
            for(let j = 0; j < this.numCols; j++) {
                let status = this.statusArray[i][j];
                if(status !== null) {
                    let statusComponent = status.getComponent("StatusBase");
                    if(statusComponent.isReadyToDestroy()) {
                        this.statusArray[i][j] = null;
                        statusComponent.destroyStatus();
                    }
                }
            }
        }
    }


    checkSpecTilesInActionEffect() {
        for(let i = 0; i < this.numRows; i++) {
            for(let j = 0; j < this.numCols; j++) {
                let tile = this.tileArray[i][j];
                if(tile !== null) {
                    let tileComponent = null;
                    try {
                        tileComponent = tile.getComponent("TileBase");
                    } catch (error) {
                        this.tileArray[i][j] = null;
                        continue;
                    }

                    if(tileComponent.isSpecialTile()) {
                        tileComponent.startInActionEffect(this.tileArray);
                    }
                }
            }
        }
    }

    
    onTileClick(tile: Node) {
        if(!this.isClickAvailable || tile === null) {
            return;
        }

        const tileComponent = tile.getComponent("TileBase");
        if(!this.isInteractionAvailable(tileComponent.getRow(), tileComponent.getCol())) {
            return;
        }

        let isMatchesFound = this.findAndDestroyMatches(tile, true);
        
        this.isClickAvailable = !isMatchesFound;
    }

    isInteractionAvailable(row: number, col: number): boolean {
        let status = this.statusArray[row][col];
        if(status === null) {
            return true;
        }

        const statusComponent = status.getComponent("StatusBase");

        return !statusComponent.isBlockingInteraction();
    }



    checkForPotentialBonuses() {
        this.clearAll();

        let checkedTiles = [];

        for(let i = 0; i < this.numRows; i++) {
            for(let j = 0; j < this.numCols; j++) {
                let tile = this.tileArray[i][j];

                if(!checkedTiles.includes(tile) && tile !== null) {
                    const tileComponent = tile.getComponent("TileBase");
                    let matches = [];

                    if(tileComponent.isCommonTile()) {
                        matches = tileComponent.getMatches(this.tileArray, this.statusArray);

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

    setAllDamagedByType(tileId: string) {
        for(let i = 0; i < this.numRows; i++) {
            for(let j = 0; j < this.numCols; j++) {
                let tile = this.tileArray[i][j];
                if(tile !== null) {
                    let tileComponent = null;
                    try {
                        tileComponent = tile.getComponent("TileBase");
                    } catch (error) {
                        this.tileArray[i][j] = null;
                        continue;
                    }

                    if(tileComponent.getTileType() === tileId) {
                        tileComponent.setAsDamaged();
                    }
                }
            }
        }
    }



    showMatrixDebugMessage() {
        for (let row = this.numRows - 1; row >= 0; row--) {
            let debugMatrix = "";
            for (let col = 0; col < this.numCols; col++) {
                const tile = this.tileArray[row][col];
                if(tile !== null) {
                    debugMatrix += tile.getComponent("TileBase").getTileType();
                }
                else {
                    debugMatrix += "null";
                }
                debugMatrix += "(" + row + ", " + col + ") ";
            }
            console.log(debugMatrix);
            console.log('-----------------');
        }
    }
}


