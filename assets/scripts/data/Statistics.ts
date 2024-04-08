import { _decorator, Component, Node } from 'cc';
import { GameData } from './GameData';
import { SaveData } from './SaveData';
const { ccclass, property } = _decorator;


@ccclass('LevelProgressStatisticsData')
export class LevelProgressStatisticsData {
    @property
    levelId = 0;

    @property
    redDestroyed = 0;
    @property
    rocketsDestroyed = 0;
    @property
    destroyedByDiscoball = 0;

    @property
    fails = 0;
}


@ccclass('Statistics')
export class Statistics extends Component {

    private levelsStats: LevelProgressStatisticsData[] = [];

    public static instance: Statistics = null;

    private isInited: boolean = false;


    onLoad() {
        Statistics.instance = this;
    }

    init(levels: LevelData[]) {
        this.levelsStats = [];

        for(let i = 0; i < levels.length; i++) {
            let newStat = new LevelProgressStatisticsData();
            newStat.levelId = i;
            newStat.redDestroyed = 0;
            newStat.rocketsDestroyed = 0;
            newStat.destroyedByDiscoball = 0;
            newStat.fails = 0;

            this.levelsStats.push(newStat);
        }

        this.isInited = true;

        SaveData.instance.loadStatistics();
    }


    updateLevelStat(newStat: LevelProgressStatisticsData) {
        if (!this.isInited || !newStat) {
            return;
        }
    
        const index = this.levelsStats.findIndex(s => s.levelId === newStat.levelId);
    
        if (index !== -1) {
            this.levelsStats[index].redDestroyed = newStat.redDestroyed;
            this.levelsStats[index].rocketsDestroyed = newStat.rocketsDestroyed;
            this.levelsStats[index].destroyedByDiscoball = newStat.destroyedByDiscoball;
            this.levelsStats[index].fails = newStat.fails;
        }
        else {
            this.levelsStats.push(newStat);
        }
    }

    loadLevelStat(id: number): LevelProgressStatisticsData {
        return this.levelsStats.find(s => s.levelId === id);
    }


    getLevelsStats(): LevelProgressStatisticsData[] {
        return this.levelsStats;
    }

    setLevelsStats(stats: LevelProgressStatisticsData[]) {
        this.levelsStats = [];
        for(let i = 0; i < stats.length; i++) {
            let newStat = new LevelProgressStatisticsData();
            newStat.levelId = stats[i].levelId;
            newStat.redDestroyed = stats[i].redDestroyed;
            newStat.rocketsDestroyed = stats[i].rocketsDestroyed;
            newStat.destroyedByDiscoball = stats[i].destroyedByDiscoball;
            newStat.fails = stats[i].fails;

            this.levelsStats.push(newStat);
        }
    }
}


