import { _decorator, Component, Node, Vec2 } from 'cc';
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

    @property([Node])
    tilesLayouts: Node[] = [];
    @property([Node])
    statusLayouts: Node[] = [];
    @property(Node)
    tilesLayout: Node = null;
    @property(Node)
    emptyTilesLayout: Node = null;
    @property(Node)
    statusLayout: Node = null;


    start() {
        this.field.on("refresh", (tiles, statuses) => this.refresh(tiles, statuses));
        this.field.on("init_tile", (tile, isStatus) => this.init(tile, isStatus));
        this.field.on("init_status", (status) => this.initStatus(status));
    }


    init(tile: Node, isStatus: boolean) {
        if(tile === null) {
            return;
        }

        const tileComponent = tile.getComponent("TileBase");
        const tileUi = tile.getComponent("UITile");

        this.tilesLayout.addChild(tile);
        let layout = tileComponent.isEmptyTile() ? this.emptyTilesLayout : this.tilesLayouts[tileComponent.getRow()];

        if(isStatus) {
            layout.addChild(tile);
        }

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

        tileUi.init(posX, posY, layout, false);
    }

    initStatus(status: Node) {
        if(status === null) {
            return;
        }

        this.statusLayout.addChild(status);

        const statusComponent = status.getComponent("StatusBase");
        const tileUi = status.getComponent("UITile");

        let layout = statusComponent.getStatusType().split("_")[0] === "dynamite" ? this.statusLayout : this.statusLayouts[statusComponent.getRow()];

        let posX = statusComponent.getCol() * (this.tileSize + this.tileSpacing) + this.xOffset;
        let posY = statusComponent.getRow() * (this.tileSize + this.tileSpacing) + this.yOffset;

        tileUi.init(posX, posY, layout, true);
    }

    
    refresh(tiles: Node[][], statuses: Node[][]) {
        const numRows: number = tiles.length;
        const numCols: number = tiles.length > 0 ? tiles[0].length : 0;

        for(let i = 0; i < numRows; i++) {
            for(let j = 0; j < numCols; j++) {

                if(tiles[i][j] === null) {
                    continue;
                }

                const tile = tiles[i][j];
                let tileComponent = tile.getComponent("TileBase");

                let newLayout = this.tilesLayouts[tileComponent.getRow()];

                if(tileComponent.isEmptyTile()) {
                    continue;
                }

                if(statuses[i][j] !== null) {
                    newLayout.addChild(tile);
                }

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

                let tileUiComponent = tile.getComponent("UITile");
                tileUiComponent.moveTo(posX, posY, newLayout);
            }
        }
    }
}


