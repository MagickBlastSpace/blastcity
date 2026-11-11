import { _decorator, Component, instantiate, Node, Prefab, Vec3 } from 'cc';
import { UIDiscoballLine } from './UIDiscoballLine';
const { ccclass, property } = _decorator;

@ccclass('UIDiscoballLineRenderer')
export class UIDiscoballLineRenderer extends Component {

    @property(Prefab)
    linePrefab: Prefab = null;

    private linesSpawned: Node[] = [];

    onDisable() {
        for(const lineNode of this.linesSpawned) {
            if(lineNode?.isValid) {
                lineNode.destroy();
            }
        }

        this.linesSpawned = [];
    }

    renderDiscoballLine(
        startPos: Vec3,
        endPos: Vec3,
        skinName: string = 'blue',
        animationName: 'line_color_1' | 'line_color_2' = 'line_color_1'
    ): void {
        const lineNode = instantiate(this.linePrefab);
        lineNode.parent = this.node;

        const lineComponent = lineNode.getComponent(UIDiscoballLine);

        if(!lineComponent) {
            console.warn('[DISCO LINE] UIDiscoballLine missing');
            lineNode.destroy();
            return;
        }

        lineComponent.setLinePositions(
            startPos,
            endPos,
            skinName,
            animationName
        );

        this.linesSpawned.push(lineNode);
    }

    clear(): void {
        this.linesSpawned = this.linesSpawned.filter(
            lineNode => lineNode.isValid
        );
    }
}


