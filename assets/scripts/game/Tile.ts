import { _decorator, Node, sp, Sprite, SpriteFrame } from 'cc';
import { ArtPreviewAssetLoader } from '../preview/ArtPreviewAssetLoader';
import { TileBase } from './TileBase';
import { SpecTileBase } from './spec_tiles/SpecTileBase';
import { StatusBase } from './statuses/StatusBase';
const { ccclass, property } = _decorator;


@ccclass('SpriteTileData')
export class SpriteTileData {
    @property
    id = '';
    @property(SpriteFrame)
    icon: SpriteFrame | null = null;
}


@ccclass('Tile')
export class Tile extends TileBase {

    @property(Sprite)
    icon: Sprite = null;

    @property([SpriteTileData])
    commonIcons: SpriteTileData[] = [];

    @property([SpriteTileData])
    verticalRocketIcons: SpriteTileData[] = [];

    @property([SpriteTileData])
    horizontalRocketIcons: SpriteTileData[] = [];

    @property([SpriteTileData])
    bombIcons: SpriteTileData[] = [];

    @property([SpriteTileData])
    discoballIcons: SpriteTileData[] = [];

    @property(sp.Skeleton)
    touchSpine: sp.Skeleton = null;

    private isTouchAnimating: boolean = false;

    private potentialBonus: string = "";
    private artRequestId: number = 0;

    private applyCommonIcon() {
        const fallback =
            this.commonIcons.find(
                i =>
                    i.id ===
                    this.getTileType()
            )?.icon ?? null;

        this.applyArtIcon(
            'common',
            fallback,
            '',
        );
    }

    private applyArtIcon(
        category: string,
        fallback: SpriteFrame | null,
        expectedBonus: string,
    ) {
        const tileType =
            this.getTileType();

        this.icon.spriteFrame =
            fallback;

        const requestId =
            ++this.artRequestId;

        void ArtPreviewAssetLoader
            .loadTile(
                category,
                tileType,
            )
            .then((spriteFrame) => {

                if (!spriteFrame) {
                    return;
                }

                if (
                    requestId !==
                    this.artRequestId
                ) {
                    return;
                }

                if (
                    !this.node ||
                    !this.node.isValid ||
                    !this.icon ||
                    !this.icon.isValid
                ) {
                    return;
                }

                if (
                    this.getTileType() !==
                    tileType
                ) {
                    return;
                }

                if (
                    this.potentialBonus !==
                    expectedBonus
                ) {
                    return;
                }

                this.icon.spriteFrame =
                    spriteFrame;

                console.log(
                    `[Art Preview Art] applied: ${category}/${tileType}.png`,
                );
            });
    }

    onLoad() {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on('touch_feedback', this.playTouchFeedback, this);
    }

    onDestroy() {
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off('touch_feedback', this.playTouchFeedback, this);
    }

    init(row: number, col: number, tileType: string) {
        this.row = row;
        this.col = col;
        this.tileType = tileType;

        this.isBonus = false;
        this.isEmpty = false;
        this.isShifts = true;
        this.isSpecial = false;

        this.applyCommonIcon();

        this.isTouchAnimating = false;

        if (this.touchSpine?.node?.isValid) {
            this.touchSpine.node.active = false;
        }
    }


