import { _decorator, Component, Node } from 'cc';
import { Sticker } from '../lvl_6/Sticker';
const { ccclass, property } = _decorator;

@ccclass('Firerockets')
export class Firerockets extends Sticker {
    startDestroyConsequences(): boolean {
        for(let i = 0; i < 3; i++) {
            this.node.emit("destroy_random_tile");
        }
        
        this.node.emit("respawn", 0.1);

        this.node.emit("goal", "firerockets");

        return true;
    }


    pickTilesForDestroy(field: Node[][]) {
        let tiles = [];

        const numRows: number = field.length;
        const numCols: number = field.length > 0 ? field[0].length : 0;

        for(let i = 0; i < numRows; i++) {
            for(let j = 0; j < numCols; j++) {
                const tile = field[i][j];
                if(tile !== null) {
                    const tileComp = tile.getComponent("TileBase");
                    if(tileComp.isCommonTile()) {
                        tiles.push(tileComp);
                    }
                }
            }
        }

        let pickedNumbers: number[] = [];

        while (pickedNumbers.length < 3 && pickedNumbers.length < tiles.length) {
            let randomNumber = Math.floor(Math.random() * tiles.length);

            if (!pickedNumbers.includes(randomNumber)) {
                pickedNumbers.push(randomNumber);
            }
        }

        let pickedTiles = [];
        for(let i = 0; i < pickedNumbers.length; i++) {
            pickedTiles.push(tiles[pickedNumbers[i]]);
        }

        return pickedTiles;
    }
}


