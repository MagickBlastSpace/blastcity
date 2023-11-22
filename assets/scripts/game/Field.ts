import { _decorator, Component, Node, instantiate, Prefab, Vec2, Vec3 } from 'cc';
import { Tile } from './Tile';
const { ccclass, property } = _decorator;

@ccclass('Field')
export class Field extends Component {
    @property(Prefab)
    tilePrefab: Prefab = null;
    @property(Prefab)
    bombPrefab: Prefab = null;

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
        this.spawnInitialBoard();
    }

    /*init field*/
    spawnInitialBoard() {
        for (let row = 0; row < this.numRows; row++) {
            this.tileArray[row] = [];
            for (let col = 0; col < this.numCols; col++) {
                this.spawnCommonTile(row, col);
            }
        }

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


    /*matches logic*/
    findAndDestroyMatches(tile: Node): boolean {
        let isMatchesFound = false;
        let tilesToNull = [];

        let choosenTile = tile.getComponent("TileBase");
        const choosenRow = choosenTile.getRow();
        const choosenCol = choosenTile.getCol();
        const isBonus = choosenTile.isBonusTile();

        const matches = choosenTile.getMatches(this.tileArray);
        
        if(matches.length >= 2) {
            matches.forEach(matchedTile => {
                let tileComponent = matchedTile.getComponent("TileBase");
                tilesToNull.push(new Vec2(tileComponent.getRow(), tileComponent.getCol()));
                tileComponent.destroyTile();
            })
            isMatchesFound = true;
        }

        for(let i = 0; i < tilesToNull.length; i++) {
            this.tileArray[tilesToNull[i].x][tilesToNull[i].y] = null;
        }

        if(matches.length > 5 && !isBonus) {
            this.spawnBomb(choosenRow, choosenCol);
        }

        this.spawnNewTiles();

        return isMatchesFound;
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
                        let tileComponent = tile.getComponent("TileBase");
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
                        this.spawnCommonTile(row, col);
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


