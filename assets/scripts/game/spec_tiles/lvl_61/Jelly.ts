
import { _decorator, EventTouch, Node, sp, Vec2 } from 'cc';
import { UITile } from '../../../ui/UITile';
import { TileBase } from '../../TileBase';
import { SpecTileBase } from '../SpecTileBase';

const { ccclass } = _decorator;

@ccclass('Jelly')
export class Jelly extends SpecTileBase {

    private jellyStrength: number = 1;

    private static pendingAppearAnimations = new Map<string, string>();

    private static getCellKey(row: number, col: number): string {
        return `${row}:${col}`;
    }

    private playJellyAnimation(animation: string, loop: boolean = true): void {
        const uiTile = this.node.getComponent(UITile);
        const skeleton: sp.Skeleton | null = uiTile?.spine ?? null;

        if(!skeleton) {
            console.warn('[JELLY] Spine not found');
            return;
        }

        skeleton.node.active = true;
        skeleton.setAnimation(0, animation, loop);
    }

    private playJellyTransition(animation: string): void {
        const uiTile = this.node.getComponent(UITile);
        const skeleton = uiTile?.spine;

        if(!skeleton) {
            console.warn(`[JELLY] Spine not found for ${animation}`);
            return;
        }

        skeleton.node.active = true;

        skeleton.setAnimation(0, animation, false);
        skeleton.addAnimation(0, 'idle', true, 0);
    }

    private onJellyTouched(event: EventTouch): void {
        const start = event.getUIStartLocation();
        const end = event.getUILocation();

        if(Vec2.distance(start, end) > 12) return;

        this.playJellyTouchAnimation();
    }

    private playJellyTouchAnimation(): void {
        const uiTile = this.node.getComponent(UITile);
        const skeleton = uiTile?.spine;

        if(!skeleton?.skeletonData) {
            console.warn('[JELLY TOUCH] Spine missing');
            return;
        }

        if(!skeleton.findAnimation('touch')) {
            console.warn('[JELLY TOUCH] Animation "touch" not found');
            return;
        }

        const currentAnimation = skeleton.getCurrent(0)?.animation?.name;

        if(currentAnimation && currentAnimation !== 'idle') {
            return;
        }

        skeleton.node.active = true;
        skeleton.enabled = true;

        const touchTrack = skeleton.setAnimation(0, 'touch', false);

        if(!touchTrack) return;

        skeleton.addAnimation(0, 'idle', true, 0);

        console.log('[JELLY TOUCH]', {
            row: this.row,
            col: this.col,
            animation: 'touch'
        });
    }

    private getSpreadAnimations(
        sourceRow: number,
        sourceCol: number,
        targetRow: number,
        targetCol: number
    ): { spread: string; appear: string } | null {

        if(targetCol === sourceCol + 1 && targetRow === sourceRow) {
            return {
                spread: 'spread_right',
                appear: 'appear_left'
            };
        }

        if(targetCol === sourceCol - 1 && targetRow === sourceRow) {
            return {
                spread: 'spread_left',
                appear: 'appear_right'
            };
        }

        if(targetRow === sourceRow - 1 && targetCol === sourceCol) {
            return {
                spread: 'spread_up',
                appear: 'appear_down'
            };
        }

        if(targetRow === sourceRow + 1 && targetCol === sourceCol) {
            return {
                spread: 'spread_down',
                appear: 'appear_up'
            };
        }

        return null;
    }

    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = false;
        this.jellyStrength = 1;

        this.setAsDamaged();

        const uiTile = this.node.getComponent(UITile);

        if(uiTile) {
            uiTile.keepSpineVisible = true;
        }

        this.node.off(Node.EventType.TOUCH_END, this.onJellyTouched, this);
        this.node.on(Node.EventType.TOUCH_END, this.onJellyTouched, this);

        const cellKey = Jelly.getCellKey(row, col);

        const appearAnimation = Jelly.pendingAppearAnimations.get(cellKey);

        console.log('[JELLY INIT]', {
            row,
            col,
            animation: appearAnimation ?? 'idle'
        });

