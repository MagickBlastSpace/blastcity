import { _decorator, Component, Node, Vec2, Prefab, instantiate } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BorderRenderer')
export class BorderRenderer extends Component {

    @property(Prefab)
    itemPrefab: Prefab = null;

    @property(Node)
    itemsLayout: Node = null;

    @property(Node)
    centraitor: Node = null;

    private itemsArray: Node[] = [];


    start() {
        this.centraitor.on("render_borders", (tiles, up, right, bot, left) => this.setBorderLines(tiles, up, right, bot, left));
    }

    setBasicBorders(field: Node[][]) {
        this.clearAll();

        let numRows = field.length;
        let numCols = field.length > 0 ? field[0].length : 0;

        for (let row = 0; row < numRows; row++) {
            for (let col = 0; col < numCols; col++) {
                let choosenTile = field[row][col];
                if(choosenTile !== null) {
                    let comp = choosenTile.getComponent("TileBase");
                    if(comp.isEmptyTile()) {
                        continue;
                    }
                }

                this.spawnBasicItem(row, col);
            }
        }
    }

    setBorderLines(field: Node[][], u: number, r: number, b: number, l: number) {
        this.clearAll();

        let numRows = field.length - u;
        let numCols = field.length > 0 ? field[0].length - r : 0;

        let startRow = b;
        let startCol = l;

        //console.log("Setting borders for field: up-" + u + "; right-" + r + "; bot-" + b + "; left-" + l);

        for (let row = startRow; row < numRows; row++) {
            for (let col = startCol; col < numCols; col++) {
                let choosenTile = field[row][col];

                let isBorderItem = false;
                
                if(choosenTile !== null) {
                    let comp = choosenTile.getComponent("TileBase");
                    if(!comp.isEmptyTile()) {
                        isBorderItem = true;
                    }
                }
                else {
                    isBorderItem = true;
                }

                if(isBorderItem) {
                    let upper = row === numRows - 1;
                    let bottom = row === startRow;
                    let left = col === startCol;
                    let right = col === numCols - 1;

                    let upper_right = false;
                    let bottom_right = false;
                    let upper_left = false;
                    let bottom_left = false;

                    if(!upper) {
                        let tile = field[row + 1][col];
                        if(tile !== null) {
                            let comp = tile.getComponent("TileBase");
                            upper = comp.isEmptyTile();
                        }
                    }
                    if(!bottom) {
                        let tile = field[row - 1][col];
                        if(tile !== null) {
                            let comp = tile.getComponent("TileBase");
                            bottom = comp.isEmptyTile();
                        }
                    }
                    if(!right) {
                        let tile = field[row][col + 1];
                        if(tile !== null) {
                            let comp = tile.getComponent("TileBase");
                            right = comp.isEmptyTile();
                        }
                    }
                    if(!left) {
                        let tile = field[row][col - 1];
                        if(tile !== null) {
                            let comp = tile.getComponent("TileBase");
                            left = comp.isEmptyTile();
                        }
                    }
                    
                    if(bottom && row > startRow && col > startCol) {
                        let tile = field[row - 1][col - 1];
                        if(tile !== null) {
                            let comp = tile.getComponent("TileBase");
                            upper_right = !comp.isEmptyTile();
                        }
                    }
                    if(right && row > startRow && col < numCols - 1) {
                        let tile = field[row - 1][col + 1];
                        if(tile !== null) {
                            let comp = tile.getComponent("TileBase");
                            bottom_right = !comp.isEmptyTile();
                        }
                    }
                    if(bottom && row > startRow && col < numCols - 1) {
                        let tile = field[row - 1][col + 1];
                        if(tile !== null) {
                            let comp = tile.getComponent("TileBase");
                            upper_left = !comp.isEmptyTile();
                        }
                    }
                    if(left && row > startRow && col > startCol) {
                        let tile = field[row - 1][col - 1];
                        if(tile !== null) {
                            let comp = tile.getComponent("TileBase");
                            bottom_left = !comp.isEmptyTile();
                        }
                    }
                    
                    let directions = [];
                    
                    directions.push(upper);
                    directions.push(right);
                    directions.push(bottom);
                    directions.push(left);
                    
                    directions.push(upper_right);
                    directions.push(bottom_right);
                    directions.push(upper_left);
                    directions.push(bottom_left);

                    //console.log("Spawning item at row-" + row + " col-" + col + ": up-" + upper + "; right-" + right + "; bot-" + bottom + "; left-" + left);
                    
                    this.spawnItem(row, col, directions);
                }
            }
        }
    }

    spawnItem(row: number, col: number, dir: boolean[]) {
        const itemNode = instantiate(this.itemPrefab);
        const itemComponent = itemNode.getComponent("BorderItem");

        itemComponent.init(row, col, dir);
        this.itemsLayout.addChild(itemNode);

        this.itemsArray.push(itemNode);
    }

    spawnBasicItem(row: number, col: number) {
        const itemNode = instantiate(this.itemPrefab);
        const itemComponent = itemNode.getComponent("BorderItem");

        this.itemsLayout.addChild(itemNode);
        itemComponent.init(row, col);

        this.itemsArray.push(itemNode);
    }

    clearAll() {
        for(let i = 0; i < this.itemsArray.length; i++) {
            this.itemsArray[i].destroy();
        }

        this.itemsArray = [];
    }
}


