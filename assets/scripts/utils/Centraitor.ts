import { _decorator, Component, Node, Vec2 } from 'cc';
import { ResolutionManager } from './ResolutionManager';
const { ccclass, property } = _decorator;

@ccclass('Centraitor')
export class Centraitor extends Component {
    @property(Vec2)
    startPosition: Vec2 = null;

    @property(Node)
    field: Node = null;

    @property
    tileSize: number = 40;

    private numRows: number = 0;
    private numCols: number = 0;

    private portraitOffset_Y: number = -200;


    start() {
        this.field.on("centrate", (tiles) => this.centrateField(tiles));
    }

    centrateField(field: Node[][]) {
        this.numRows = field.length;
        this.numCols = field.length > 0 ? field[0].length : 0;

        let upperEmptySpaces = this.countUpperEmptySpaces(field);
        let bottomEmptySpaces = this.countBottomEmptySpaces(field);
        let leftEmptySpaces = this.countLeftEmptySpaces(field);
        let rightEmptySpaces = this.countRightEmptySpaces(field);

        //console.log(upperEmptySpaces + "-" + bottomEmptySpaces + "-" + leftEmptySpaces + "-" + rightEmptySpaces);
        let scaleX = this.field.scale.x;
        let scaleY = this.field.scale.y;

        let moveY = (upperEmptySpaces - bottomEmptySpaces) * this.tileSize * scaleX / 2;
        let moveX = (rightEmptySpaces - leftEmptySpaces) * this.tileSize * scaleY / 2;

        moveY = ResolutionManager.instance.isPortraitOrientation() ? moveY + this.portraitOffset_Y : moveY;

        this.move(this.startPosition.x + moveX, this.startPosition.y + moveY);

        this.node.emit("render_borders", field, upperEmptySpaces, rightEmptySpaces, bottomEmptySpaces, leftEmptySpaces);
    }


    move(posX: number, posY: number) {
        this.node.setPosition(posX, posY);
    }


    countUpperEmptySpaces(field: Node[][]): number {
        let empty = 0;

        for(let i = this.numRows - 1; i >= 0; i--) {
            for(let j = 0; j < this.numCols; j++) {
                if(field[i][j] === null || field[i][j] === undefined) {
                    return empty;
                }

                let tileComp = field[i][j].getComponent("TileBase");
                if(!tileComp.isEmptyTile()) {
                    return empty;
                }
            }

            empty = empty + 1;
        }

        return empty;
    }

    countBottomEmptySpaces(field: Node[][]): number {
        let empty = 0;

        for(let i = 0; i < this.numRows; i++) {
            for(let j = 0; j < this.numCols; j++) {
                if(field[i][j] === null || field[i][j] === undefined) {
                    return empty;
                }

                let tileComp = field[i][j].getComponent("TileBase");
                if(!tileComp.isEmptyTile()) {
                    return empty;
                }
            }

            empty = empty + 1;
        }

        return empty;
    }

    countLeftEmptySpaces(field: Node[][]): number {
        let empty = 0;

        for(let j = 0; j < this.numCols; j++) {
            for(let i = 0; i < this.numRows; i++) {
                if(field[i][j] === null || field[i][j] === undefined) {
                    return empty;
                }

                let tileComp = field[i][j].getComponent("TileBase");
                if(!tileComp.isEmptyTile()) {
                    return empty;
                }
            }

            empty = empty + 1;
        }

        return empty;
    }

    countRightEmptySpaces(field: Node[][]): number {
        let empty = 0;

        for(let j = this.numCols - 1; j >= 0; j--) {
            for(let i = 0; i < this.numRows; i++) {
                if(field[i][j] === null || field[i][j] === undefined) {
                    return empty;
                }

                let tileComp = field[i][j].getComponent("TileBase");
                if(!tileComp.isEmptyTile()) {
                    return empty;
                }
            }

            empty = empty + 1;
        }

        return empty;
    }
}


