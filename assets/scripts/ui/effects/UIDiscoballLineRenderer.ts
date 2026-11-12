import { _decorator, Component, instantiate, Node, Prefab, Vec3 } from 'cc';
import { UIDiscoballLine } from './UIDiscoballLine';

const { ccclass, property } = _decorator;

@ccclass('UIDiscoballLineRenderer')
export class UIDiscoballLineRenderer extends Component {

    @property(Prefab)
    linePrefab: Prefab = null;

    private linesSpawned: Node[] = [];

    onDisable(): void {
        for(const lineNode of this.linesSpawned) {
            if(lineNode?.isValid) lineNode.destroy();
        }
        this.linesSpawned = [];
    }

    renderDiscoballLine(
        startPos: Vec3,
        endPos: Vec3,
        skinName: string = 'blue',
        animationName: 'line_color_1' | 'line_color_2' = 'line_color_1',
        onFinished?: (reached: boolean) => void
    ): void {
        if(!this.linePrefab || !this.node.isValid || !this.node.activeInHierarchy) {
            console.warn('[DISCO LINE] Line prefab or renderer unavailable');
            onFinished?.(false);
            return;
        }

        let lineNode: Node | null = null;
        let notified = false;
        const notify = (reached: boolean) => {
            if(notified) return;
            notified = true;
            onFinished?.(reached);
        };

        try {
            lineNode = instantiate(this.linePrefab);
            this.node.addChild(lineNode);
            this.linesSpawned.push(lineNode);

            const lineComponent = lineNode.getComponent(UIDiscoballLine);
            if(!lineComponent) {
                console.warn('[DISCO LINE] UIDiscoballLine missing');
                lineNode.destroy();
                notify(false);
                return;
            }

            lineComponent.setLinePositions(startPos, endPos, skinName, animationName, reached => {
                this.linesSpawned = this.linesSpawned.filter(node => node !== lineNode && node.isValid);
                notify(reached);
            });
        } catch(error) {
            console.error('[DISCO LINE] Spawn failed:', error);
            if(lineNode?.isValid) lineNode.destroy();
            notify(false);
        }
    }

    getMaxLineDuration(): number {
        const defaultDuration = 0.87;
        try {
            const prefabNode = this.linePrefab?.data;
            const spine = prefabNode?.getComponent(UIDiscoballLine)?.lineSpine;
            if(!spine || !spine.skeletonData) return defaultDuration;
            const first = spine.findAnimation('line_color_1')?.duration ?? 0;
            const second = spine.findAnimation('line_color_2')?.duration ?? 0;
            return Math.max(defaultDuration, first, second);
        } catch(error) {
            return defaultDuration;
        }
    }

    clear(): void {
        this.linesSpawned = this.linesSpawned.filter(lineNode => lineNode.isValid);
    }
}
