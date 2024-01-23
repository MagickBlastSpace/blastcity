import { _decorator, Component, Node, Label } from 'cc';
import { GoalData } from '../../data/GameData';
import { UILevelGoal } from './UILevelGoal';
import { UIFrameBase } from '../UIFrameBase';
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


    start() {
        this.level.on("refresh", (movesCount: number) => this.refresh(movesCount));
        this.level.on("refresh_goals", (goals: GoalData[]) => this.refreshGoals(goals));

        this.level.on("complete", (isSuccess: boolean) => this.showResult(isSuccess));
    }

    refresh(movesCount: number) {
        this.movesCount.string = "Moves: " + movesCount;
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

    showResult(isSuccess: boolean) {
        this.levelResult.show();
        this.levelResult.refresh(isSuccess);
    }
}


