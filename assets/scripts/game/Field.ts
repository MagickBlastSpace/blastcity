import { _decorator, Component, Node, instantiate, Prefab, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Field')
export class Field extends Component {
    @property(Prefab)
    tilePrefab: Prefab = null;

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
    private currentMatches: Node[] = [];

    private isClickAvailable: bool = false;


    start() {
        this.spawnInitialBoard();
    }

    /*init field*/
    spawnCommonTile(row: number, col: number): Node {
        const tileType = Math.floor(Math.random() * 4).toString();
        let tileNode = this.spawnTile(row, col, tileType);
        return tileNode;
    }

    spawnBomb(row: number, col: number) {
        const tileNode = this.spawnTile(row, col, "bomb");
        this.tileArray[row][col] = tileNode;
        this.node.addChild(tileNode);
    }

    spawnTile(row: number, col: number, tileType: string): Node {
        const tileNode = instantiate(this.tilePrefab);
        const tileComponent = tileNode.getComponent("Tile");

        tileComponent.init(row, col, tileType);
        const posX = col * (tileNode.width + this.tileSpacing) + this.xOffset;
        const posY = row * (tileNode.height + this.tileSpacing) + this.yOffset;
        tileNode.setPosition(posX, posY + tileNode.height);

        cc.tween(tileNode)
            .to(0.2, { position: new Vec3(posX, posY, 0) })
            .start();

        tileNode.on("click", (tile) => {
            this.onTileClick(tile);
        });

        return tileNode;
    }


    spawnInitialBoard() {
        for (let row = 0; row < this.numRows; row++) {
            this.tileArray[row] = [];
            for (let col = 0; col < this.numCols; col++) {
                let tile = this.spawnCommonTile(row, col);
    
                while (this.checkVerticalMatches(tile)) {
                    tile.destroy();
                    const newTile = this.spawnCommonTile(row, col);
                    tile = newTile;
                }
    
                while (this.checkHorizontalMatches(tile)) {
                    tile.destroy();
                    const newTile = this.spawnCommonTile(row, col);
                    tile = newTile;
                }
    
                this.tileArray[row][col] = tile;
                this.node.addChild(tile);
            }
        }

        this.isClickAvailable = true;
    }
    
    checkVerticalMatches(tile: Node): boolean {
        const row = tile.getComponent("Tile").getRow();
        const col = tile.getComponent("Tile").getCol();
        const tileType = tile.getComponent("Tile").getTileType();
    
        if (row >= 2) {
            if (this.tileArray[row - 1][col].getComponent("Tile").getTileType() === tileType &&
                this.tileArray[row - 2][col].getComponent("Tile").getTileType() === tileType) {
                return true;
            }
        }
    
        return false;
    }
    
    checkHorizontalMatches(tile: Node): boolean {
        const row = tile.getComponent("Tile").getRow();
        const col = tile.getComponent("Tile").getCol();
        const tileType = tile.getComponent("Tile").getTileType();
    
        if (col >= 2) {
            if (this.tileArray[row][col - 1].getComponent("Tile").getTileType() === tileType &&
                this.tileArray[row][col - 2].getComponent("Tile").getTileType() === tileType) {
                return true;
            }
        }
    
        return false;
    }


    /*matches logic*/
    findAndDestroyMatches(tile: Node): boolean {
        let isMatchesFound = false;
        let tilesToNull = [];

        let choosenTile = tile.getComponent("Tile");
        const choosenRow = choosenTile.getRow();
        const choosenCol = choosenTile.getCol();

        this.currentMatches = [];
        this.currentMatches.push(tile);

        const matches = this.findMatches(tile);
        
        if(matches.length >= 2) {
            matches.forEach(matchedTile => {
                let tileComponent = matchedTile.getComponent("Tile");
                tilesToNull.push(new Vec2(tileComponent.getRow(), tileComponent.getCol()));
                matchedTile.destroy();
            })
            isMatchesFound = true;
        }

        for(let i = 0; i < tilesToNull.length; i++) {
            this.tileArray[tilesToNull[i].x][tilesToNull[i].y] = null;
        }

        if(matches.length >= 5) {
            console.log("bombooooo");
            this.spawnBomb(choosenRow, choosenCol);
        }

        this.spawnNewTiles();

        return isMatchesFound;
    }

    findMatches(tile: Node): Node[] {
        let matches: Node[] = [];
        let tileComponent = tile.getComponent("Tile");

        matches = this.checkMatchesInDirection(tileComponent, 1, 0)
            .concat(this.checkMatchesInDirection(tileComponent, -1, 0))
            .concat(this.checkMatchesInDirection(tileComponent, 0, 1))
            .concat(this.checkMatchesInDirection(tileComponent, 0, -1));

        let newMatchesCount = matches.length;
        let startIndex = 0;
        while(newMatchesCount > 0) {
            newMatchesCount = 0;
            for(let i = startIndex; i < matches.length; i++) {
                tileComponent = matches[i].getComponent("Tile");
                const newMatches = this.checkMatchesInDirection(tileComponent, 1, 0)
                    .concat(this.checkMatchesInDirection(tileComponent, -1, 0))
                    .concat(this.checkMatchesInDirection(tileComponent, 0, 1))
                    .concat(this.checkMatchesInDirection(tileComponent, 0, -1));

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

    checkMatchesInDirection(tileComponent: any, dirX: number, dirY: number): Node[] {
        const row = tileComponent.getRow();
        const col = tileComponent.getCol();
        const tileType = tileComponent.getTileType();
        const matches: Node[] = [];

        let currentRow = row + dirY;
        let currentCol = col + dirX;

        while (currentRow >= 0 && currentRow < this.numRows &&
            currentCol >= 0 && currentCol < this.numCols) {
            const currentTile = this.tileArray[currentRow][currentCol];
            const currentTileComponent = currentTile.getComponent("Tile");

            if (currentTileComponent.getTileType() === tileType) {
                matches.push(currentTile);
                currentRow += dirY;
                currentCol += dirX;
            } else {
                break;
            }
        }

        return matches;
    }

    spawnNewTiles() {
        for (let col = 0; col < this.numCols; col++) {

            let emptySpaces = 0;

            for (let row = 0; row < this.numRows; row++) {
                const tile = this.tileArray[row][col];

                if (tile === null) {
                    emptySpaces++;
                }

                else {
                    if(emptySpaces > 0) {
                        let tileComponent = tile.getComponent("Tile");
                        tileComponent.setRow(row - emptySpaces);
                        this.tileArray[row - emptySpaces][col] = tile;
                        this.tileArray[row][col] = null;

                        const posX = col * (tile.width + this.tileSpacing) + this.xOffset;
                        const posY = (row - emptySpaces) * (tile.height + this.tileSpacing) + this.yOffset;
                        cc.tween(tile)
                            .to(0.2, { position: new Vec3(posX, posY, 0) })
                            .start();
                    }
                }
            }
        }

        this.scheduleOnce(() => {
            for (let col = 0; col < this.numCols; col++) {
                for (let row = 0; row < this.numRows; row++) {
                    const tile = this.tileArray[row][col];
                    if (tile === null) {
                        const newTile = this.spawnCommonTile(row, col);
                        this.tileArray[row][col] = newTile;
                        this.node.addChild(newTile);
                    }
                }
            }
        }, 0.25);

        this.scheduleOnce(() => {
            this.isClickAvailable = true;
        }, 0.3);
    }


    onTileClick(tile: Node) {
        if(!this.isClickAvailable) {
            return;
        }

        const tileComponent = tile.getComponent("Tile");
        const isBonus = tileComponent.isBonusTile();
        let isMatchesFound = false;

        if(isBonus) {
            this.onBonusTileClick(tileComponent);
        }
        else {
            isMatchesFound = this.findAndDestroyMatches(tile);
        }
        
        this.isClickAvailable = !isMatchesFound && !isBonus;
    }


    /*bonus tiles logic*/
    onBonusTileClick(tile: Tile) {
        const tileType = tile.getTileType();
        const row = tile.getRow();
        const col = tile.getCol();

        switch(tileType) {
            case "bomb":
                this.onBombClick(row, col);
                break;
        }
    }

    onBombClick(row: number, col: number) {
        let tilesToDestroy = this.getBombMatches(row, col);
        let bonusTiles = this.findBonusTiles(row, col, tilesToDestroy);

        while(bonusTiles.length > 0) {
            let newTilesToDestroy = [];
            bonusTiles.forEach(bonusTile => {
                const newMatches = this.getBombMatches(bonusTile.getRow(), bonusTile.getCol());
                newMatches.forEach(newMatch => {
                    if(!tilesToDestroy.includes(newMatch)) {
                        newTilesToDestroy.push(newMatch);
                    }
                })
            })
            bonusTiles = this.findBonusTiles(row, col, newTilesToDestroy);
            tilesToDestroy = tilesToDestroy.concat(newTilesToDestroy);
        }

        let tilesToNull = [];
        tilesToNull.push(new Vec2(row, col));
        tilesToDestroy.forEach(matchedTile => {
            if(matchedTile != null) {
                let tileComponent = matchedTile.getComponent("Tile");
                tilesToNull.push(new Vec2(tileComponent.getRow(), tileComponent.getCol()));
                matchedTile.destroy();
            }
        })

        for(let i = 0; i < tilesToNull.length; i++) {
            this.tileArray[tilesToNull[i].x][tilesToNull[i].y] = null;
        }

        this.spawnNewTiles();
    }


    getBombMatches(row: number, col: number): Node[] {
        let matches = [];
        matches.push(this.tileArray[row][col]);
        if(row < this.numRows - 1) {
            matches.push(this.tileArray[row + 1][col]);
        }
        if(row > 0) {
            matches.push(this.tileArray[row - 1][col]);
        }
        if(col < this.numCols - 1) {
            matches.push(this.tileArray[row][col + 1]);
        }
        if(col > 0) {
            matches.push(this.tileArray[row][col - 1]);
        }
        if(row < this.numRows - 1 && col < this.numCols - 1) {
            matches.push(this.tileArray[row + 1][col + 1]);
        }
        if(row > 0 && col > 0) {
            matches.push(this.tileArray[row - 1][col - 1]);
        }
        if(row < this.numRows - 1 && col > 0) {
            matches.push(this.tileArray[row + 1][col - 1]);
        }
        if(row > 0 && col < this.numCols - 1) {
            matches.push(this.tileArray[row - 1][col + 1]);
        }

        return matches;
    }


    findBonusTiles(row: number, col: number, matches: Node[]): Tile[] {
        let bonusTiles = [];
        matches.forEach(matchedTile => {
            let tileComponent = matchedTile.getComponent("Tile");
            const isBonus = tileComponent.isBonusTile();
            if(isBonus && !tileComponent.isCurrentTile(row, col)) {
                bonusTiles.push(tileComponent);
            }
        })

        return bonusTiles;
    }
}


