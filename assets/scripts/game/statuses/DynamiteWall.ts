import { _decorator, Component, Node, Sprite, Label } from 'cc';
import { StatusBase } from './StatusBase';
import { SpriteTileData } from '../Tile';
const { ccclass, property } = _decorator;

@ccclass('DynamiteWall')
export class DynamiteWall extends StatusBase {
    @property(Sprite)
    icon: Sprite = null;

    @property([SpriteTileData])
    colorIcons: SpriteTileData[] = [];

    @property(Label)
    hpLabel: Label = null;

    private fieldNode: Node = null;
    private destroyTileCallback: Function = null;

    private damageType = "blue";

    private brickWallGroup: Node[] = [];
    private strength: number = 0;


    init(row: number, col: number, statusType: string) {
        super.init(row, col, statusType);

        this.isBlockMovement = true;
        this.isBlockInteraction = true;
        this.isBlockDestroyTile = true;
        this.isMatchHit = false;

        this.strength = Math.floor(Math.random() * 15);
        if(this.strength < 5) {
            this.strength += 5;
        }

        this.refresh();
    }


    startDestroyConsequences() {
        for(let i = 0; i < this.brickWallGroup.length; i++) {
            if(this.brickWallGroup[i] !== null) {
                let statusComp = this.brickWallGroup[i].getComponent("StatusBase");
                this.node.emit("destroy_status", statusComp.getRow(), statusComp.getCol());
            }
        }
        this.node.emit("goal", "dynamite");
    }

    

    subscribeOnFieldEvents(field: Node) {
        if(this.isSubscribed) {
            return;
        }
        
        super.subscribeOnFieldEvents(field);

        this.fieldNode = field;
        let availableColors = field.getComponent("Field").getAvailableColors();
        let colorIndex = Math.floor(Math.random() * availableColors.length);
        this.damageType = availableColors[colorIndex];

        this.icon.spriteFrame = this.colorIcons.find(i => i.id === this.damageType)?.icon;

        this.destroyTileCallback = (tileType) => {
            if(tileType === this.damageType) {
                this.getDamageFromEvent();
            }
        };

        field.on("destroy", this.destroyTileCallback);

        let fieldArray = field.getComponent("Field").getStatusArray();
        this.brickWallGroup = this.findAllStatusesByType(fieldArray, "wall_" + this.getStatusType().split("_")[1]);
    }

    destroyStatus() {
        this.fieldNode.off("destroy", this.destroyTileCallback);

        super.destroyStatus();
    }

    destroyClear() {
        this.fieldNode.off("destroy", this.destroyTileCallback);

        super.destroyClear();
    }


    isReadyToDestroy(): boolean {
        if(this.strength <= 0) {
            return true;
        }
        return false;
    }

    getDamage(damageType: string) {}

    getDamageFromEvent() {
        if(this.strength <= 0) {
            return;
        }
        this.strength--;
        this.refresh();
    }

    refresh() {
        this.hpLabel.string = this.strength;
    }


    setRespawnEvent(timeToRespawn: number) {
        this.node.emit("respawn", timeToRespawn);
    }
}