    getMatches(field: Node[][], statuses: Node[][]): Node[] {
        let matches = [];

        matches = this.checkMatchesInDirection(field, statuses, 1, 0)
            .concat(this.checkMatchesInDirection(field, statuses, -1, 0))
            .concat(this.checkMatchesInDirection(field, statuses, 0, 1))
            .concat(this.checkMatchesInDirection(field, statuses, 0, -1));

        let newMatchesCount = matches.length;
        let startIndex = 0;
        while(newMatchesCount > 0) {
            newMatchesCount = 0;
            for(let i = startIndex; i < matches.length; i++) {
                let tileComponent = matches[i].getComponent("TileBase");
                const isBonus = tileComponent.isBonusTile();
                if(!isBonus) {
                    const newMatches = tileComponent.checkMatchesInDirection(field, statuses, 1, 0)
                        .concat(tileComponent.checkMatchesInDirection(field, statuses, -1, 0))
                        .concat(tileComponent.checkMatchesInDirection(field, statuses, 0, 1))
                        .concat(tileComponent.checkMatchesInDirection(field, statuses, 0, -1));

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

    checkMatchesInDirection(field: Node[][], statuses: Node[][], dirX: number, dirY: number): Node[] {
        let matches: Node[] = [];

        let currentRow = this.row + dirY;
        let currentCol = this.col + dirX;

        const numRows: number = field.length;
        const numCols: number = field.length > 0 ? field[0].length : 0;

        while (currentRow >= 0 && currentRow < numRows &&
            currentCol >= 0 && currentCol < numCols) {
            const currentTile = field[currentRow][currentCol];
            if(currentTile !== null) {
                const currentTileComponent = currentTile.getComponent(TileBase);
                const isBonus = currentTileComponent.isBonusTile();
                const isStatusBlock = this.checkStatusBlock(statuses[currentRow][currentCol]);

                if (currentTileComponent.getTileType() === this.tileType && !isBonus && !isStatusBlock) {
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

    checkStatusBlock(statusNode: Node): boolean {
        if(statusNode === null) {
            return false;
        }

        const statusComp = statusNode.getComponent(StatusBase);
        return statusComp.isBlockingDestroyTile();
    }

    setPotentialBonus(bonus: string) {
        this.potentialBonus = bonus;

        switch (bonus) {

            case 'discoball': {
                const fallback =
                    this.discoballIcons.find(
                        i =>
                            i.id ===
                            this.getTileType()
                    )?.icon ?? null;

                this.applyArtIcon(
                    'discoball',
                    fallback,
                    'discoball',
                );

                break;
            }

            case 'bomb': {
                const fallback =
                    this.bombIcons.find(
                        i =>
                            i.id ===
                            this.getTileType()
                    )?.icon ?? null;

                this.applyArtIcon(
                    'bomb',
                    fallback,
                    'bomb',
                );

                break;
            }

            case 'rocket_vertical': {
                const fallback =
                    this.verticalRocketIcons.find(
                        i =>
                            i.id ===
                            this.getTileType()
                    )?.icon ?? null;

                this.applyArtIcon(
                    'rocket_vertical',
                    fallback,
                    'rocket_vertical',
                );

                break;
            }

            case 'rocket_horizontal': {
                const fallback =
                    this.horizontalRocketIcons.find(
                        i =>
                            i.id ===
                            this.getTileType()
                    )?.icon ?? null;

                this.applyArtIcon(
                    'rocket_horizontal',
                    fallback,
                    'rocket_horizontal',
                );

                break;
            }
        }
    }

    getPotentialBonus(): string {
        return this.potentialBonus;
    }

    clear() {
        this.potentialBonus = "";

        this.applyCommonIcon();
    }


    giveDamage(field: Node[][], statuses: Node[][]) {
        const adjTiles = this.getAdjacentTiles(field);
        const adjStatuses = this.getAdjacentTiles(statuses);

        for(let i = 0; i < adjTiles.length; i++) {
            let isDamageAvailable = true;

            if(adjStatuses[i] !== null) {
                const statusComponent = adjStatuses[i].getComponent(StatusBase);
                if(statusComponent.isMatchHitResponsive()) {
                    statusComponent.getDamage();
                }
                isDamageAvailable = !statusComponent.isBlockingDestroyTile();
            }

            if(adjTiles[i] !== null && isDamageAvailable) {
                const tileComponent = adjTiles[i].getComponent(TileBase);
                if(tileComponent.isSpecialTile()) {
                    tileComponent.getDamage(this.tileType);
                    if(tileComponent.isGroupedTile()) {
                        let groupedTiles = tileComponent.getGroupedTiles(field);
                        for(let i = 0; i < groupedTiles.length; i++) {
                            let groupedTile = groupedTiles[i].getComponent(SpecTileBase);
                            groupedTile.setAsDamaged();
                        }
                    }
                }
            }
        }

        if(statuses[this.row][this.col] !== null) {
            const status = statuses[this.row][this.col].getComponent(StatusBase);
            if(!status.isBlockingInteraction()) {
                status.getDamage();
            }
        }
    }


    destroyTile(delay: number) {
        super.destroyTile(delay);

        this.node.emit("goal", this.tileType);
    }


    private playTouchFeedback(): void {
        if (this.isTouchAnimating || !this.node.isValid) return;

        const spine = this.touchSpine;

        if (!spine?.skeletonData || !spine.node.isValid || !this.icon?.isValid) {
            return;
        }

        const tileType = this.getTileType();
        const color = tileType === 'purple' ? 'violet' : tileType;

        if (!['blue', 'green', 'red', 'violet', 'yellow'].includes(color)) {
            return;
        }

        spine.node.active = true;
        spine.enabled = true;
        spine.timeScale = 1;

        if (!spine.findAnimation('touch')) {
            console.warn('[TILE TOUCH] touch not available after activation', {
                type: tileType,
                active: spine.node.activeInHierarchy,
                skeleton: spine.skeletonData.name
            });

            spine.node.active = false;
            return;
        }

        let finished = false;

        const restore = (): void => {
            if (finished) return;
            finished = true;

            this.isTouchAnimating = false;

            if (this.icon?.isValid) {
                this.icon.enabled = true;
            }

            if (spine.node.isValid) {
                spine.node.active = false;
            }
        };

        try {
            this.isTouchAnimating = true;

            spine.clearTracks();
            spine.setSkin(color);
            spine.setToSetupPose();
            spine.setAttachment('tile', 'tile_1');

            const track = spine.setAnimation(0, 'touch', false);

            if (!track) {
                restore();
                return;
            }

            this.icon.enabled = false;

            spine.setTrackCompleteListener(track, restore);
            spine.setTrackInterruptListener(track, restore);
            spine.setTrackEndListener(track, restore);

        } catch (error) {
            console.error('[TILE TOUCH ERROR]', error);
            restore();
        }
    }
}


