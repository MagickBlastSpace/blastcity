import { _decorator, Component, Slider, Label, dynamicAtlasManager, find, Node, UIRenderer, Material, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GaussianBlur')
export class GaussianBlur extends Component {

    @property
    c: number = 0.9;

    private _gsFactor : number = 500;

    onLoad () {
        dynamicAtlasManager.enabled = false;
    }


    start() {
        this._updateRenderComponentMaterial({});
    }


    private _updateRenderComponentMaterial(param: {}) {
        this.node.getComponents(UIRenderer).forEach(renderComponent => {
                let material: Material = renderComponent.getMaterial(0)!;
                let _w = this._gsFactor - (this._gsFactor-30) * this.c;
                let _h = this._gsFactor - (this._gsFactor-30) * this.c;
                material.setProperty('textureSize', new Vec2(_w, _h));

                renderComponent.setMaterial(material, 0);
            });
    }
}


