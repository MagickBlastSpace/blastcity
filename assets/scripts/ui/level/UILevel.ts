import { _decorator, Component, Node, Label, Sprite, SpriteFrame } from 'cc';
import { GoalData } from '../../data/GameData';
import { UILevelGoal } from './UILevelGoal';
import { UIFrameBase } from '../UIFrameBase';
import { SaveData } from '../../data/SaveData';
const { ccclass, property } = _decorator;

@ccclass('UILevel')
export class UILevel extends UIFrameBase {

    @property(Node)
    level: Node = null;

    @property(Label)
    movesCount: Label = null;

    @property([UILevelGoal])
    goalItems: [UILevelGoal] = [];

    @property(UIFrameBase)
    levelResult: UIFrameBase = null;
    @property(UIFrameBase)
    levelCompletePopup: UIFrameBase = null;

    @property(Sprite)
    sidePanel_Left: Sprite = null;
    @property(Sprite)
    sidePanel_Right: Sprite = null;

    @property(SpriteFrame)
    common: SpriteFrame = null;
    @property(SpriteFrame)
    hard: SpriteFrame = null;
    @property(SpriteFrame)
    superHard: SpriteFrame = null;


    start() {
        this.level.on("refresh", () => this.refreshAll());
        this.level.on("complete", (isSuccess: boolean, goldEarned: number) => this.showResult(isSuccess, goldEarned));
        this.level.on("all_goals_complete_event", (movesRemain) => this.showLevelCompletePopup());

        SaveData.instance.node.on("level_progress_loaded", () => this.refreshAll());
    }

    refresh(movesCount: number) {
        this.movesCount.string = movesCount;
    }

    refreshGoals(goals: GoalData[]) {
        for(let i = 0; i < goals.length && i < this.goalItems.length; i++) {
            if(i < goals.length) {
                this.goalItems[i].refresh(goals[i]);
            }
            else {
                let goalData = new GoalData();
                goalData.id = "common";
                this.goalItems[i].refresh(goalData);
            }
        }
    }

    refreshAll() {
        let levelComp = this.level.getComponent("Level");

        this.refresh(levelComp.getMoves());
        this.refreshGoals(levelComp.getGoals());

        let difficulty = levelComp.getDifficulty();
        
        if(difficulty === "hard") {
            this.sidePanel_Left.spriteFrame = this.hard;
            this.sidePanel_Right.spriteFrame = this.hard;
        }
        else if(difficulty === "superhard") {
            this.sidePanel_Left.spriteFrame = this.superHard;
            this.sidePanel_Right.spriteFrame = this.superHard;
        }
        else {
            this.sidePanel_Left.spriteFrame = this.common;
            this.sidePanel_Right.spriteFrame = this.common;
        }
    }

    showResult(isSuccess: boolean, goldEarned: number) {
        this.levelResult.show();
        this.levelResult.refresh(isSuccess, goldEarned);
    }

    showLevelCompletePopup() {
        this.levelCompletePopup.show();
    }
}


