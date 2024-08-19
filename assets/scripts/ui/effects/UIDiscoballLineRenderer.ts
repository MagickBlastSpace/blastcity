import { _decorator, Component, Node, instantiate, Prefab, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIDiscoballLineRenderer')
export class UIDiscoballLineRenderer extends Component {

    @property(Prefab)
    linePrefab: Prefab = null;

    private linesSpawned: Node[] = [];


    renderDiscoballLine(startPos: Vec3, endPos: Vec3) {
        let lineNode = instantiate(this.linePrefab);
        lineNode.parent = this.node;

        let lineComponent = lineNode.getComponent("UIDiscoballLine");

        if (lineComponent) {
            lineComponent.setLinePositions(startPos, endPos);
        }

        this.linesSpawned.push(lineNode);
    }

    clear() {
        for(let i = 0; i < this.linesSpawned.length; i++) {
            this.linesSpawned[i].destroy();
        }

        this.linesSpawned = [];
    }
}


