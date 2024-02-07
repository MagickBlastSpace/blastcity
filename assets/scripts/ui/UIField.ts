import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIField')
export class UIField extends Component {

    @property(Node)
    field: Node = null;

    @property
    tileSpacing: number = 5;
    @property
    xOffset: number = -150;
    @property
    yOffset: number = -175;

    @property
    tileSize: number = 40;


    start() {
        this.field.on("refresh", (tiles) => this.refresh(tiles));
        this.field.on("init_tile", (tile) => this.init(tile));
        this.field.on("init_status", (status) => this.initStatus(status));
    }


    init(tile: Node) {
        if(tile === null) {
            return;
        }

        const tileComponent = tile.getComponent("TileBase");
        const tileUi = tile.getComponent("UITile");

        let isDoubleWidth = tileComponent.isSpecialTile() ? tileComponent.isDoubleWidth() : false;
        let isDoubleHeight = tileComponent.isSpecialTile() ? tileComponent.isDoubleHeight() : false;

        let isTripleWidth = tileComponent.isSpecialTile() ? tileComponent.isTripleWidth() : false;
        let isTripleHeight = tileComponent.isSpecialTile() ? tileComponent.isTripleHeight() : false;

        let posX = tileComponent.getCol() * (this.tileSize + this.tileSpacing) + this.xOffset;
        let posY = tileComponent.getRow() * (this.tileSize + this.tileSpacing) + this.yOffset;

        posX = isDoubleWidth ? posX + this.tileSize / 2 : posX;
        posY = isDoubleHeight ? posY + this.tileSize / 2 : posY;

        posX = isTripleWidth ? posX + this.tileSize / 2 : posX;
        posY = isTripleHeight ? posY + this.tileSize / 2 : posY;

        tileUi.init(posX, posY);
    }

    initStatus(status: Node) {
        if(status === null) {
            return;
        }

        const statusComponent = status.getComponent("StatusBase");
        const tileUi = status.getComponent("UITile");

        let posX = statusComponent.getCol() * (this.tileSize + this.tileSpacing) + this.xOffset;
        let posY = statusComponent.getRow() * (this.tileSize + this.tileSpacing) + this.yOffset;

        tileUi.init(posX, posY);
    }

    
    refresh(tiles: Node[][]) {
        const numRows: number = tiles.length;
        const numCols: number = tiles.length > 0 ? tiles[0].length : 0;

        for(let i = 0; i < numRows; i++) {
            for(let j = 0; j < numCols; j++) {

                if(tiles[i][j] === null) {
                    continue;
                }

                const tile = tiles[i][j];
                let tileComponent = tile.getComponent("TileBase");

                if(tileComponent.isEmptyTile()) {
                    continue;
                }

                let isDoubleWidth = tileComponent.isSpecialTile() ? tileComponent.isDoubleWidth() : false;
                let isDoubleHeight = tileComponent.isSpecialTile() ? tileComponent.isDoubleHeight() : false;

                let posX = tileComponent.getCol() * (this.tileSize + this.tileSpacing) + this.xOffset;
                let posY = tileComponent.getRow() * (this.tileSize + this.tileSpacing) + this.yOffset;
                posX = isDoubleWidth ? posX + this.tileSize / 2 : posX;
                posY = isDoubleHeight ? posY + this.tileSize / 2 : posY;

                let tileUiComponent = tile.getComponent("UITile");
                tileUiComponent.moveTo(posX, posY);
            }
        }
    }
}


