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
    @property(Node)
    tilesLayout: Node = null;
    @property(Node)
    emptyTilesLayout: Node = null;
    @property(Node)
    statusLayout: Node = null;


    start() {
        this.field.on("refresh", (tiles) => this.refresh(tiles));
        this.field.on("init_tile", (tile) => this.init(tile));
        this.field.on("init_status", (status) => this.initStatus(status));
        this.field.on("sort_statuses", (statuses) => this.sortStatuses(statuses));
    }


    init(tile: Node) {
        if(tile === null) {
            return;
        }

        const tileComponent = tile.getComponent("TileBase");
        const tileUi = tile.getComponent("UITile");

        this.tilesLayout.addChild(tile);
        let layout = tileComponent.isEmptyTile() ? this.emptyTilesLayout : this.tilesLayouts[tileComponent.getRow()];

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

        tileUi.init(posX, posY, layout);
    }

    initStatus(status: Node) {
        if(status === null) {
            return;
        }

        this.statusLayout.addChild(status);

        const statusComponent = status.getComponent("StatusBase");
        const tileUi = status.getComponent("UITile");

        let posX = statusComponent.getCol() * (this.tileSize + this.tileSpacing) + this.xOffset;
        let posY = statusComponent.getRow() * (this.tileSize + this.tileSpacing) + this.yOffset;

        tileUi.init(posX, posY, this.statusLayout);
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

                let newLayout = this.tilesLayouts[tileComponent.getRow()];

                if(tileComponent.isEmptyTile()) {
                    continue;
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


    sortStatuses(statuses: Node[][]) {
        const numRows: number = statuses.length;
        const numCols: number = statuses.length > 0 ? statuses[0].length : 0;

        for(let i = 0; i < numRows; i++) {
            for(let j = 0; j < numCols; j++) {
                let status = statuses[i][j];
                if(status !== null) {
                    let statusComp = status.getComponent("StatusBase");
                    if(statusComp.getStatusType().split("_")[0] === "dynamite") {
                        status.setSiblingIndex(this.statusLayout.childrenCount - 1);
                    }
                }
            }
        }
    }
}


