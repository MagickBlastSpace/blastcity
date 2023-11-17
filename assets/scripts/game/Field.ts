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
    spawnRandomTile(row: number, col: number): Node {
        const tileType = Math.floor(Math.random() * 5);
        const tileNode = instantiate(this.tilePrefab);
        const tileComponent = tileNode.getComponent("Tile");

        tileComponent.init(tileType, row, col);
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
                let tile = this.spawnRandomTile(row, col);
    
                while (this.checkVerticalMatches(tile)) {
                    tile.destroy();
                    const newTile = this.spawnRandomTile(row, col);
                    tile = newTile;
                }
    
                while (this.checkHorizontalMatches(tile)) {
                    tile.destroy();
                    const newTile = this.spawnRandomTile(row, col);
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

        this.currentMatches = [];
        this.currentMatches.push(tile);

        const matches = this.findMatches(tile);
        
        if (matches.length >= 2) {
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
                        const newTile = this.spawnRandomTile(row, col);
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

        let isMatchesFound = this.findAndDestroyMatches(tile);
        this.isClickAvailable = !isMatchesFound;
    }
}


