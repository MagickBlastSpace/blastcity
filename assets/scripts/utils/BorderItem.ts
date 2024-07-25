import { _decorator, Component, Node, Sprite, SpriteFrame, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BorderItem')
export class BorderItem extends Component {

    @property(Node)
    lineUpper: Node | null = null;
    @property(Node)
    lineBottom: Node | null = null;
    @property(Node)
    lineRight: Node | null = null;
    @property(Node)
    lineLeft: Node | null = null;

    @property(Node)
    cornerUpperLeft: Node | null = null;
    @property(Node)
    cornerUpperRight: Node | null = null;
    @property(Node)
    cornerBottomLeft: Node | null = null;
    @property(Node)
    cornerBottomRight: Node | null = null;

    @property(Node)
    cornerUpperLeft_Outside: Node | null = null;
    @property(Node)
    cornerUpperRight_Outside: Node | null = null;
    @property(Node)
    cornerBottomLeft_Outside: Node | null = null;
    @property(Node)
    cornerBottomRight_Outside: Node | null = null;

    @property
    tileSpacing: number = 0;
    @property
    xOffset: number = -660;
    @property
    yOffset: number = -660;

    @property
    tileSize: number = 165;


    init(row: number, col: number, direction: boolean[]) {
        let posX = col * (this.tileSize + this.tileSpacing) + this.xOffset;
        let posY = row * (this.tileSize + this.tileSpacing) + this.yOffset;

        this.node.setPosition(posX, posY);

        this.renderBorderline(direction);
    }
    
    renderBorderline(direction: boolean[]) { //0-upper, 1-right, 2-bottom, 3-left, 4-upper_right, 5-bottom_right, 6-upper_left, 7-bottom_left
        this.resetAll();

        this.cornerUpperRight.active = direction[0] && direction[1];
        this.cornerBottomRight.active = direction[1] && direction[2];
        this.cornerBottomLeft.active = direction[2] && direction[3];
        this.cornerUpperLeft.active = direction[3] && direction[0];

        this.lineUpper.active = direction[0];
        this.lineBottom.active = direction[2];
        this.lineLeft.active = direction[3] && !direction[7];
        this.lineRight.active = direction[1] && !direction[5];

        this.cornerUpperRight_Outside.active = direction[4];
        this.cornerBottomRight_Outside.active = direction[5];
        this.cornerBottomLeft_Outside.active = direction[7];
        this.cornerUpperLeft_Outside.active = direction[6];
    }


    resetAll() {
        this.cornerUpperRight.active = false;
        this.cornerBottomRight.active = false;
        this.cornerBottomLeft.active = false;
        this.cornerUpperLeft.active = false;

        this.lineUpper.active = false;
        this.lineBottom.active = false;
        this.lineLeft.active = false;
        this.lineRight.active = false;

        this.cornerUpperRight_Outside.active = false;
        this.cornerBottomRight_Outside.active = false;
        this.cornerBottomLeft_Outside.active = false;
        this.cornerUpperLeft_Outside.active = false;
    }
}


