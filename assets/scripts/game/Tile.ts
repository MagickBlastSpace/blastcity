import { _decorator, Component, Node, Sprite, SpriteFrame, Vec2, Vec3, UITransform } from 'cc';
import { TileBase } from './TileBase';
const { ccclass, property } = _decorator;

@ccclass('Tile')
export class Tile extends TileBase {

    @property(Sprite)
    icon: Sprite = null;

    @property(SpriteFrame)
    blue: SpriteFrame | null = null;
    @property(SpriteFrame)
    red: SpriteFrame | null = null;
    @property(SpriteFrame)
    green: SpriteFrame | null = null;
    @property(SpriteFrame)
    yellow: SpriteFrame | null = null;

    @property(SpriteFrame)
    rocketHorizontal: SpriteFrame | null = null;
    @property(SpriteFrame)
    rocketVertical: SpriteFrame | null = null;
    @property(SpriteFrame)
    bomb: SpriteFrame | null = null;
    @property(SpriteFrame)
    discoball: SpriteFrame | null = null;

    @property(Sprite)
    potentialBonusIcon: Sprite = null;

    private potentialBonus: string = "";


    onLoad() {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
    }

    onDestroy() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    }
    
    
    init(row: number, col: number, tileType: string) {
        this.row = row;
        this.col = col;
        this.tileType = tileType;

        this.isBonus = false;
        this.isEmpty = false;
        this.isShifts = true;
        this.isSpecial = false;
        
        switch(this.tileType) {
            case 'blue':
                this.icon.spriteFrame = this.blue;
                break;
            case 'red':
                this.icon.spriteFrame = this.red;
                break;
            case 'green':
                this.icon.spriteFrame = this.green;
                break;
            case 'yellow':
                this.icon.spriteFrame = this.yellow;
                break;
        }
    }


    getMatches(field: Node[][]): Node[] {
        let matches = [];

        matches = this.checkMatchesInDirection(field, 1, 0)
            .concat(this.checkMatchesInDirection(field, -1, 0))
            .concat(this.checkMatchesInDirection(field, 0, 1))
            .concat(this.checkMatchesInDirection(field, 0, -1));

        let newMatchesCount = matches.length;
        let startIndex = 0;
        while(newMatchesCount > 0) {
            newMatchesCount = 0;
            for(let i = startIndex; i < matches.length; i++) {
                let tileComponent = matches[i].getComponent("TileBase");
                const isBonus = tileComponent.isBonusTile();
                if(!isBonus) {
                    const newMatches = tileComponent.checkMatchesInDirection(field, 1, 0)
                        .concat(tileComponent.checkMatchesInDirection(field, -1, 0))
                        .concat(tileComponent.checkMatchesInDirection(field, 0, 1))
                        .concat(tileComponent.checkMatchesInDirection(field, 0, -1));

                    for(let j = 0; j < newMatches.length; j++) {
                        if (!matches.includes(newMatches[j])) {
                            newMatchesCount++;
                            matches.push(newMatches[j]);
                        }
                    }
                }
            }

            startIndex = matches.length - newMatchesCount - 1;
        }

        return matches;
    }

    checkMatchesInDirection(field: Node[][], dirX: number, dirY: number): Node[] {
        let matches: Node[] = [];

        let currentRow = this.row + dirY;
        let currentCol = this.col + dirX;

        const numRows: number = field.length;
        const numCols: number = field.length > 0 ? field[0].length : 0;

        while (currentRow >= 0 && currentRow < numRows &&
            currentCol >= 0 && currentCol < numCols) {
            const currentTile = field[currentRow][currentCol];
            if(currentTile !== null) {
                const currentTileComponent = currentTile.getComponent("TileBase");
                const isBonus = currentTileComponent.isBonusTile();

                if (currentTileComponent.getTileType() === this.tileType && !isBonus) {
                    matches.push(currentTile);
                    currentRow += dirY;
                    currentCol += dirX;
                } else {
                    break;
                }
            }
            else {
                break;
            }
        }

        return matches;
    }


    setPotentialBonus(bonus: string) {
        this.potentialBonus = bonus;
        switch(bonus) {
            case 'discoball':
                this.potentialBonusIcon.spriteFrame = this.discoball;
                break;
            case 'bomb':
                this.potentialBonusIcon.spriteFrame = this.bomb;
                break;
            case 'rocket_vertical':
                this.potentialBonusIcon.spriteFrame = this.rocketVertical;
                break;
            case 'rocket_horizontal':
                this.potentialBonusIcon.spriteFrame = this.rocketHorizontal;
                break;
        }
    }

    getPotentialBonus(): string {
        return this.potentialBonus;
    }

    clear() {
        this.potentialBonus = "";
        this.potentialBonusIcon.spriteFrame = null;
    }


    giveDamage(field: Node[][], statuses: Node[][]) {
        const adjTiles = this.getAdjacentTiles(field);
        const adjStatuses = this.getAdjacentTiles(statuses);

        for(let i = 0; i < adjTiles.length; i++) {
            if(adjTiles[i] !== null) {
                let isDamageAvailable = true;
                
                if(adjStatuses[i] !== null) {
                    const statusComponent = adjStatuses[i].getComponent("StatusBase");
                    if(statusComponent.isMatchHitResponsive()) {
                        statusComponent.getDamage();
                    }
                    
                    isDamageAvailable = !statusComponent.isBlockingDestroyTile();
                }

                if(isDamageAvailable) {
                    const tileComponent = adjTiles[i].getComponent("TileBase");
                    if(tileComponent.isSpecialTile()) {
                        tileComponent.getDamage(this.tileType);
                        if(tileComponent.isGroupedTile()) {
                            let groupedTiles = tileComponent.getGroupedTiles(field);
                            for(let i = 0; i < groupedTiles.length; i++) {
                                let groupedTile = groupedTiles[i].getComponent("SpecTileBase");
                                groupedTile.setAsDamaged();
                            }
                        }
                    }
                }
            }
        }

        if(statuses[this.row][this.col] !== null) {
            const status = statuses[this.row][this.col].getComponent("StatusBase");
            if(!status.isBlockingInteraction()) {
                status.getDamage();
            }
        }
    }
}


