import { _decorator, Component, Node, Sprite, SpriteFrame, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BorderItem')
export class BorderItem extends Component {

    @property(Node)
    lineUpperLeft: Node | null = null;
    @property(Node)
    lineBottomLeft: Node | null = null;
    @property(Node)
    lineUpperRight: Node | null = null;
    @property(Node)
    lineBottomRight: Node | null = null;

    @property(Node)
    lineLeftUpper: Node | null = null;
    @property(Node)
    lineLeftBottom: Node | null = null;
    @property(Node)
    lineRightUpper: Node | null = null;
    @property(Node)
    lineRightBottom: Node | null = null;

    @property(Node)
    cornerUpperLeft: Node | null = null;
    @property(Node)
    cornerUpperRight: Node | null = null;
    @property(Node)
    cornerBottomLeft: Node | null = null;
    @property(Node)
    cornerBottomRight: Node | null = null;

    @property
    tileSpacing: number = 0;
    @property
    xOffset: number = -660;
    @property
    yOffset: number = -660;

    @property
    tileSize: number = 165;


    init(row: number, col: number) {
        let posX = col * (this.tileSize + this.tileSpacing) + this.xOffset;
        let posY = row * (this.tileSize + this.tileSpacing) + this.yOffset;

        this.node.setPosition(posX, posY);
    }

    /*init(row: number, col: number, direction: boolean[]) {
        let posX = row * (this.tileSize + this.tileSpacing) + this.xOffset;
        let posY = col * (this.tileSize + this.tileSpacing) + this.yOffset;

        this.node.setPosition(posX, posY);

        this.renderBorderline(direction);
    }*/
    
    renderBorderline(direction: boolean[]) { //upper right bottom left
        this.resetAll();

        if(direction[0] && direction[1]) {
            this.cornerUpperRight.active = true;
        }
        if(direction[1] && direction[2]) {
            this.cornerBottomRight.active = true;
        }
        if(direction[2] && direction[3]) {
            this.cornerBottomLeft.active = true;
        }
        if(direction[3] && direction[0]) {
            this.cornerUpperLeft.active = true;
        }


        if(direction[0] && !direction[1]) {
            this.lineUpperRight.active = true;
        }
        if(direction[0] && !direction[3]) {
            this.lineUpperLeft.active = true;
        }
        if(direction[2] && !direction[1]) {
            this.lineBottomRight.active = true;
        }
        if(direction[2] && !direction[3]) {
            this.lineBottomLeft.active = true;
        }

        if(direction[1] && !direction[0]) {
            this.lineRightUpper.active = true;
        }
        if(direction[1] && !direction[2]) {
            this.lineRightBottom.active = true;
        }
        if(direction[3] && !direction[0]) {
            this.lineLeftUpper.active = true;
        }
        if(direction[3] && !direction[2]) {
            this.lineLeftBottom.active = true;
        }
    }


    resetAll() {
        this.cornerUpperRight.active = false;
        this.cornerBottomRight.active = false;
        this.cornerBottomLeft.active = false;
        this.cornerUpperLeft.active = false;

        this.lineUpperRight.active = false;
        this.lineUpperLeft.active = false;
        this.lineBottomRight.active = false;
        this.lineBottomLeft.active = false;

        this.lineRightUpper.active = false;
        this.lineRightBottom.active = false;
        this.lineLeftUpper.active = false;
        this.lineLeftBottom.active = false;
    }
}