        if(appearAnimation) {
            Jelly.pendingAppearAnimations.delete(cellKey);
            this.playJellyTransition(appearAnimation);
        } else {
            this.playJellyAnimation('idle', true);
        }
    }

    getDamage(damageType: string) {
        this.jellyStrength--;
        this.node.emit('damage_all', this.tileType);
    }

    isReadyToDestroy(): boolean {
        return this.jellyStrength <= 0;
    }

    startInActionEffect(
        field?: Node[][],
        statuses?: Node[][],
        isBlockingAction: boolean = false
    ): boolean {

        if(!field || !statuses) {
            return false;
        }

        if(this.isTileDamaged() || isBlockingAction) {
            return false;
        }

        const jellies = this.findAllTilesThisType(field);

        const candidates: {
            source: Jelly;
            target: Node;
        }[] = [];

        for(const jellyNode of jellies) {
            const source = jellyNode.getComponent(Jelly);

            if(!source) {
                continue;
            }

            const sourceRow = source.getRow();
            const sourceCol = source.getCol();

            const status = statuses[sourceRow]?.[sourceCol];

            let isStatusBlock = false;

            if(status) {
                const statusComp = status.getComponent('StatusBase') as any;

                isStatusBlock = statusComp?.isBlockingDestroyTile() ?? false;
            }

            if(isStatusBlock) {
                continue;
            }

            const neighbors = source.getNextJellyCandidates(field);

            for(const target of neighbors) {
                candidates.push({
                    source,
                    target
                });
            }
        }

        if(candidates.length === 0) {
            return false;
        }

        const randomIndex = Math.floor(Math.random() * candidates.length);
        const selected = candidates[randomIndex];

        const source = selected.source;
        const targetComp = selected.target.getComponent(TileBase);

        if(!targetComp) {
            return false;
        }

        const sourceRow = source.getRow();
        const sourceCol = source.getCol();

        const targetRow = targetComp.getRow();
        const targetCol = targetComp.getCol();

        const animations = this.getSpreadAnimations(
            sourceRow,
            sourceCol,
            targetRow,
            targetCol
        );

        const cellKey = Jelly.getCellKey(targetRow, targetCol);

        if(animations) {
            Jelly.pendingAppearAnimations.set(cellKey, animations.appear);
            source.playJellyTransition(animations.spread);
        }

        console.log('[JELLY SPREAD]', {
            sourceRow,
            sourceCol,
            targetRow,
            targetCol,
            spread: animations?.spread,
            appear: animations?.appear
        });

        try {
            this.node.emit(
                'change',
                targetRow,
                targetCol,
                this.tileType
            );
        } finally {
            Jelly.pendingAppearAnimations.delete(cellKey);
        }

        this.node.emit('damage_all', this.tileType);
        this.node.emit('goal_inc', 'jelly');

        this.playSpawnSound();

        return true;
    }

    getNextJellyCandidates(field: Node[][]): Node[] {
        let matches = [];

        const numRows: number = field.length;
        const numCols: number = field.length > 0 ? field[0].length : 0;

        if(this.row < numRows - 1) {
            const tile = field[this.row + 1][this.col];

            if(this.checkTileForMatch(tile)) {
                matches.push(tile);
            }
        }

        if(this.row > 0) {
            const tile = field[this.row - 1][this.col];

            if(this.checkTileForMatch(tile)) {
                matches.push(tile);
            }
        }

        if(this.col < numCols - 1) {
            const tile = field[this.row][this.col + 1];

            if(this.checkTileForMatch(tile)) {
                matches.push(tile);
            }
        }

        if(this.col > 0) {
            const tile = field[this.row][this.col - 1];

            if(this.checkTileForMatch(tile)) {
                matches.push(tile);
            }
        }

        return matches;
    }

    checkTileForMatch(tile: Node): boolean {
        if(!tile) {
            return false;
        }

        const tileComponent = tile.getComponent(TileBase);

        if(!tileComponent) {
            return false;
        }

        if(
            tileComponent.isSpecialTile() ||
            tileComponent.isEmptyTile() ||
            tileComponent.isBonusTile()
        ) {
            return false;
        }

        return true;
    }

    startDestroyConsequences() {
        this.node.emit('goal', 'jelly');

        this.playAnimation('destroy', false, 1);
    }

    playSpawnSound() {
        this.playSound(0);
    }
}
