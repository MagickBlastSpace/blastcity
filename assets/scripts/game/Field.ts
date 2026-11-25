import {
    _decorator,
    Component,
    instantiate,
    isValid,
    Node,
    Prefab,
    Quat,
    sp,
    UIOpacity,
    UITransform,
    Vec2,
    Vec3
} from 'cc';
import {
    GameData,
    GoalData,
    LevelData,
    SpecialPrefabData,
    SpecialTileData,
    SpecialTileStateData,
} from '../data/GameData';
import { LevelIdTranslator } from '../data/LevelIdTranslator';
import { SaveData } from '../data/SaveData';
import { UserData } from '../data/UserData';
import { ArtPreviewAssetLoader } from '../preview/ArtPreviewAssetLoader';
import { UITile } from '../ui/UITile';
import { TileCollectSkin } from '../ui/effects/TileCollectFx';
import { TileCollectFxManager } from '../ui/effects/TileCollectFxManager';
import { AssetsLoader } from '../utils/AssetsLoader';
import { AudioController } from '../utils/AudioController';
import { TileBase } from './TileBase';
import { Bomb } from './bonus_tiles/Bomb';
import { BonusTileBase } from './bonus_tiles/BonusTileBase';
import { Discoball } from './bonus_tiles/Discoball';
import { Rocket } from './bonus_tiles/Rocket';
import { Boosters } from './boosters/Boosters';
import { ButlersGift } from './boosters/ButlersGift';
import { StartBonuses } from './boosters/StartBonuses';
import { SpecTileBase } from './spec_tiles/SpecTileBase';
import { StatusBase } from './statuses/StatusBase';
const { ccclass, property } = _decorator;

export interface WinRocketLineRequest {
    row: number;
    col: number;
    targetWorld: Vec3 | null;
    handled: boolean;
    onReach: () => void;
}

@ccclass('Field')
export class Field extends Component {
	@property(Node)
	level: Node = null;
	@property(StartBonuses)
	startBonuses: StartBonuses = null;
	@property(ButlersGift)
	butlersGift: ButlersGift = null;
	@property([Boosters])
	boosters: Boosters[] = [];

	@property([Node])
	layersForCleanup: Node[] = [];

	@property([SpecialPrefabData])
	tutorialPrefabs: SpecialPrefabData[] = [];

    @property(TileCollectFxManager)
    tileCollectFxManager: TileCollectFxManager = null;

	@property
	numRows: number = 8;
	@property
	numCols: number = 8;

    @property(Node)
    bonusSpawnOverlay: Node = null;

    @property
    devForceSuperDiscoball: boolean = false;

	private tileArray: Node[][] = [];
	private statusArray: Node[][] = [];

	private bonusPool: Node[] = [];

	private isClickAvailable: boolean = false;
	private isLevelComplete: boolean = false;
	private isBonusPoolActivated: boolean = false;
	private bonusIndex = 0;

    private activeDiscoballSequences: Set<Node> = new Set();
    private shouldActivateBonusPoolAfterDiscoball: boolean = false;
    private discoballPendingBlockingInaction: boolean = false;

	private availableColors: string[] = [];
	private startPool: string[] = [];
	private spawnPools: string[][] = [];

	private fallTime: number = 0.02; //0.3
	private swapTime: number = 0.15;

	private spawnTilesSchedule: Function = null;
	private isSpawnScheduled: boolean = false;
	private isCompleteScheduled: boolean = false;

    private winSkipFinalized: boolean = false;
    private winPlanReady: boolean = false;

    private winMovesConsumed: number = 0;
    private winBonusActivationPlanned: boolean = false;

    private winPlannedPositions: Vec2[] = [];
    private winSpawnsDone: number = 0;
    private winSkipRewardSnapshot: number = 0;

    private winScheduledCallbacks: Array<() => void> = [];

	private rocketPreset: string = 'random';
	private dynamiteGoals: GoalData[] = [];
	private cosmorocketGoals: GoalData[] = [];

	private isSuperDiscoballMode: boolean = false;

	private savedVerticalRockets: Node[][] = [];
	private savedHorizontalRockets: Node[][] = [];

	private presetedNodes: Node[] = [];

	private levelCompletePoints: number = 0;

	private isAssetsLoaded = false;

	private tilePrefab: Prefab = null;
	private emptyPrefab: Prefab = null;
	private bombPrefab: Prefab = null;
	private rocketPrefab: Prefab = null;
	private discoballPrefab: Prefab = null;

	private specialPrefabs: SpecialPrefabData[] = [];
	private statusPrefabs: SpecialPrefabData[] = [];

	private spawnedTutorialItems: Node[] = [];

	private primaryColor: string = '';
	private secondaryColor: string = '';

	private savedLevelData: LevelData;

	private isTutorialActive: boolean = false;
	private tutorialKey: string = '';
	private tutorialTiles: SpecialTileData[] = [];

	onLoad() {
		this.isAssetsLoaded = false;
	}

	setTilePrefab(prefab: Prefab) {
		this.tilePrefab = prefab;
	}

	setEmptyTilePrefab(prefab: Prefab) {
		this.emptyPrefab = prefab;
	}

	setBombPrefab(prefab: Prefab) {
		this.bombPrefab = prefab;
	}

	setRocketPrefab(prefab: Prefab) {
		this.rocketPrefab = prefab;
	}

	setDiscoballPrefab(prefab: Prefab) {
		this.discoballPrefab = prefab;
	}

	addSpecialPrefab(prefab: Prefab, specName: string) {
		let spec = new SpecialPrefabData();
		spec.id = specName;
		spec.prefab = prefab;

		this.specialPrefabs.push(spec);
	}

	addStatusPrefab(prefab: Prefab, statusName: string) {
		let status = new SpecialPrefabData();
		status.id = statusName;
		status.prefab = prefab;

		this.statusPrefabs.push(status);
	}

	setAssetsAsLoaded() {
		this.isAssetsLoaded = true;

		if (this.savedLevelData) {
			const levelData = this.savedLevelData;

			this.savedLevelData = null;

			this.spawnInitialBoard(levelData);

			return;
		}

		this.spawnInitialBoard(GameData.instance.getCurrentLevel());
	}

	start() {
		for (let row = 0; row < this.numRows; row++) {
			this.tileArray[row] = [];
			this.statusArray[row] = [];
			for (let col = 0; col < this.numCols; col++) {
				this.tileArray[row][col] = null;
				this.statusArray[row][col] = null;
			}
		}

		this.availableColors = [
			'blue',
			'red',
			'green',
			'yellow',
			'purple',
		];

		this.level.on('goal_complete_event', (goalId) =>
			this.setGoalCompleteEvent(goalId),
		);
		this.level.on('goal_possible_event', (goalId) =>
			this.setGoalPossible(goalId),
		);
		this.level.on('all_goals_complete_event', (movesRemain) =>
			this.setLevelAsCompleted(movesRemain),
		);
		this.level.on('extra', () => {
			this.scheduleRespawn(0.2, true);
		});

		for (let i = 0; i < this.boosters.length; i++) {
			this.boosters[i].node.on('extra_hit', (row, col, isBonusChain, delay) => {
				this.extraHit(row, col, isBonusChain, delay);
			});
			this.boosters[i].node.on('respawn', (timeToRespawn) => {
				this.scheduleRespawn(timeToRespawn, true);
			});
			this.boosters[i].node.on('shuffle', () => {
				if (this.isClickAvailable && !this.isLevelComplete) {
					this.shuffleTiles();
				}
			});

			this.boosters[i].node.on(
				'booster_activation',
				(boosterType, row, col) => {
					this.node.emit('booster', boosterType, row, col);
				},
			);
		}

		this.isSuperDiscoballMode = false;

		SaveData.instance.node.on('level_progress_loaded', (level) => {
			try {
				console.log('Save Level Data Initialization Started...');

				this.spawnInitialBoard(level);
			} catch (error) {
				console.log('Save Level Data Load Error: ' + error);

				console.log('Level Data Report: ' + level.toJSON());

				this.scheduleOnce(() => {
					this.spawnInitialBoard(GameData.instance.getCurrentLevel());
				}, 0.5);
			}
		});
	}

    private getTileCollectSkin(
        tileType: string
    ): TileCollectSkin {
        switch(tileType) {
            case 'blue':
                return 'blue';

            case 'red':
                return 'red';

            case 'green':
                return 'green';

            case 'yellow':
                return 'yellow';

            case 'purple':
                return 'violet';

            default:
                return 'blue';
        }
    }

	private removeOrangeFromPool(pool: string[]): string[] {
		if (!pool) {
			return [];
		}

		return pool.filter((item) => item !== 'orange');
	}

	private getRandomAvailableLevelColor(): string {
        const colors = this.getAvailableColors();
        const uniqueColors: string[] = [];

        for (let i = 0; i < colors.length; i++) {
            if (!uniqueColors.includes(colors[i])) {
                uniqueColors.push(colors[i]);
            }
        }

        if (uniqueColors.length > 0) {
            const index = Math.floor(Math.random() * uniqueColors.length);

            return uniqueColors[index];
        }

        const fallbackColors = ['blue', 'red', 'green', 'yellow'];

        const index = Math.floor(Math.random() * fallbackColors.length);

        return fallbackColors[index];
    }

	spawnInitialBoard(level: LevelData) {
		if (level === null || level === undefined) {
			return;
		}

        level = LevelIdTranslator.translateLevel(level);

		if (!this.isAssetsLoaded) {
			this.savedLevelData = level;

			AssetsLoader.instance.initGameplay(level);
			AssetsLoader.instance.loadGameplayAssets();

			return;
		}

        this.resetWinFlow();

		this.setSuperDiscoballMode(UserData.instance.getIsSuperDiscoballActive());

		this.isLevelComplete = false;

		if (level.startPool !== null && level.startPool !== undefined) {
			this.startPool = this.removeOrangeFromPool(level.startPool);
		}

		if (this.startPool.length === 0) {
			this.startPool = ['blue', 'red', 'green', 'yellow'];
		}

		this.resetSpawnPools();
		this.spawnPools = [];
		if (level.spawnPools) {
			if (level.spawnPools.length < this.numCols - 1) {
				this.resetSpawnPools();
			} else {
				for (let i = 0; i < level.spawnPools.length; i++) {
					let duplicateSpawnPool =
						this.removeOrangeFromPool(level.spawnPools[i]);

					if (duplicateSpawnPool.length === 0) {
						duplicateSpawnPool = ['blue', 'red', 'green', 'yellow'];
					}

					this.spawnPools.push(duplicateSpawnPool);
				}
			}
		} else {
			for (let i = 0; i < this.spawnPools.length; i++) {
				if (!this.spawnPools[i]) {
					this.spawnPools[i] = ['blue', 'red', 'green', 'yellow'];
				} else {
					if (this.spawnPools[i].length === 0) {
						this.spawnPools[i] = ['blue', 'red', 'green', 'yellow'];
					}
				}
			}
		}

		this.rocketPreset = level.rocketPreset;
		if (
			this.rocketPreset !== 'random' &&
			this.rocketPreset !== 'vertical' &&
			this.rocketPreset !== 'horizontal'
		) {
			this.rocketPreset = 'random';
		}

		this.dynamiteGoals = [];
		if (level.dynamiteGoals !== null && level.dynamiteGoals !== undefined) {
			for (let i = 0; i < level.dynamiteGoals.length; i++) {
				let newGoal = new GoalData();
				newGoal.id = level.dynamiteGoals[i].id;
				newGoal.count = level.dynamiteGoals[i].count;

				this.dynamiteGoals.push(newGoal);
			}
		}
		if (this.dynamiteGoals.length < 4) {
			this.setDefaultDynamiteGoals();
		}

		this.cosmorocketGoals = [];
		if (
			level.cosmorocketGoals !== null &&
			level.cosmorocketGoals !== undefined
		) {
			for (let i = 0; i < level.cosmorocketGoals.length; i++) {
				let newGoal = new GoalData();
				newGoal.id = level.cosmorocketGoals[i].id;
				newGoal.count = level.cosmorocketGoals[i].count;

				this.cosmorocketGoals.push(newGoal);
			}
		}
		if (this.cosmorocketGoals.length < 5) {
			this.setDefaultCosmorocketGoals();
		}

		this.clearBoard();

		for (let row = 0; row < this.numRows; row++) {
			for (let col = 0; col < this.numCols; col++) {
				this.spawnCommonTile(row, col, 'start');
			}
		}

		if (level.emptyTiles) {
			for (let i = 0; i < level.emptyTiles.length; i++) {
				this.spawnEmptyTile(level.emptyTiles[i].y, level.emptyTiles[i].x);
			}
		}

		if (level.specialTiles) {
			for (let i = 0; i < level.specialTiles.length; i++) {
				let tileId = level.specialTiles[i].id;

				if (tileId === 'orange') {
					tileId = this.getRandomAvailableLevelColor();
				}

				if (this.availableColors.includes(tileId)) {
					this.presetedNodes.push(
						this.spawnCommonTile(
							level.specialTiles[i].row,
							level.specialTiles[i].col,
							tileId,
						),
					);
				}
				else if (
					tileId === 'rocket_horizontal' ||
					tileId === 'rocket_vertical'
				) {
					this.spawnRocket(
						level.specialTiles[i].row,
						level.specialTiles[i].col,
						tileId,
					);
				}
				else if (tileId === 'bomb') {
					this.spawnBomb(
						level.specialTiles[i].row,
						level.specialTiles[i].col,
					);
				}
				else if (tileId === 'rocket') {
					this.spawnRandomRocket(
						level.specialTiles[i].row,
						level.specialTiles[i].col,
					);
				}
				else if (
					tileId === 'discoball' ||
					tileId.split('_')[0] === 'discoball' ||
					tileId === 'super' ||
					tileId === 'multi'
				) {
					this.spawnDiscoball(
						level.specialTiles[i].row,
						level.specialTiles[i].col,
					);
				}
				else {
					this.spawnSpecialTile(
						level.specialTiles[i].row,
						level.specialTiles[i].col,
						tileId,
					);
				}
			}
		}

		if (level.statuses) {
			for (let i = 0; i < level.statuses.length; i++) {
				this.spawnStatus(
					level.statuses[i].row,
					level.statuses[i].col,
					level.statuses[i].id,
				);
			}
		}

		this.subscribeAll(level.goals);

		if (level.destroyedOnStart) {
			for (let i = 0; i < level.destroyedOnStart.length; i++) {
				let row = level.destroyedOnStart[i].y;
				let col = level.destroyedOnStart[i].x;
				if (this.tileArray[row][col]) {
					let tileComp = this.tileArray[row][col].getComponent(TileBase);
					if (tileComp.isCommonTile()) {
						this.destroyTile(row, col, true);
					}
				}
			}
		}

		this.spawnNewTiles(true, false);

		if (level.specsState) {
			this.scheduleOnce(() => {
				this.restoreSpecTilesState(level.specsState);
			}, this.fallTime);
		}

		if (level.statusesState) {
			this.scheduleOnce(() => {
				this.restoreStatusesState(level.statusesState);
			}, this.fallTime);
		}

		this.node.emit('level_init', level);
		this.node.emit('centrate', this.tileArray);

		if (level.tutorial) {
			this.node.emit('tutorial', level.tutorial);

			this.isTutorialActive = true;
			this.tutorialKey = level.tutorial;

			if (level.tutorialTiles) {
				this.tutorialTiles = level.tutorialTiles;

				for (let i = 0; i < level.tutorialTiles.length; i++) {
					let item = this.spawnTutorialItem(
						level.tutorialTiles[i].row,
						level.tutorialTiles[i].col,
						level.tutorialTiles[i].id,
					);

					this.spawnedTutorialItems.push(item);
				}
			}
		}

		this.isCompleteScheduled = false;

		this.savedLevelData = null;
	}

    restoreSpecTilesState(specs: SpecialTileStateData[]) {
        for(let i = 0; i < specs.length; i++) {
            const state = specs[i];
            const tile = this.tileArray[state.row]?.[state.col];

            if(!tile) continue;

            const tileComp = tile.getComponent(SpecTileBase);

            if(!tileComp) continue;

            tileComp.setStrength(state.strength);

            tileComp.setStrengthRed(state.strengthRed);
            tileComp.setStrengthBlue(state.strengthBlue);
            tileComp.setStrengthGreen(state.strengthGreen);
            tileComp.setStrengthYellow(state.strengthYellow);
            tileComp.setStrengthPurple(state.strengthPurple);

            tileComp.setCustomParameter(state.customParameter);
        }
    }

	restoreStatusesState(statuses: SpecialTileStateData[]) {
		for (let i = 0; i < statuses.length; i++) {
			let status = this.statusArray[statuses[i].row][statuses[i].col];
			if (status) {
				let statusComp = status.getComponent(StatusBase);
				statusComp.setCustomParameter(statuses[i].customParameter);
			}
		}
	}

	resetSpawnPools() {
		for (let col = 0; col < this.numCols; col++) {
			this.spawnPools[col] = ['blue', 'red', 'green', 'yellow'];
		}
	}

	setDefaultDynamiteGoals() {
		this.dynamiteGoals = [];
		for (let i = 0; i < 4; i++) {
			let goal = new GoalData();
			goal.id = 'common';
			goal.count = 0;
			this.dynamiteGoals.push(goal);
		}
	}

	setDefaultCosmorocketGoals() {
		this.cosmorocketGoals = [];
		let cosmoTypes = ['red', 'blue', 'green', 'yellow', 'purple'];
		for (let i = 0; i < 5; i++) {
			let goal = new GoalData();
			goal.id = cosmoTypes[i];
			goal.count = 0;
			this.cosmorocketGoals.push(goal);
		}
	}

	clearBoard() {
        if(this.spawnTilesSchedule) {
            this.unschedule(this.spawnTilesSchedule);
        }

        this.spawnTilesSchedule = null;
        this.isSpawnScheduled = false;

        this.activeDiscoballSequences.clear();
        this.shouldActivateBonusPoolAfterDiscoball = false;
        this.discoballPendingBlockingInaction = false;

        this.bonusPool = [];

		for (let row = 0; row < this.numRows; row++) {
			for (let col = 0; col < this.numCols; col++) {
				let tile = this.tileArray[row][col];
				if (tile !== null) {
					this.destroyTile(row, col, true);
				}

				let status = this.statusArray[row][col];
				if (status !== null) {
					this.destroyStatus(row, col, true);
				}
			}
		}

		for (let col = 0; col < this.numCols; col++) {
			for (let row = 0; row < this.numRows; row++) {
				this.tileArray[row][col] = null;
				this.statusArray[row][col] = null;
			}
		}

		for (let i = 0; i < this.layersForCleanup.length; i++) {
			let children = this.layersForCleanup[i].children;

			for (let child of children) {
				child.destroy();
			}

			this.layersForCleanup[i].removeAllChildren();
		}

		this.presetedNodes = [];
	}

	subscribeAll(goals: GoalData[]) {
		for (let row = 0; row < this.numRows; row++) {
			for (let col = 0; col < this.numCols; col++) {
				let tile = this.tileArray[row][col];
				if (tile !== null) {
					let tileComp = tile.getComponent(TileBase);
					tileComp.subscribeOnFieldEvents(this.node);
					tileComp.subscribeOnGoals(goals);
				}

				let status = this.statusArray[row][col];
				if (status !== null) {
					let statusComp = status.getComponent(StatusBase);
					statusComp.subscribeOnFieldEvents(this.node);
				}
			}
		}
	}


    spawnCommonTile(row: number, col: number, tType: string): Node {

        let tileType = tType;

        if(tType === 'start' || tType === 'random') {
            const pool = tType === 'start' ? this.startPool : this.spawnPools[col];

            const validPool = pool?.length ? pool : this.availableColors;

            if(!validPool?.length) {
                console.error('[FIELD SPAWN] Empty spawn pool', {
                    row,
                    col,
                    tType
                });

                return null;
            }

            tileType = validPool[ Math.floor(Math.random() * validPool.length) ];
        }

        if(!this.availableColors.includes(tileType)) {

            if(tileType === 'rocket') {
                this.spawnRandomRocket(row, col);
                return;
            }

            if(tileType === 'rocket_horizontal' || tileType === 'rocket_vertical') {
                return this.spawnRocket(row, col, tileType);
            }

            if(tileType === 'bomb') {
                return this.spawnBomb(row, col);
            }

            if(tileType === 'discoball' || tileType?.split('_')[0] === 'discoball') {
                return this.spawnDiscoball(row, col);
            }

            const prefabData = this.specialPrefabs.find((item) => item.id === tileType);

            if(!prefabData?.prefab || !isValid(prefabData.prefab, true)) {

                console.error('[FIELD SPAWN FALLBACK]', {
                    missingTileId: tileType,
                    row,
                    col,
                    tType,
                    availableSpecs: this.specialPrefabs.map(
                        (item) => item.id
                    )
                });

                const colorsFromPool = ( this.spawnPools[col] ?? [] ).filter((color) => this.availableColors.includes(color));

                const safeColors = colorsFromPool.length ? colorsFromPool : this.availableColors;

                if(!safeColors.length) {
                    console.error('[FIELD SPAWN] No fallback color');
                    return null;
                }

                const fallbackColor = safeColors[ Math.floor(Math.random() * safeColors.length) ];

                return this.spawnCommonTile(row, col, fallbackColor);
            }

            const spawnedTile = this.spawnSpecialTile(
                row,
                col,
                tileType
            );

            if(spawnedTile) {
                let goalType = tileType;

            if(this.isColoredType(tileType)) {
                goalType = LevelIdTranslator.getColoredGoalIdForTile(
                    tileType
                );
            }

                this.node.emit('goal_check', goalType, this.countAllTilesByType(tileType));
            }

            return spawnedTile;
        }

        this.destroyTile(row, col, true);

        const tileNode = instantiate(this.tilePrefab);
        this.layersForCleanup[0].addChild(tileNode);

        const tileComponent = tileNode.getComponent('Tile');

        return this.initTile(
            tileComponent,
            row,
            col,
            tileType
        );
    }


	spawnBomb(row: number, col: number): Node {
        this.destroyTile(row, col, false);

        const tileNode = instantiate(this.bombPrefab);
        this.layersForCleanup[0].addChild(tileNode);

        const tileComponent = tileNode.getComponent("Bomb");
        const spawnedTile = this.initTile(tileComponent, row, col, "bomb");

        return spawnedTile;
    }

	spawnRocket(row: number, col: number, tileType: string): Node {
        this.destroyTile(row, col, false);

        const tileNode = instantiate(this.rocketPrefab);
        this.layersForCleanup[0].addChild(tileNode);

        const tileComponent = tileNode.getComponent("Rocket");
        const spawnedTile = this.initTile(tileComponent, row, col, tileType);

        return spawnedTile;
    }

	spawnRandomRocket(row: number, col: number) {
		if (this.rocketPreset === 'random') {
			const tileType = Math.floor(Math.random() * 2);
			if (tileType === 0) {
				this.spawnRocket(row, col, 'rocket_vertical');
			} else {
				this.spawnRocket(row, col, 'rocket_horizontal');
			}
		} else {
			this.spawnRocket(row, col, 'rocket_' + this.rocketPreset);
		}
	}

	spawnDiscoball(row: number, col: number): Node {
        this.destroyTile(row, col, true);

        const tileNode = instantiate(this.discoballPrefab);
        this.layersForCleanup[0].addChild(tileNode);

        const tileComponent = tileNode.getComponent("Discoball");
        const useSuper = this.isSuperDiscoballMode || (UserData.instance?.isDevMode() && this.devForceSuperDiscoball);

        const tileType = useSuper ? 'super' : 'multi';
        const spawnedTile = this.initTile(tileComponent, row, col, tileType);

        return spawnedTile;
    }

	spawnEmptyTile(row: number, col: number): Node {
		this.destroyTile(row, col, true);
		const tileNode = instantiate(this.emptyPrefab);
		this.layersForCleanup[0].addChild(tileNode);
		const tileComponent = tileNode.getComponent('EmptyTile');
		let spawnedTile = this.initTile(tileComponent, row, col, 'empty');
		return spawnedTile;
	}

	spawnSpecialTile(row: number, col: number, tileId: string): Node {
		//console.log("Spawning special tile of type: " + tileId);

		if (tileId.split('_')[1] === 'random') {
			let availableColors = this.getAvailableColors();
			let colorIndex = Math.floor(Math.random() * availableColors.length);
			let color = availableColors[colorIndex];

			tileId = tileId.split('_')[0] + '_' + color;
		}

		const prefabData = this.specialPrefabs.find((p) => p.id === tileId);
        const prefab = prefabData?.prefab;

        if(!prefab || !isValid(prefab, true)) {
            console.error('[FIELD MISSING SPECIAL PREFAB]', {
                tileId,
                row,
                col,
                spawnPool: this.spawnPools[col],
                registeredSpecs: this.specialPrefabs.map((item) => ({
                    id: item.id,
                    loaded: !!item.prefab && isValid(item.prefab, true)
                }))
            });

            return null;
        }

		this.destroyTile(row, col, true);
		const tileNode = instantiate(prefab);
		this.layersForCleanup[0].addChild(tileNode);
		const tileComponent = tileNode.getComponent(SpecTileBase);
		let spawnedTile = this.initTile(tileComponent, row, col, tileId);

        void ArtPreviewAssetLoader.applyPrefabArt(
            tileNode,
            [
                'special',
                'big_special',
            ],
            tileId,
        );

		return spawnedTile;
	}

	spawnStatus(row: number, col: number, statusId: string): Node {
		const prefab = this.statusPrefabs.find((p) => p.id === statusId)?.prefab;
		if (prefab === null) {
			return;
		}

		this.destroyStatus(row, col, true);
		const statusNode = instantiate(prefab);
		this.layersForCleanup[0].addChild(statusNode);
		const statusComponent = statusNode.getComponent(StatusBase);
		let spawnedStatus = this.initStatus(statusComponent, row, col, statusId);

        void ArtPreviewAssetLoader.applyPrefabArt(
            statusNode,
            [
                'statuses',
            ],
            statusId,
        );

		return spawnedStatus;
	}

	spawnTutorialItem(row: number, col: number, id: string): Node {
		const prefab = this.tutorialPrefabs.find((p) => p.id === id)?.prefab;
		if (prefab === null) {
			return;
		}

		const tutorialNode = instantiate(prefab);
		this.node.emit('init_tutorial_item', tutorialNode, row, col);

		this.spawnedTutorialItems.push(tutorialNode);

		return tutorialNode;
	}

	spawnBonusTile(
		row: number,
		col: number,
		bonusId: string,
		isBonusPool: boolean,
	) {
		let spawnedTile = null;
		if (bonusId === 'bomb') {
			spawnedTile = this.spawnBomb(row, col);
		} else if (
			bonusId === 'rocket_horizontal' ||
			bonusId === 'rocket_vertical'
		) {
			spawnedTile =
				this.rocketPreset === 'random'
					? this.spawnRocket(row, col, bonusId)
					: this.spawnRocket(row, col, 'rocket_' + this.rocketPreset);
		} else if (
			this.availableColors.includes(bonusId) ||
			bonusId === 'multi' ||
			bonusId === 'super'
		) {
			spawnedTile = this.spawnDiscoball(row, col);
		}

		if (!isBonusPool || !spawnedTile) {
            return;
        }

        this.bonusPool.push(spawnedTile);

        if (bonusId === 'bomb') {
            const bomb = spawnedTile.getComponent(Bomb);

            if (bomb?.bombSpine) {
                const bombUi = spawnedTile.getComponent(UITile);

                if (bombUi) {
                    if (bombUi.spine === bomb.bombSpine) {
                        bombUi.keepSpineVisible = true;
                    }

                    bombUi.prepareInstantBonusSpawn();
                }

                spawnedTile.setScale(1, 1, 1);

                console.log('[BOMB SPAWN FIX]', {
                    row,
                    col,
                    position: spawnedTile.worldPosition.toString()
                });

                bomb.playSpawnAnimation(this.bonusSpawnOverlay);
                return;
            }
        }

        if (
            bonusId === 'rocket_vertical' ||
            bonusId === 'rocket_horizontal'
        ) {
            const rocket = spawnedTile.getComponent(Rocket);

            if (rocket?.spawnSpine) {
                console.log('[ROCKET BEFORE SPAWN]', 'parent:', spawnedTile.parent?.name, 'position:', spawnedTile.position.toString());
                const rocketUi = spawnedTile.getComponent(UITile);

                if (rocketUi) {
                    rocketUi.keepSpineVisible = true;
                    rocketUi.prepareInstantBonusSpawn();
                }

                spawnedTile.setScale(1, 1, 1);

                rocket.playSpawnAnimation(this.bonusSpawnOverlay);
                return;
            }
        }

        const tileComp = spawnedTile.getComponent(BonusTileBase);

        if (tileComp) {
            tileComp.setBonusPoolAnimation();
        }
	}

	initTile(
		tileComponent: any,
		row: number,
		col: number,
		tileType: string,
	): Node {
		tileComponent.init(row, col, tileType);

		let isDoubleWidth = tileComponent.isSpecialTile()
			? tileComponent.isDoubleWidth()
			: false;
		let isDoubleHeight = tileComponent.isSpecialTile()
			? tileComponent.isDoubleHeight()
			: false;

		let isTripleWidth = tileComponent.isSpecialTile()
			? tileComponent.isTripleWidth()
			: false;
		let isTripleHeight = tileComponent.isSpecialTile()
			? tileComponent.isTripleHeight()
			: false;

		const tileNode = tileComponent.node;

        tileNode.on('click', (tile: Node) => {
            const comp = tile?.getComponent(TileBase) as any;

            console.log('[FIELD TILE CLICK]', {
                type: comp?.getTileType(),
                row: comp?.getRow(),
                col: comp?.getCol(),
                activated: typeof comp?.isTileActivated === 'function'
                    ? comp.isTileActivated()
                    : false,
                isClickAvailable: this.isClickAvailable,
                nodeActive: tile?.activeInHierarchy,
                scale: tile?.scale.toString()
            });

            this.onTileClick(tile);
        });

		tileNode.on('get_matches', (tile) => {
			this.findAndDestroyMatches(tile, true);
		});
		tileNode.on('change', (row, col, tileId) => {
			this.spawnSpecialTile(row, col, tileId);
		});
		tileNode.on('change_bonus', (row, col, bonusId, isBonusPool) => {
			if (this.checkPositionForBonus(row, col)) {
				this.spawnBonusTile(row, col, bonusId, isBonusPool);
			}
		});
        tileNode.on('finish_discoball_bonus_combo', (discoballRow: number, discoballCol: number, partnerRow: number, partnerCol: number, bonusType: string) => {
            this.finishDiscoballBonusCombo(tileNode, discoballRow, discoballCol, partnerRow, partnerCol, bonusType);
        });
		tileNode.on('activate_bonus_pool', () => {
            const isDiscoball = tileType === 'multi' || tileType === 'super';

            if(isDiscoball && this.activeDiscoballSequences.has(tileNode)) {
                this.completeDiscoballSequence(tileNode, true);
                return;
            }

            this.activateBonusPool();
        });

        tileNode.on('shell_pearl_fly', (sourceNode: Node) => {
            this.node.emit('shell_pearl_started');
            this.node.emit('shell_pearl_fly', sourceNode);
        });

        tileNode.on('magic_hat_carrot_fly', (sourceNode: Node) => {
            this.node.emit('magic_hat_carrot_started');
            this.node.emit('magic_hat_carrot_fly', sourceNode);
        });

        tileNode.on('respawn', (timeToRespawn: number) => {
            const isDiscoball = tileType === 'multi' || tileType === 'super';

            if(isDiscoball && timeToRespawn > 0) {
                this.beginDiscoballSequence(tileNode);
                return;
            }

            if(isDiscoball && timeToRespawn === 0 && this.activeDiscoballSequences.has(tileNode)) {
                this.completeDiscoballSequence(tileNode, false);
                return;
            }

            this.scheduleRespawn(timeToRespawn, false);
        });

        tileNode.on('respawn_block_inaction', (timeToRespawn: number) => {
            this.scheduleRespawn(timeToRespawn, true);
        });
		tileNode.on('damage_all', (tileId) => {
			this.setAllDamagedByType(tileId);
		});
		tileNode.on('status', (statusId) => {
			let cleanTiles = this.getAllCleanTilesPositions();
			if (cleanTiles.length > 0) {
				const tileIndex = Math.floor(Math.random() * cleanTiles.length);
				this.spawnStatus(
					cleanTiles[tileIndex].x,
					cleanTiles[tileIndex].y,
					statusId,
				);

				this.node.emit('spawn', statusId);
			}
		});
		tileNode.on('status_static', (row, col, statusId) => {
			if (this.checkPositionForStatus(row, col)) {
				this.spawnStatus(row, col, statusId);
				this.node.emit('goal_inc', statusId);
			}
		});
		tileNode.on('special', (tileId) => {
			let cleanTiles = this.getAllCommonTilesPositions();
			if (cleanTiles.length > 0) {
				const tileIndex = Math.floor(Math.random() * cleanTiles.length);
				this.spawnSpecialTile(
					cleanTiles[tileIndex].x,
					cleanTiles[tileIndex].y,
					tileId,
				);

				this.node.emit('spawn', tileId);
			}
		});
		tileNode.on('swap', (pos_1, pos_2) => {
			this.swapTiles(pos_1, pos_2);
		});
		tileNode.on('destroy_random_tile', () => {
			this.destroyRandomTile();
		});
		tileNode.on('extra_hit', (row, col, isBonusChain, delay) => {
			this.extraHit(row, col, isBonusChain, delay);
		});
		tileNode.on('extra_hit_with_damage', (row, col) => {
			this.extraHitWithDamage(row, col);
		});
		tileNode.on('increased_extra_hit', (row, col, increase) => {
			this.increasedExtraHit(row, col, increase);
		});
		tileNode.on('random_extra_hit', (except, except2) => {
			this.randomExtraHit(except, except2);
		});
		tileNode.on('destroy_tile', (row, col) => {
			this.destroyTile(row, col, false);
		});
		tileNode.on('goal', (goalType) => {
			this.node.emit('destroy', goalType);

			if (goalType === 'magic_hat' || goalType === 'birds') {
				this.node.emit('spawn', goalType);
			}
		});
		tileNode.on('goal_inc', (goalType) => {
			this.node.emit('goal_inc', goalType);
		});
		tileNode.on('clear', () => {
			this.clearExtra();
		});
		tileNode.on('goal_effect', (goalType, row, col) => {
			this.node.emit('goal_effect', goalType, row, col);
		});
		tileNode.on('goal_effect_positioned', (goalType, x, y) => {
			this.node.emit('goal_effect_positioned', goalType, x, y);
		});

		this.tileArray[row][col] = tileNode;
		if (isDoubleWidth || isTripleWidth) {
			this.destroyTile(row, col + 1, false);
			this.tileArray[row][col + 1] = tileNode;
		}
		if (isDoubleHeight || isTripleHeight) {
			this.destroyTile(row + 1, col, false);
			this.tileArray[row + 1][col] = tileNode;
		}
		if (
			(isDoubleWidth && isDoubleHeight) ||
			(isTripleWidth && isTripleHeight)
		) {
			this.destroyTile(row + 1, col + 1, false);
			this.tileArray[row + 1][col + 1] = tileNode;
		}

		if (isTripleWidth) {
			this.destroyTile(row, col + 2, false);
			this.tileArray[row][col + 2] = tileNode;
		}
		if (isTripleHeight) {
			this.destroyTile(row + 2, col, false);
			this.tileArray[row + 2][col] = tileNode;
		}
		if (isTripleWidth && isTripleHeight) {
			this.destroyTile(row + 2, col + 2, false);
			this.tileArray[row + 2][col + 2] = tileNode;
			this.destroyTile(row + 2, col + 1, false);
			this.tileArray[row + 2][col + 1] = tileNode;
			this.destroyTile(row + 1, col + 2, false);
			this.tileArray[row + 1][col + 2] = tileNode;
		}

		let isStatusNode = this.statusArray[row][col] !== null;
		this.node.emit('init_tile', tileNode, isStatusNode, tileType);

        (globalThis as any).__debugRockets = () => {
            this.debugRocketsOnBoard();
        };

		return tileNode;
	}


    private debugRocketsOnBoard(): void {
        const rows: Record<string, any>[] = [];

        for (let row = 0; row < this.numRows; row++) {
            for (let col = 0; col < this.numCols; col++) {
                const node = this.tileArray[row]?.[col];

                if (!node?.isValid) continue;

                const tile = node.getComponent(TileBase);
                const type = tile?.getTileType();

                if (
                    type !== 'rocket_vertical' &&
                    type !== 'rocket_horizontal'
                ) {
                    continue;
                }

                const rocket = node.getComponent(Rocket);
                const ui = node.getComponent(UITile);
                const icon = rocket?.icon;
                const spine = rocket?.spawnSpine;

                const opacity = node.getComponent(UIOpacity) as any;
                const transform = node.getComponent(UITransform) as any;

                rows.push({
                    cell: `${row},${col}`,
                    type,
                    uuid: node.uuid,
                    activated: tile?.isTileActivated(),
                    inBonusPool: this.bonusPool.includes(node),
                    clickAvailable: this.isClickAvailable,

                    rootActive: node.activeInHierarchy,
                    rootScale: node.scale.toString(),
                    rootPosition: node.position.toString(),
                    worldPosition: node.worldPosition.toString(),
                    parent: node.parent?.name,
                    opacity: opacity?.opacity ?? 'none',
                    hitbox: transform?.contentSize?.toString() ?? 'none',

                    iconActive: icon?.node?.activeInHierarchy,
                    iconEnabled: icon?.enabled,
                    iconScale: icon?.node?.scale.toString(),
                    iconFrame: icon?.spriteFrame?.name,

                    spineActive: spine?.node?.activeInHierarchy,
                    spineParent: spine?.node?.parent?.name,
                    keepSpineVisible: ui?.keepSpineVisible
                });
            }
        }

        console.log('[ROCKET BOARD SNAPSHOT]');
        console.table(rows);
    }

	initStatus(
		statusComponent: any,
		row: number,
		col: number,
		statusType: string,
	): Node {
		statusComponent.init(row, col, statusType);

		const statusNode = statusComponent.node;

		statusNode.on('change', (row, col, statusId) => {
			this.spawnStatus(row, col, statusId);
		});
		statusNode.on('goal', (goalType) => {
			this.node.emit('destroy', goalType);
		});
		statusNode.on('respawn', (timeToRespawn) => {
			this.scheduleRespawn(timeToRespawn, false);
		});
		statusNode.on('destroy_status', (row, col) => {
			this.destroyStatus(row, col, false);
		});

		this.statusArray[row][col] = statusNode;

        if(statusType === 'bubble') {
            statusNode.on('bubble_click', () => {
                if(this.statusArray[row]?.[col] !== statusNode) return;

                const tile = this.tileArray[row]?.[col];

                if(!tile?.isValid) {
                    if(this.isClickAvailable && !this.isLevelComplete && !this.isBonusPoolActivated && !this.isTutorialActive) {
                        statusNode.emit('bubble_touch');
                    }
                    return;
                }

                console.log('[BUBBLE CLICK FORWARDED]', { row, col });

                this.onTileClick(tile);
            });
        }

		this.node.emit('init_status', statusNode, statusType);

		return statusNode;
	}

	destroyTile(row: number, col: number, isClear: boolean) {
		const tile = this.tileArray[row][col];
		if (tile !== null) {
			let tileComponent = null;
			try {
				tileComponent = tile.getComponent('TileBase');
			} catch (error) {
				//console.log("Destroy Catch: " + error);

				return;
			}

			if (tileComponent.isEmptyTile() && !isClear) {
				return;
			}

			let isDoubleWidth = tileComponent.isSpecialTile()
				? tileComponent.isDoubleWidth()
				: false;
			let isDoubleHeight = tileComponent.isSpecialTile()
				? tileComponent.isDoubleHeight()
				: false;

			let isTripleWidth = tileComponent.isSpecialTile()
				? tileComponent.isTripleWidth()
				: false;
			let isTripleHeight = tileComponent.isSpecialTile()
				? tileComponent.isTripleHeight()
				: false;

			if (isClear) {
				tileComponent.destroyClear();
			} else {
				tileComponent.destroyTile(0);
			}

			this.tileArray[row][col] = null;

			if (isDoubleWidth || isTripleWidth) {
				this.tileArray[row][col + 1] = null;
			}
			if (isDoubleHeight || isTripleHeight) {
				this.tileArray[row + 1][col] = null;
			}
			if (
				(isDoubleWidth && isDoubleHeight) ||
				(isTripleWidth && isTripleHeight)
			) {
				this.tileArray[row + 1][col + 1] = null;
			}

			if (isTripleWidth) {
				this.tileArray[row][col + 2] = null;
			}
			if (isTripleHeight) {
				this.tileArray[row + 2][col] = null;
			}
			if (isTripleWidth && isTripleHeight) {
				this.tileArray[row + 2][col + 2] = null;
				this.tileArray[row + 2][col + 1] = null;
				this.tileArray[row + 1][col + 2] = null;
			}
		}
	}

	destroyRandomTile() {
		let tiles = [];

		for (let i = 0; i < this.numRows; i++) {
			for (let j = 0; j < this.numCols; j++) {
				const tile = this.tileArray[i][j];
				if (tile !== null) {
					const tileComp = tile.getComponent(TileBase);
					if (tileComp.isCommonTile()) {
						tiles.push(tileComp);
					}
				}
			}
		}

		if (tiles.length === 0) {
			return;
		}

		let randomIndex = Math.floor(Math.random() * tiles.length);
		this.destroyTile(tiles[randomIndex].getRow(), tiles[randomIndex].getCol(), false);
	}

	destroyStatus(row: number, col: number, isClear: boolean) {
		const status = this.statusArray[row][col];
		if (status !== null) {
			let statusComponent = status.getComponent(StatusBase);
			if (isClear) {
				statusComponent.destroyClear();
			} else {
				statusComponent.destroyStatus();
			}
			this.statusArray[row][col] = null;
		}
	}

	getAllCleanTilesPositions(): Vec2[] {
		let tiles = [];

		for (let row = 0; row < this.numRows; row++) {
			for (let col = 0; col < this.numCols; col++) {
				if (this.checkPositionForStatus(row, col)) {
					tiles.push(new Vec2(row, col));
				}
			}
		}

		return tiles;
	}

	getAllCommonTilesPositions(): Vec2[] {
		let tiles = [];

		for (let row = 0; row < this.numRows; row++) {
			for (let col = 0; col < this.numCols; col++) {
				if (this.checkPositionForStatus(row, col)) {
					let tile = this.tileArray[row][col];
					if (tile === null) {
						tiles.push(new Vec2(row, col));
					} else {
						const tileComp = tile.getComponent(TileBase);
						if (tileComp.isCommonTile()) {
							tiles.push(new Vec2(row, col));
						}
					}
				}
			}
		}

		return tiles;
	}

	getAllCommonTilesPositionsIgnoreStatus(): Vec2[] {
		let tiles = [];

		for (let row = 0; row < this.numRows; row++) {
			for (let col = 0; col < this.numCols; col++) {
				let tile = this.tileArray[row][col];
				if (tile === null) {
					tiles.push(new Vec2(row, col));
				} else {
					const tileComp = tile.getComponent(TileBase);
					if (tileComp.isCommonTile()) {
						tiles.push(new Vec2(row, col));
					}
				}
			}
		}

		return tiles;
	}

	getAllBonusTilesPositions(): Vec2[] {
		let tiles = [];

		for (let row = 0; row < this.numRows; row++) {
			for (let col = 0; col < this.numCols; col++) {
				if (this.checkPositionForStatus(row, col)) {
					let tile = this.tileArray[row][col];
					if (tile !== null) {
						const tileComp = tile.getComponent(TileBase);
						if (tileComp.isBonusTile()) {
							tiles.push(new Vec2(row, col));
						}
					}
				}
			}
		}

		return tiles;
	}

	getUnpresetedCommonTilesPositions(): Vec2[] {
		let commonTiles = this.getAllCommonTilesPositions();
		let unpresetedCommonTiles = [];

		for (let i = 0; i < commonTiles.length; i++) {
			if (
				!this.presetedNodes.includes(
					this.tileArray[commonTiles[i].x][commonTiles[i].y],
				)
			) {
				let tile = this.tileArray[commonTiles[i].x][commonTiles[i].y];
				if (tile !== null) {
					let tileComp = tile.getComponent(TileBase);
					if (
						tileComp.getMatches(this.tileArray, this.statusArray).length < 2
					) {
						unpresetedCommonTiles.push(commonTiles[i]);
					}
				}
			}
		}

		if (unpresetedCommonTiles.length > 0) {
			return unpresetedCommonTiles;
		}

		for (let i = 0; i < commonTiles.length; i++) {
			if (
				!this.presetedNodes.includes(
					this.tileArray[commonTiles[i].x][commonTiles[i].y],
				)
			) {
				let tile = this.tileArray[commonTiles[i].x][commonTiles[i].y];
				if (tile !== null) {
					unpresetedCommonTiles.push(commonTiles[i]);
				}
			}
		}

		return unpresetedCommonTiles;
	}

	getAllTilesPositionsByType(tileType: string): Vec2[] {
		let tiles = [];

		for (let row = 0; row < this.numRows; row++) {
			for (let col = 0; col < this.numCols; col++) {
				if (this.checkPositionForStatus(row, col)) {
					let tile = this.tileArray[row][col];
					if (tile !== null) {
						const tileComp = tile.getComponent(TileBase);
						if (
							tileComp.isCommonTile() &&
							tileComp.getTileType() === tileType
						) {
							tiles.push(new Vec2(row, col));
						}
					}
				}
			}
		}

		return tiles;
	}

	activateBonusPool() {
        if(this.winSkipFinalized) return;

		if (this.isBonusPoolActivated) {
			return;
		}

		if (this.bonusPool.length > 0) {
			this.bonusIndex = 0;
			this.isBonusPoolActivated = true;

			this.spawnNewTiles(false, true);
		} else {
			if (this.isCompleteScheduled) {
				this.node.emit('complete', this.countBonusGold());
			}
		}
	}


    activateBonusByIndex(index: number, byOrder: boolean): void {
        if(this.winSkipFinalized) return;

        if(index >= this.bonusPool.length) {
            this.scheduleRespawn(this.fallTime, false);
            return;
        }

        if(byOrder) {
            this.bonusIndex = index + 1;
        }

        const bonusTile = this.bonusPool[index];

        const continueBonusPool = () => {
            if(byOrder) {
                this.activateBonusByIndex(this.bonusIndex, true);
            }
        };

        if(!bonusTile || !isValid(bonusTile, true)) {
            console.warn('[BONUS POOL] Skipping destroyed bonus', {
                index,
                poolLength: this.bonusPool.length
            });

            continueBonusPool();
            return;
        }

        const bonusComp = bonusTile.getComponent(TileBase);

        if(!bonusComp || !isValid(bonusComp, true)) {
            console.warn('[BONUS POOL] TileBase missing', {
                index,
                node: bonusTile.name
            });

            continueBonusPool();
            return;
        }

        const bonusType = bonusComp.getTileType();

        const activate = () => {
            if(this.winSkipFinalized) return;

            if(!this.node.isValid || !this.node.activeInHierarchy) {
                return;
            }


            if(!bonusTile || !isValid(bonusTile, true)) {
                console.warn('[BONUS POOL] Bonus destroyed while waiting', {
                    index,
                    type: bonusType
                });

                continueBonusPool();
                return;
            }

            const currentComp = bonusTile.getComponent(TileBase);

            if(!currentComp || !isValid(currentComp, true)) {
                continueBonusPool();
                return;
            }

            if(currentComp.isTileActivated()) {
                continueBonusPool();
                return;
            }

            console.log('[BONUS POOL ACTIVATE]', {
                index,
                type: bonusType,
                row: currentComp.getRow(),
                col: currentComp.getCol()
            });

            if(bonusType === 'multi' || bonusType === 'super') {
                this.setPrimaryColors();
            }

            const isBonusDestroyed = this.findAndDestroyMatches(
                bonusTile,
                false
            );

            if(byOrder && !isBonusDestroyed) {
                continueBonusPool();
            }
        };
        if(bonusType === 'multi' || bonusType === 'super') {
            console.log('[DISCO WAITING FOR FALL]', {
                index,
                type: bonusType
            });

            this.waitForVisualFallEnd(
                activate,
                bonusTile
            );

            return;
        }

        activate();
    }


    extraHit(row: number, col: number, isBonusChain: boolean, delay: number) {
        if(this.winSkipFinalized) return;

        if(
            row < 0 ||
            row >= this.numRows ||
            col < 0 ||
            col >= this.numCols
        ) {
            return;
        }

        const tile = this.tileArray[row][col];

        if (tile?.isValid) {
            const rocket = tile.getComponent(Rocket);

            if (rocket) {
                console.warn('[EXTRA HIT ROCKET]', {
                    row,
                    col,
                    uuid: tile.uuid,
                    type: rocket.getTileType(),
                    isBonusChain,
                    scale: tile.scale.toString(),
                    inBonusPool: this.bonusPool.includes(tile),
                    poolActivated: this.isBonusPoolActivated,
                    poolSize: this.bonusPool.length
                });
            }
        }

        if(!tile || !tile.isValid) {
            this.giveStatusDamage(row, col, false);
            return;
        }

        if(isBonusChain) {
            const discoball = tile.getComponent(Discoball);

            if(discoball) {
                if(discoball.isTileActivated()) return;

                this.setPrimaryColors();

                discoball.getMatches(
                    this.tileArray,
                    this.statusArray,
                    true
                );

                return;
            }
        }

        if(isBonusChain) {
            const tileComp = tile.getComponent(TileBase);

            if(tileComp && tileComp.isBonusTile()) {
                const bonusType = tileComp.getTileType();
                const isDiscoball = bonusType === 'multi' || bonusType === 'super';

                const activateBonus = () => {
                    if(this.winSkipFinalized) return;

                    if(
                        !this.node.isValid ||
                        !tile.isValid ||
                        !tileComp.isValid ||
                        tileComp.isTileActivated()
                    ) {
                        return;
                    }

                    if(isDiscoball) {
                        console.log('[DISCO EXTRA HIT WAIT]', {
                            type: bonusType,
                            row: tileComp.getRow(),
                            col: tileComp.getCol()
                        });

                        this.waitForVisualFallEnd(() => {
                            if(this.winSkipFinalized) return;

                            if(
                                !this.node.isValid ||
                                !tile.isValid ||
                                !tileComp.isValid ||
                                tileComp.isTileActivated()
                            ) {
                                return;
                            }

                            console.log('[DISCO EXTRA HIT ACTIVATE]', {
                                type: bonusType,
                                row: tileComp.getRow(),
                                col: tileComp.getCol()
                            });

                            this.setPrimaryColors();

                            const matches = tileComp.getMatches(
                                this.tileArray,
                                this.statusArray,
                                true
                            );

                            if(Array.isArray(matches)) {
                                matches.forEach(matchedTile => {
                                    if(matchedTile?.isValid) {
                                        this.giveDamage(
                                            matchedTile,
                                            bonusType,
                                            false,
                                            0
                                        );
                                    }
                                });
                            }
                        }, tile);

                        return;
                    }

                    this.clearExtra();

                    tileComp.getMatches(
                        this.tileArray,
                        this.statusArray,
                        true
                    );
                };

                if(this.bonusPool.includes(tile)) {
                    this.scheduleOnce(() => {
                        activateBonus();
                    }, this.fallTime);

                    return;
                }

                this.bonusPool.push(tile);

                if(!this.isBonusPoolActivated) {
                    this.scheduleOnce(() => {
                        if(!tile.isValid || !tileComp.isValid) {
                            return;
                        }

                        this.activateBonusPool();
                    }, this.fallTime);
                }
                else {
                    this.scheduleOnce(() => {
                        activateBonus();
                    }, this.fallTime);
                }

                return;
            }
        }

        this.giveDamage(
            tile,
            'extra_hit',
            true,
            delay
        );
    }

	extraHitWithDamage(row: number, col: number) {
		if (
			row > this.numRows - 1 ||
			col > this.numCols - 1 ||
			row < 0 ||
			col < 0
		) {
			return;
		}

		let tile = this.tileArray[row][col];

		if (tile !== null) {
			const tileComp = tile.getComponent(TileBase);
			this.giveDamage(tile, tileComp.getTileType(), false, 0);
		}
	}

	increasedExtraHit(row: number, col: number, increase: number) {
		if (
			row > this.numRows - 1 ||
			col > this.numCols - 1 ||
			row < 0 ||
			col < 0
		) {
			return;
		}

		let tile = this.tileArray[row][col];

		if (tile !== null) {
			const tileComp = tile.getComponent(TileBase);
			if (tileComp.isBonusTile()) {
				return;
			}

			if (tileComp.isSpecialTile()) {
				for (let i = 0; i < increase; i++) {
					if (!tileComp.isReadyToDestroy()) {
						this.extraHit(row, col, true, 0);
						this.clearExtra();
					}
				}
			} else {
				this.extraHit(row, col, true, 0);
			}
		}
	}

	randomExtraHit(except: string, except2: string) {
		let tiles = [];
		let specTiles = [];

		for (let i = 0; i < this.numRows; i++) {
			for (let j = 0; j < this.numCols; j++) {
				const tile = this.tileArray[i][j];
				if (tile !== null) {
					const tileComp = tile.getComponent(TileBase);
					if (tileComp.isCommonTile()) {
						tiles.push(tile);
					} else if (
						tileComp.isSpecialTile() &&
						tileComp.getTileType() !== except &&
						tileComp.getTileType() !== except2
					) {
						const specComp = tile.getComponent(SpecTileBase);

                        if(specComp && !specComp.isTileDamaged()) {
                            specTiles.push(tile);
                        }
					}
				}
			}
		}

		if (tiles.length === 0 && specTiles.length === 0) {
			return;
		}

		if (specTiles.length > 0) {
			let randomIndex = Math.floor(Math.random() * specTiles.length);
			this.giveDamage(specTiles[randomIndex], 'extra_hit', true, 0);
		} else {
			let randomIndex = Math.floor(Math.random() * tiles.length);
			this.giveDamage(tiles[randomIndex], 'extra_hit', true, 0);
		}
	}

	checkPositionForStatus(row: number, col: number): boolean {
		if (row < this.numRows && row >= 0 && col < this.numCols && col >= 0) {
			let tile = this.tileArray[row][col];
			let status = this.statusArray[row][col];

			if (status === null) {
				if (tile !== null) {
					let tileComp = tile.getComponent(TileBase);
					if (!tileComp.isEmptyTile() && !tileComp.isSpecialTile()) {
						return true;
					}
				} else {
					return true;
				}
			}
		}

		return false;
	}

    private finishDiscoballBonusCombo(
        discoballNode: Node,
        discoballRow: number,
        discoballCol: number,
        partnerRow: number,
        partnerCol: number,
        bonusType: string
    ): void {
        if(!this.activeDiscoballSequences.has(discoballNode)) {
            console.warn('[DISCO COMBO] No active discoball sequence');
            return;
        }

        const validBonusType =
            bonusType === 'bomb' ||
            bonusType === 'rocket_vertical' ||
            bonusType === 'rocket_horizontal';

        if(!validBonusType) {
            console.error('[DISCO COMBO] Invalid bonus type:', bonusType);
            this.completeDiscoballSequence(discoballNode, true);
            return;
        }

        const partnerNode = this.tileArray[partnerRow]?.[partnerCol];

        if(partnerNode?.isValid && partnerNode !== discoballNode) {
            const partnerComp = partnerNode.getComponent(TileBase);

            if(
                partnerComp?.isBonusTile() &&
                !partnerComp.isTileActivated() &&
                partnerComp.getTileType() === bonusType &&
                !this.bonusPool.includes(partnerNode)
            ) {
                this.bonusPool.push(partnerNode);

                console.log('[DISCO COMBO] Original bonus preserved', {
                    row: partnerRow,
                    col: partnerCol,
                    type: bonusType
                });
            }
        }

        if(this.tileArray[discoballRow]?.[discoballCol] === discoballNode) {
            this.spawnBonusTile(
                discoballRow,
                discoballCol,
                bonusType,
                true
            );

            console.log('[DISCO COMBO] Discoball converted', {
                row: discoballRow,
                col: discoballCol,
                type: bonusType
            });
        } else {
            console.warn('[DISCO COMBO] Discoball cell changed before conversion');
        }

        this.completeDiscoballSequence(discoballNode, true);
    }

	checkPositionForBonus(row: number, col: number): boolean {
		if (row < this.numRows && row >= 0 && col < this.numCols && col >= 0) {
			let tile = this.tileArray[row][col];
			let status = this.statusArray[row][col];

			if (tile !== null) {
				if (status !== null && status !== undefined) {
					let statusComp = status.getComponent(StatusBase);
					if (statusComp.isBlockingInteraction()) {
						return false;
					}
				}

				let tileComp = tile.getComponent(TileBase);
				if (!tileComp.isEmptyTile() && !tileComp.isSpecialTile()) {
					return true;
				}
			} else {
				return true;
			}
		}

		return false;
	}

	findAndDestroyMatches(tile: Node, isRespawn: boolean): boolean {
        if(this.winSkipFinalized) return false;

		if (!tile) {
			return false;
		}

		let choosenTile = null;
		try {
			choosenTile = tile.getComponent('TileBase');
		} catch (error) {
			return false;
		}

		this.clearExtra();

		const choosenRow = choosenTile.getRow();
		const choosenCol = choosenTile.getCol();
		const choosenType = choosenTile.getTileType();
		const isCommon = choosenTile.isCommonTile();
		const isBonus = choosenTile.isBonusTile();
		let potentialBonus = '';
		if (isCommon) {
			potentialBonus = choosenTile.getPotentialBonus();
		}

		if (isBonus) {
			if (choosenTile.isTileActivated()) {
				return false;
			}
		}

		let isBlockingCombo =
			!isRespawn || (this.isSuperDiscoballMode && choosenType === 'multi');
		let matches = [];
		try {
			matches = choosenTile.getMatches(
				this.tileArray,
				this.statusArray,
				isBlockingCombo,
			);
		} catch (error) {
			return false;
		}

		let isComboBonus = this.isComboBonus(choosenTile);
		let isAnimatedCombo = this.isAnimatedCombo(choosenTile);

        if(matches.length < 2 && !isBonus) {
            return false;
        }

		if (isComboBonus && (choosenType === 'multi' || choosenType === 'super')) {
			this.bonusPool.push(tile);
		}

		this.isClickAvailable =
			!isComboBonus &&
			choosenType !== 'multi' &&
			choosenType !== 'super' &&
			!isAnimatedCombo;


        const shouldAnimateSimpleCollapse =
            isCommon &&
            matches.length >= 2 &&
            matches.length < 5 &&
            this.tileCollectFxManager !== null;


        if(shouldAnimateSimpleCollapse) {

            const skin =
                this.getTileCollectSkin(
                    choosenType
                );


            const fxStarted =
                this.tileCollectFxManager.playSimpleGroupCollapse(
                    matches,
                    skin,
                    () => {
                        this.spawnNewTiles(
                            isRespawn,
                            false
                        );
                    }
                );


            if(fxStarted) {
                this.isClickAvailable = false;

                matches.forEach(
                    (matchedTile) => {

                        this.giveDamage(
                            matchedTile,
                            choosenType,
                            isBonus,
                            0
                        );

                    }
                );

                return true;
            }
        }

        const shouldAnimateBonusCreation = isCommon && matches.length >= 5 && this.tileCollectFxManager !== null;

        if(shouldAnimateBonusCreation) {
            const fxTiles = matches.includes(tile) ? [...matches] : [tile, ...matches];
            const skin = this.getTileCollectSkin(choosenType);
            let spawnedBonus: Node = null;

            const isBombCreation = matches.length >= 7 && matches.length < 9;

            let bonusFxType: 'rocket_horizontal' | 'rocket_vertical' | 'discoball' | null = null;

            if(matches.length >= 9) {
                bonusFxType = 'discoball';
            }
            else if(matches.length >= 5 && matches.length < 7) {
                if(potentialBonus === 'rocket_horizontal') {
                    bonusFxType = 'rocket_horizontal';
                }
                else if(potentialBonus === 'rocket_vertical') {
                    bonusFxType = 'rocket_vertical';
                }
            }

            console.log(`[TILE COLLECT] matches=${matches.length}, potentialBonus=${potentialBonus}, bonusFxType=${bonusFxType}`);

            const fxStarted = this.tileCollectFxManager.playBonusGroupCollect(
                fxTiles,
                tile,
                skin,

                () => {
                    if(matches.length >= 9) {
                        spawnedBonus = this.spawnDiscoball(
                            choosenRow,
                            choosenCol
                        );
                    }
                    else if(matches.length >= 7) {
                        spawnedBonus = this.spawnBomb(
                            choosenRow,
                            choosenCol
                        );
                    }
                    else {
                        spawnedBonus = this.spawnRocket(
                            choosenRow,
                            choosenCol,
                            potentialBonus
                        );
                    }

                    if(spawnedBonus?.isValid) {
                        const bonusUi = spawnedBonus.getComponent(UITile);

                        if(bonusUi) {
                            bonusUi.keepSpineVisible = true;

                            bonusUi.prepareBonusSpawnAtCell();
                        }

                        if(matches.length >= 9) {
                            const disco = spawnedBonus.getComponent(Discoball);

                            if(disco?.discoballSpine?.node?.isValid) {
                                this.followBonusSpawnVisual(
                                    spawnedBonus,
                                    disco.discoballSpine.node,
                                    true
                                );
                            }
                        }
                        else if(matches.length >= 7) {
                            const bomb = spawnedBonus.getComponent(Bomb);

                            if(bomb) {
                                bomb.playSpawnAnimation();

                                this.followBonusSpawnVisual(
                                    spawnedBonus,
                                    bomb.bombSpine?.node
                                );
                            }
                        }
                        else {
                            const rocket = spawnedBonus.getComponent(Rocket);

                            if(rocket) {
                                rocket.playSpawnAnimation();

                                this.followBonusSpawnVisual(
                                    spawnedBonus,
                                    rocket.spawnSpine?.node
                                );
                            }
                        }
                    }

                    this.spawnNewTiles(isRespawn, false);

                    return spawnedBonus;
                },

                () => {},

                () => {},

                isBombCreation,
                bonusFxType
            );

            if(fxStarted) {
                this.isClickAvailable = false;

                matches.forEach((matchedTile) => {
                    this.giveDamage(matchedTile, choosenType, isBonus, 0);
                });

                return true;
            }
        }

        matches.forEach((matchedTile) => {

            this.giveDamage(
                matchedTile,
                choosenType,
                isBonus,
                0
            );

        });


        if(isCommon) {

            if(matches.length >= 9) {

                this.spawnDiscoball(
                    choosenRow,
                    choosenCol
                );

            }
            else if(matches.length >= 7) {

                this.spawnBomb(
                    choosenRow,
                    choosenCol
                );

            }
            else if(matches.length >= 5) {

                this.spawnRocket(
                    choosenRow,
                    choosenCol,
                    potentialBonus
                );

            }
        }

		if (matches.length > 0 || isBonus) {
            if (
                (isComboBonus || choosenType === 'multi' || isAnimatedCombo) &&
                isRespawn
            ) {
                isRespawn = false;
            }

            const isSingleBomb =
                choosenType === 'bomb' &&
                !isComboBonus &&
                !isAnimatedCombo;

            if (isSingleBomb) {
                this.scheduleOnce(() => {
                    this.spawnNewTiles(
                        isRespawn,
                        false
                    );
                }, 0.25);
            }
            else {
                this.spawnNewTiles(
                    isRespawn,
                    false
                );
            }
        }

		return true;
	}

	isComboBonus(tile: TileBase): boolean {
		if (tile.isBonusTile()) {
			if (tile.getTileType() === 'super' || tile.getComboName() === 'super') {
				return true;
			} else if (
				tile.getTileType() === 'bomb' ||
				tile.getTileType() === 'rocket_vertical' ||
				tile.getTileType() === 'rocket_horizontal'
			) {
				if (tile.getComboName() === 'multi') {
					return true;
				}
			} else if (tile.getTileType() === 'multi') {
				if (
					tile.getComboName() === 'bomb' ||
					tile.getComboName() === 'rocket_vertical' ||
					tile.getComboName() === 'rocket_horizontal'
				) {
					return true;
				}
			}
		}
		return false;
	}

	isAnimatedCombo(tile: TileBase): boolean {
		if (tile.isBonusTile()) {
			if (tile.getTileType() === 'bomb') {
				if (
					tile.getComboName() === 'bomb' ||
					tile.getComboName() === 'rocket_horizontal' ||
					tile.getComboName() === 'rocket_vertical'
				)
					return true;
			} else if (
				tile.getTileType() === 'rocket_horizontal' ||
				tile.getTileType() === 'rocket_vertical'
			) {
				if (tile.getComboName() === 'bomb') {
					return true;
				}
			}
		}
		return false;
	}

	giveDamage(
		tile: Node,
		choosenType: string,
		isBonus: boolean,
		destroyDelay: number,
	) {
		if (tile !== null && tile !== undefined) {
			let tileComponent = tile.getComponent(TileBase);
			if (tileComponent.isEmptyTile()) {
				return;
			}

			let isDestroyAvailable = this.isDestroyAvailable(
				tileComponent.getRow(),
				tileComponent.getCol(),
			);
			if (
				(this.availableColors.includes(choosenType) ||
					choosenType === 'multi' ||
					choosenType === 'super') &&
				isDestroyAvailable
			) {
				tileComponent.giveDamage(this.tileArray, this.statusArray);
			}

			if(isDestroyAvailable && !tileComponent.isSpecialTile()) {
                const row = tileComponent.getRow();
                const col = tileComponent.getCol();

                const statusNode = this.statusArray[row]?.[col];
                const statusComp = statusNode?.getComponent(StatusBase);

                if(statusComp?.getStatusType() === 'bubble' && !statusComp.isReadyToDestroy()) {
                    statusComp.getDamage();

                    console.log('[BUBBLE MATCH DAMAGE]', { row, col });
                }

                this.tileArray[row][col] = null;
                tileComponent.destroyTile(destroyDelay);
            }

			if (isBonus && choosenType !== 'multi' && choosenType !== 'super') {
				let isSpec = tileComponent.isSpecialTile();
				if (isSpec && isDestroyAvailable) {
					tileComponent.getDamage('bonus');
				}

				this.giveStatusDamage(
					tileComponent.getRow(),
					tileComponent.getCol(),
					isSpec,
				);

				if (tileComponent.isBonusTile()) {
					if (tileComponent.isTileActivated()) {
						this.tileArray[tileComponent.getRow()][tileComponent.getCol()] =
							null;
						tileComponent.destroyTile(destroyDelay);
					}
				}
			}
		}
	}

	isDestroyAvailable(row: number, col: number): boolean {
		let status = this.statusArray[row][col];
		if (status === null) {
			return true;
		}

		const statusComponent = status.getComponent(StatusBase);

		return !statusComponent.isBlockingDestroyTile();
	}

	giveStatusDamage(row: number, col: number, isSpec: boolean) {
		if (this.statusArray[row][col] === null) {
			return;
		}

		const statusComp = this.statusArray[row][col].getComponent(StatusBase);

		let isBlockInteraction = statusComp.isBlockingInteraction();

		if (isSpec && !isBlockInteraction) {
			return;
		}

		statusComp.getDamage();
	}

	spawnNewTiles(isRespawn: boolean, isBlockingInactionEffect: boolean) {
        if(this.winSkipFinalized) return;

        if(this.activeDiscoballSequences.size > 0) {
            this.discoballPendingBlockingInaction =
                this.discoballPendingBlockingInaction || isBlockingInactionEffect;

            this.isClickAvailable = false;

            return;
        }

		try {
			this.checkStatusesForDestroy();
			this.checkSpecTilesForDestroy();
			this.checkSpecTilesPreActionEffect();
			this.fallTiles();
		} catch (error) {
			console.log('Spawn Err: ' + error);

			this.scheduleRespawn(0.2, isBlockingInactionEffect);
			return;
		}

		if (this.checkSpecTilesForDestroy()) {
			this.scheduleRespawn(0.2, isBlockingInactionEffect);
			return;
		}

		this.node.emit('refresh', this.tileArray, this.statusArray);

		for (let col = 0; col < this.numCols; col++) {
			let shouldSpawnNewTile = true;

			for (let row = this.numRows - 1; row >= 0; row--) {
				const tile = this.tileArray[row][col];
				if (tile !== null) {
					const tileComponent = tile.getComponent(TileBase);

					if (tileComponent.getTileType() === '') {
						this.spawnCommonTile(row, col, 'random');
						break;
					}

					if (
						!tileComponent.isTileShifts() ||
						tileComponent.getRow() !== row ||
						!this.isFallMovementAvailable(
							tileComponent.getRow(),
							tileComponent.getCol(),
						) ||
						this.bonusPool.includes(tile)
					) {
						shouldSpawnNewTile = false;
						break;
					}
				}
				if (tile === null && shouldSpawnNewTile) {
					this.spawnCommonTile(row, col, 'random');
				}
			}
		}

		this.tryToSpawnStartBonuses();
		this.tryToSpawnButlerBonuses();

		this.scheduleOnce(() => {
            if(this.winSkipFinalized) return;

			//buggy
			for (let col = 0; col < this.numCols; col++) {
				for (let row = 0; row < this.numRows; row++) {
					const tile = this.tileArray[row][col];
					if (tile !== null) {
						try {
							const tileComponent = tile.getComponent(TileBase);

							if (tileComponent.getTileType() === '') {
								this.spawnCommonTile(row, col, 'random');
								break;
							}
						} catch (error) {
							console.log('Error in Schedule: ' + error);

							this.node.emit('load_level_error');

							return;
						}
					}
				}
			}

			if(this.isBonusPoolActivated) {
                if(this.activeDiscoballSequences.size > 0) {
                    console.log('[BONUS POOL] Waiting for discoball sequence');
                    return;
                }

                this.activateBonusByIndex(this.bonusIndex, true);
                return;
            }

			if (isRespawn) {
				if (this.checkIfAnyBonusActivated()) {
					isRespawn = false;
				}
			}

			if (
				!isRespawn ||
				this.isBonusPoolActivated ||
				this.bonusPool.length > 0
			) {
				return;
			}

			if (this.isCompleteScheduled) {
				this.node.emit('complete', this.countBonusGold());
				return;
			}

			this.checkSpecTilesInActionEffect(isBlockingInactionEffect);

			this.checkForPotentialBonuses();

			SaveData.instance.saveLevelProgressData();

			this.setPrimaryColors();
		}, this.fallTime);
	}

    private beginDiscoballSequence(tileNode: Node): void {
        if(this.activeDiscoballSequences.has(tileNode)) {
            return;
        }

        this.activeDiscoballSequences.add(tileNode);
        this.isClickAvailable = false;

        if(this.isSpawnScheduled && this.spawnTilesSchedule) {
            this.unschedule(this.spawnTilesSchedule);
            this.spawnTilesSchedule = null;
            this.isSpawnScheduled = false;
        }

        console.log('[DISCO FIELD LOCK]', {
            tile: tileNode.name,
            activeSequences: this.activeDiscoballSequences.size
        });
    }

    private completeDiscoballSequence(
        tileNode: Node,
        activateBonusPool: boolean
    ): void {
        if(activateBonusPool) {
            this.shouldActivateBonusPoolAfterDiscoball = true;
        }

        if(!this.activeDiscoballSequences.has(tileNode)) {
            return;
        }

        this.activeDiscoballSequences.delete(tileNode);

        console.log('[DISCO FIELD UNLOCK]', {
            tile: tileNode.name,
            activeSequences: this.activeDiscoballSequences.size,
            activateBonusPool
        });

        if(this.activeDiscoballSequences.size > 0) {
            return;
        }

        const shouldStartBonusPool = this.shouldActivateBonusPoolAfterDiscoball;
        const shouldBlockInaction = this.discoballPendingBlockingInaction;

        this.shouldActivateBonusPoolAfterDiscoball = false;
        this.discoballPendingBlockingInaction = false;

        if(this.isBonusPoolActivated) {
            this.spawnNewTiles(false, true);
            return;
        }

        if(shouldStartBonusPool && this.bonusPool.length > 0) {
            this.activateBonusPool();
            return;
        }

        this.scheduleRespawn(0, shouldBlockInaction);
    }

	scheduleRespawn(timeToRespawn: number, isBlockingInactionEffect: boolean) {
        if(this.winSkipFinalized) return;

        if(this.activeDiscoballSequences.size > 0) {
            this.discoballPendingBlockingInaction =
                this.discoballPendingBlockingInaction || isBlockingInactionEffect;

            this.isClickAvailable = false;

            console.log('[DISCO RESPAWN DEFERRED]', {
                requestedDelay: timeToRespawn,
                activeSequences: this.activeDiscoballSequences.size
            });

            return;
        }

        if(this.isSpawnScheduled) {
            return;
        }

        this.isClickAvailable = false;

        this.spawnTilesSchedule = () => {
            this.bonusPool = [];
            this.isBonusPoolActivated = false;

            this.spawnNewTiles(true, isBlockingInactionEffect);

            this.isSpawnScheduled = false;
        };

        this.scheduleOnce(this.spawnTilesSchedule, timeToRespawn);
        this.isSpawnScheduled = true;
    }

	fallTiles() {
		for (let col = 0; col < this.numCols; col++) {
			let emptySpaces = 0;
			let holes = 0;

			for (let row = 0; row < this.numRows; row++) {
				const tile = this.tileArray[row][col];

				if (tile === null) {
					emptySpaces++;
				} else {
					let tileComponent = tile.getComponent(TileBase);

					if (
						!tileComponent.isTileShifts() ||
						tileComponent.getRow() !== row ||
						!this.isFallMovementAvailable(
							tileComponent.getRow(),
							tileComponent.getCol(),
						) ||
						this.bonusPool.includes(tile)
					) {
						emptySpaces = 0;
						holes = 0;
					} else if (tileComponent.isEmptyTile()) {
						if (!tileComponent.isBorder(this.tileArray)) {
							holes++;
						}
					} else if (emptySpaces > 0) {
						let newRow = row - emptySpaces - holes;

						let balance = 0;
						while (
							holes >= 0 &&
							newRow < row - 1 &&
							!tileComponent.canFall(this.tileArray, newRow)
						) {
							holes--;
							newRow = row - emptySpaces - holes + balance;
							if (holes <= 0) {
								balance++;
							}
						}

						if (tileComponent.canFall(this.tileArray, newRow)) {
							tileComponent.setRow(newRow);

							let isDoubleWidth = tileComponent.isSpecialTile()
								? tileComponent.isDoubleWidth()
								: false;
							let isDoubleHeight = tileComponent.isSpecialTile()
								? tileComponent.isDoubleHeight()
								: false;

							this.tileArray[newRow][col] = tile;
							this.tileArray[row][col] = null;

							if (isDoubleWidth) {
								this.tileArray[row][tileComponent.getCol()] = null;
								this.tileArray[row][tileComponent.getCol() + 1] = null;
								this.tileArray[newRow][tileComponent.getCol()] = tile;
								this.tileArray[newRow][tileComponent.getCol() + 1] = tile;
							}
							if (isDoubleHeight) {
								this.tileArray[row + 1][tileComponent.getCol()] = null;
								this.tileArray[newRow + 1][tileComponent.getCol()] = tile;
							}
							if (isDoubleWidth && isDoubleHeight) {
								this.tileArray[row + 1][tileComponent.getCol() + 1] = null;
								this.tileArray[newRow + 1][tileComponent.getCol() + 1] = tile;
							}

							if (isDoubleWidth) {
								this.fallTiles();
								return;
							}
						} else {
							emptySpaces = 0;
							holes = 0;
						}
					}
				}
			}
		}
	}

	isFallMovementAvailable(row: number, col: number): boolean {
		let status = this.statusArray[row][col];
		if (status === null) {
			return true;
		}

		const statusComponent = status.getComponent(StatusBase);

		return !statusComponent.isBlockingMovement();
	}

	checkSpecTilesForDestroy(): boolean {
		let isDestroyed = false;
		for (let i = 0; i < this.numRows; i++) {
			for (let j = 0; j < this.numCols; j++) {
				let tile = this.tileArray[i][j];
				if (tile !== null) {
					let tileComponent = null;
					try {
						tileComponent = tile.getComponent(TileBase);
					} catch (error) {
						this.tileArray[i][j] = null;
						continue;
					}

					if (tileComponent.isSpecialTile()) {
						if (!tileComponent.isGroupedTile()) {
							if (tileComponent.isReadyToDestroy()) {
								this.tileArray[tileComponent.getRow()][tileComponent.getCol()] =
									null;

								if (
									tileComponent.isDoubleWidth() ||
									tileComponent.isTripleWidth()
								) {
									this.tileArray[tileComponent.getRow()][
										tileComponent.getCol() + 1
									] = null;
								}
								if (
									tileComponent.isDoubleHeight() ||
									tileComponent.isTripleHeight()
								) {
									this.tileArray[tileComponent.getRow() + 1][
										tileComponent.getCol()
									] = null;
								}
								if (
									(tileComponent.isDoubleWidth() &&
										tileComponent.isDoubleHeight()) ||
									(tileComponent.isTripleWidth() &&
										tileComponent.isTripleHeight())
								) {
									this.tileArray[tileComponent.getRow() + 1][
										tileComponent.getCol() + 1
									] = null;
								}

								if (tileComponent.isTripleWidth()) {
									this.tileArray[tileComponent.getRow()][
										tileComponent.getCol() + 2
									] = null;
								}
								if (tileComponent.isTripleHeight()) {
									this.tileArray[tileComponent.getRow() + 2][
										tileComponent.getCol()
									] = null;
								}
								if (
									tileComponent.isTripleWidth() &&
									tileComponent.isTripleHeight()
								) {
									this.tileArray[tileComponent.getRow() + 2][
										tileComponent.getCol() + 2
									] = null;
									this.tileArray[tileComponent.getRow() + 2][
										tileComponent.getCol() + 1
									] = null;
									this.tileArray[tileComponent.getRow() + 1][
										tileComponent.getCol() + 2
									] = null;
								}

								tileComponent.destroyTile(0);
								isDestroyed = true;
							}
						} else {
							if (tileComponent.isGroupReadyToDestroy(this.tileArray)) {
								this.tileArray[tileComponent.getRow()][tileComponent.getCol()] =
									null;
								tileComponent.destroyTile(0);
								isDestroyed = true;
							}
						}
					}
				}
			}
		}
		return isDestroyed;
	}

	checkStatusesForDestroy() {
		for (let i = 0; i < this.numRows; i++) {
			for (let j = 0; j < this.numCols; j++) {
				let status = this.statusArray[i][j];
				if (status !== null) {
					let statusComponent = status.getComponent(StatusBase);
					if (statusComponent.isReadyToDestroy()) {
						this.statusArray[i][j] = null;
						statusComponent.destroyStatus();
					}
				}
			}
		}
	}

	checkSpecTilesInActionEffect(isBlockingAction: boolean) {
		for (let i = 0; i < this.numRows; i++) {
			for (let j = 0; j < this.numCols; j++) {
				let tile = this.tileArray[i][j];
				let status = this.statusArray[i][j];

				let isStatusBlock = false;
				if (status !== null) {
					let statusComp = status.getComponent(StatusBase);
					isStatusBlock = statusComp.isBlockingDestroyTile();
				}

				if (tile !== null) {
					let tileComponent = null;
					try {
						tileComponent = tile.getComponent(TileBase);
					} catch (error) {
						this.tileArray[i][j] = null;
						continue;
					}

					if (tileComponent.isSpecialTile() && !isStatusBlock) {
						tileComponent.startInActionEffect(
							this.tileArray,
							this.statusArray,
							isBlockingAction,
						);
					}
				}
			}
		}
	}

	checkSpecTilesPreActionEffect() {
		for (let i = 0; i < this.numRows; i++) {
			for (let j = 0; j < this.numCols; j++) {
				let tile = this.tileArray[i][j];
				if (tile !== null) {
					let tileComponent = null;
					try {
						tileComponent = tile.getComponent(TileBase);
					} catch (error) {
						this.tileArray[i][j] = null;
						continue;
					}

					if (tileComponent.isSpecialTile()) {
						tileComponent.startPreActionEffect(this.tileArray);
					}
				}
			}
		}
	}

	checkIfAnyBonusActivated(): boolean {
		for (let i = 0; i < this.numRows; i++) {
			for (let j = 0; j < this.numCols; j++) {
				let tile = this.tileArray[i][j];
				if (tile !== null) {
					let tileComponent = null;
					try {
						tileComponent = tile.getComponent(TileBase);
					} catch (error) {
						continue;
					}

					if (tileComponent.isBonusTile()) {
						if (tileComponent.isTileActivated()) {
							return true;
						}
					}
				}
			}
		}

		return false;
	}

	tryToSpawnStartBonuses() {
		if (!this.startBonuses.isStartBonusesAvailable()) {
			return;
		}

		let bonuses = this.startBonuses.getStartBonusPool();

		if (bonuses.length <= 0) {
			return;
		}

		let availablePositions = this.getUnpresetedCommonTilesPositions();
		if (availablePositions.length < bonuses.length) {
			return;
		}

		availablePositions = this.shuffleArray(availablePositions);

		for (let i = 0; i < bonuses.length; i++) {
			switch (bonuses[i]) {
				case 'rocket':
					let filteredRocketPositions =
						this.filterPositionsByRocketPattern(availablePositions);
					let rocketRow =
						filteredRocketPositions.length > i
							? filteredRocketPositions[i].x
							: availablePositions[i].x;
					let rocketCol =
						filteredRocketPositions.length > i
							? filteredRocketPositions[i].y
							: availablePositions[i].y;

					this.spawnRandomRocket(rocketRow, rocketCol);

					UserData.instance.subResource('rocket', 1);

					break;
				case 'bomb':
					let filteredBombPositions =
						this.filterPositionsByBombPattern(availablePositions);
					let bombRow =
						filteredBombPositions.length > i
							? filteredBombPositions[i].x
							: availablePositions[i].x;
					let bombCol =
						filteredBombPositions.length > i
							? filteredBombPositions[i].y
							: availablePositions[i].y;

					this.spawnBomb(bombRow, bombCol);

					UserData.instance.subResource('bomb', 1);

					break;
				case 'discoball':
					this.spawnDiscoball(availablePositions[i].x, availablePositions[i].y);

					UserData.instance.subResource('discoball', 1);

					break;
			}
		}

		this.startBonuses.clear();
	}

	tryToSpawnButlerBonuses() {
		if (!this.butlersGift.isGiftAvailable()) {
			return;
		}

		let bonuses = this.butlersGift.getBonusPool();

		if (bonuses.length <= 0) {
			return;
		}

		let availablePositions = this.getUnpresetedCommonTilesPositions();
		if (availablePositions.length < bonuses.length) {
			return;
		}

		availablePositions = this.shuffleArray(availablePositions);

		for (let i = 0; i < bonuses.length; i++) {
			switch (bonuses[i]) {
				case 'rocket':
					this.spawnRandomRocket(
						availablePositions[i].x,
						availablePositions[i].y,
					);
					break;
				case 'bomb':
					this.spawnBomb(availablePositions[i].x, availablePositions[i].y);
					break;
				case 'discoball':
					this.spawnDiscoball(availablePositions[i].x, availablePositions[i].y);
					break;
			}
		}

		this.butlersGift.clear();
	}

	filterPositionsByRocketPattern(positions: Vec2[]): Vec2[] {
		let filteredPositions = [];

		for (let i = 0; i < positions.length; i++) {
			let row = positions[i].x;
			let col = positions[i].y;

			let isVerticalPatternFound = false;
			let isHorizontalPatternFound = false;

			for (let j = 0; j < this.numCols; j++) {
				if (this.tileArray[row][j] !== null) {
					let tileComp = this.tileArray[row][j].getComponent(TileBase);
					if (tileComp.isSpecialTile()) {
						isVerticalPatternFound = true;
					}
				}
			}

			for (let j = 0; j < this.numRows; j++) {
				if (this.tileArray[j][col] !== null) {
					let tileComp = this.tileArray[j][col].getComponent(TileBase);
					if (tileComp.isSpecialTile()) {
						isHorizontalPatternFound = true;
					}
				}
			}

			if (isVerticalPatternFound && isHorizontalPatternFound) {
				filteredPositions.push(positions[i]);
			}
		}

		return filteredPositions;
	}

	filterPositionsByBombPattern(positions: Vec2[]): Vec2[] {
		let filteredPositions = [];

		for (let i = 0; i < positions.length; i++) {
			let row = positions[i].x;
			let col = positions[i].y;

			let isBombPatternFound = false;

			for (let i = row - 1; i <= row + 1; i++) {
				for (let j = col - 1; j <= col + 1; j++) {
					if (
						isBombPatternFound ||
						i < 0 ||
						i >= this.numRows ||
						j < 0 ||
						j >= this.numCols
					) {
						continue;
					}

					if (this.tileArray[i][j] !== null) {
						let tileComp = this.tileArray[i][j].getComponent(TileBase);
						if (tileComp.isSpecialTile()) {
							isBombPatternFound = true;
						}
					}
				}
			}

			if (isBombPatternFound) {
				filteredPositions.push(positions[i]);
			}
		}

		return filteredPositions;
	}

    private playVisualTouch(tile: Node): void {
        if (!tile?.isValid) return;

        const tileComponent = tile.getComponent(TileBase);
        if (!tileComponent) return;

        const row = tileComponent.getRow();
        const col = tileComponent.getCol();

        const statusNode = this.statusArray[row]?.[col];
        const statusComp = statusNode?.getComponent(StatusBase);

        const hasBubble = statusComp?.getStatusType() === 'bubble';

        if (hasBubble && statusNode?.isValid) {
            statusNode.emit('bubble_touch');
        }

        const canTouchTile =
            hasBubble || this.isInteractionAvailable(row, col);

        if (
            canTouchTile &&
            (tileComponent.isCommonTile() || tileComponent.isSpecialTile())
        ) {
            tile.emit('touch_feedback');
        }
    }


	onTileClick(tile: Node) {
		if (
			!this.isClickAvailable ||
			tile === null ||
			this.isLevelComplete ||
			this.isBonusPoolActivated ||
			this.isTutorialActive
		) {
			this.node.emit('game_state', this.tileArray, this.statusArray);

			return;
		}

		const tileComponent = tile.getComponent(TileBase);

		for (let i = 0; i < this.boosters.length; i++) {
			if (this.boosters[i].isBoosterActive()) {
				this.isClickAvailable = false;
				this.boosters[i].useActiveBooster(
					this.tileArray,
					tileComponent.getRow(),
					tileComponent.getCol(),
				);

				this.node.emit('game_state', this.tileArray, this.statusArray);

				return;
			}
		}


        if (tileComponent.isSpecialTile()) {
            this.playVisualTouch(tile);

            this.node.emit('game_state', this.tileArray, this.statusArray);
            return;
        }


        if ( !this.isInteractionAvailable( tileComponent.getRow(), tileComponent.getCol() ) ) {
            const row = tileComponent.getRow();
            const col = tileComponent.getCol();

            const statusNode = this.statusArray[row]?.[col];
            const statusComp = statusNode?.getComponent(StatusBase);

            if (statusComp?.getStatusType() === 'bubble') {
                this.playVisualTouch(tile);
            }

            this.node.emit('game_state', this.tileArray, this.statusArray);
            return;
        }


		let isMatchesFound = this.findAndDestroyMatches(tile, true);

		if (isMatchesFound) {
			this.node.emit('move');

			if (tileComponent.isCommonTile()) {
				AudioController.instance.playTilesDestroy();
			}

			if (this.levelCompletePoints > 0) {
				this.levelCompletePoints = this.levelCompletePoints - 1;
			}
		} else {
            this.playVisualTouch(tile);

            this.node.emit('game_state', this.tileArray, this.statusArray);
        }
	}

	isInteractionAvailable(row: number, col: number): boolean {
		let status = this.statusArray[row][col];
		if (status === null) {
			return true;
		}

		const statusComponent = status.getComponent(StatusBase);

		return !statusComponent.isBlockingInteraction();
	}

	checkForPotentialBonuses() {
		this.clearAll();

		let checkedTiles = [];
		let isMoveAvailable = false;

		let updatedVerticalRockets: Node[][] = [];
		let updatedHorizontalRockets: Node[][] = [];

		for (let i = 0; i < this.numRows; i++) {
			for (let j = 0; j < this.numCols; j++) {
				let tile = this.tileArray[i][j];
				let status = this.statusArray[i][j];

				if (!checkedTiles.includes(tile) && tile !== null) {
					const tileComponent = tile.getComponent(TileBase);
					let matches = [];

					let isStatusBlock = false;
					if (status !== null) {
						let statusComp = status.getComponent(StatusBase);
						isStatusBlock = statusComp.isBlockingDestroyTile();
					}

					if (tileComponent.isCommonTile() && !isStatusBlock) {
						matches = tileComponent.getMatches(
							this.tileArray,
							this.statusArray,
						);

						if (matches.length >= 2) {
							isMoveAvailable = true;
						}

						if (matches.length >= 9) {
							this.setPotentialBonus(matches, 'discoball');
						} else if (matches.length >= 7) {
							this.setPotentialBonus(matches, 'bomb');
						} else if (matches.length >= 5) {
							if (this.rocketPreset === 'random') {
								let tileType = Math.floor(Math.random() * 2);

								if (matches.every(tile => this.savedVerticalRockets.some(row => row.includes(tile)))) {
									tileType = 0;
								} else if (matches.every(tile => this.savedHorizontalRockets.some(row => row.includes(tile)))) {
									tileType = 1;
								}

								if (tileType === 0) {
									this.setPotentialBonus(matches, 'rocket_vertical');
									updatedVerticalRockets.push(matches);
								} else {
									this.setPotentialBonus(matches, 'rocket_horizontal');
									updatedHorizontalRockets.push(matches);
								}
							} else {
								this.setPotentialBonus(matches, 'rocket_' + this.rocketPreset);
							}
						}

						checkedTiles = checkedTiles.concat(matches);
					} else if (tileComponent.isBonusTile() && !isStatusBlock) {
						isMoveAvailable = true;
					} else {
						checkedTiles.push(tile);
					}
				}
			}
		}

		this.savedVerticalRockets = updatedVerticalRockets;
        this.savedHorizontalRockets = updatedHorizontalRockets;

        const levelComp = this.level ? this.level.getComponent('Level') as any : null;
        const hasMovesRemaining = !levelComp || levelComp.getMoves() > 0;

        if(!hasMovesRemaining) {
            this.isClickAvailable = false;

            if(!this.isSpawnScheduled) {
                this.node.emit('move_end');
                this.node.emit('game_state', this.tileArray, this.statusArray);
            }

            return;
        }

        if(!isMoveAvailable) {
            this.shuffleTiles();
        }
        else {
            if(!this.isLevelComplete && !this.isSpawnScheduled) {
                this.isClickAvailable = true;
            }
            else if(this.isLevelComplete) {
                return;
            }
        }

        if(!this.isSpawnScheduled) {
            this.node.emit('move_end');
            this.node.emit('game_state', this.tileArray, this.statusArray);
        }
	}

	setPotentialBonus(tiles: Node[], bonus: string) {
		tiles.forEach((matchedTile) => {
			let tileComponent = matchedTile.getComponent(TileBase);
			tileComponent.setPotentialBonus(bonus);
		});
	}

	clearAll() {
		for (let i = 0; i < this.numRows; i++) {
			for (let j = 0; j < this.numCols; j++) {
				let tile = this.tileArray[i][j];
				if (tile !== null) {
					let tileComponent = tile.getComponent(TileBase);
					tileComponent.clear();
				}
			}
		}
	}

	clearExtra() {
		for (let i = 0; i < this.numRows; i++) {
			for (let j = 0; j < this.numCols; j++) {
				let tile = this.tileArray[i][j];
				if (tile !== null) {
					try {
						let tileComponent = tile.getComponent(TileBase);
						tileComponent.clearExtra();
					} catch (error) {
						console.log('Clear extra catch: ' + error);
					}
				}
			}
		}
	}

	setAllDamagedByType(tileId: string) {
		for (let i = 0; i < this.numRows; i++) {
			for (let j = 0; j < this.numCols; j++) {
				let tile = this.tileArray[i][j];
				if (tile !== null) {
					let tileComponent = null;
					try {
						tileComponent = tile.getComponent(TileBase);
					} catch (error) {
						this.tileArray[i][j] = null;
						continue;
					}

					if (tileComponent.getTileType() === tileId) {
						tileComponent.setAsDamaged();
					}
				}
			}
		}
	}

	getAvailableColors(): string[] {
		let colors = [];

		for (let j = 0; j < this.spawnPools.length; j++) {
			for (let i = 0; i < this.spawnPools[j].length; i++) {
				if (
					this.availableColors.includes(this.spawnPools[j][i]) &&
					this.spawnPools[j][i] !== 'orange'
				) {
					colors.push(this.spawnPools[j][i]);
				}
			}
		}

		return colors;
	}

	getNumRows(): number {
		return this.numRows;
	}

	getNumCols(): number {
		return this.numCols;
	}

	getTile(row: number, col: number): Node {
		if (row >= 0 && row < this.numRows && col >= 0 && col < this.numCols) {
			return this.tileArray[row][col];
		}
		return null;
	}

	getTilesArray(): Node[][] {
		return this.tileArray;
	}

	getStatusArray(): Node[][] {
		return this.statusArray;
	}

	swapTiles(pos_1: Vec2, pos_2: Vec2) {
		let tile1 = this.tileArray[pos_1.x][pos_1.y];
		if (tile1 === null || tile1 === undefined) {
			return;
		}
		let tileComp1 = tile1.getComponent('TileBase');

		let tile2 = this.tileArray[pos_2.x][pos_2.y];
		if (tile2 === null || tile2 === undefined) {
			return;
		}
		let tileComp2 = tile2.getComponent(TileBase);

		this.tileArray[pos_1.x][pos_1.y] = tile2;
		this.tileArray[pos_2.x][pos_2.y] = tile1;

		tileComp1.setRow(pos_2.x);
		tileComp2.setRow(pos_1.x);

		tileComp1.setCol(pos_2.y);
		tileComp2.setCol(pos_1.y);

		this.node.emit('refresh', this.tileArray, this.statusArray);
	}

	setGoalCompleteEvent(goalId: string) {
		this.node.emit('goal_complete', goalId);
	}


    setGoalPossible(goalId: string) {
        if(goalId === 'coin') {
            return;
        }

        const tilesToRemove =
            LevelIdTranslator.getSpawnIdsForGoal(
                goalId,
                this.availableColors
            );

        const removeIds = new Set(
            tilesToRemove.filter(
                (id) => !this.availableColors.includes(id)
            )
        );

        if(removeIds.size === 0) {
            return;
        }

        for(let col = 0; col < this.spawnPools.length; col++) {

            const pool = this.spawnPools[col];

            if(!pool || pool.length === 0) {
                continue;
            }

            for(let i = pool.length - 1; i >= 0; i--) {

                const normalizedId =
                    LevelIdTranslator.translateId(pool[i]);

                if(removeIds.has(normalizedId)) {
                    pool.splice(i, 1);
                }
            }
        }

        console.log('[FIELD GOAL POSSIBLE]', {
            goalId,
            removedTypes: [...removeIds]
        });
    }


	removeStringFromArray(array: string[], target: string) {
		const index = array.indexOf(target);
		if (index !== -1) {
			array.splice(index, 1);
		}
	}

	shuffleTiles(): void {
		this.isClickAvailable = false;

		let tilesPositions = this.shuffleArray(
			this.getAllCommonTilesPositionsIgnoreStatus().concat(
				this.getAllBonusTilesPositions(),
			),
		);
		let swappedTiles = [];

		let swapsCount = 0;
		let stepTime = 0.05;
		for (let i = 0; i < tilesPositions.length; i++) {
			if (!swappedTiles.includes(tilesPositions[i])) {
				swappedTiles.push(tilesPositions[i]);
				let tileToSwap =
					tilesPositions[Math.floor(Math.random() * tilesPositions.length)];
				if (!swappedTiles.includes(tileToSwap)) {
					swappedTiles.push(tileToSwap);
					this.scheduleOnce(
						() => {
							this.swapTiles(tilesPositions[i], tileToSwap);
						},
						this.swapTime + stepTime * swapsCount,
					);
					swapsCount++;
				}
			}
		}

		this.scheduleOnce(
			() => {
				this.checkForPotentialBonuses();
			},
			this.swapTime + stepTime * (swapsCount + 1),
		);

		this.node.emit('shuffle');
	}

    private cancelWinScheduledCallbacks(): void {
        for(const callback of this.winScheduledCallbacks) {
            this.unschedule(callback);
        }

        this.winScheduledCallbacks = [];
    }

    private resetWinFlow(): void {
        this.cancelWinScheduledCallbacks();

        this.winSkipFinalized = false;
        this.winPlanReady = false;

        this.winPlannedPositions = [];
        this.winSpawnsDone = 0;
        this.winMovesConsumed = 0;
        this.winSkipRewardSnapshot = 0;
        this.winBonusActivationPlanned = false;
    }

    private scheduleWinCallback(callback: () => void, delay: number): void {
        const scheduledCallback = () => {
            if(this.winSkipFinalized) return;

            callback();
        };

        this.winScheduledCallbacks.push(scheduledCallback);
        this.scheduleOnce(scheduledCallback, delay);
    }

    private prepareWinPlan(): void {
        if(this.winPlanReady) return;

        const availableTiles = this.shuffleArray(
            this.getAllCommonTilesPositions()
        );

        const totalSpawns = Math.min(
            Math.max(0, this.levelCompletePoints),
            availableTiles.length
        );

        this.winPlannedPositions = availableTiles.slice(0, totalSpawns);

        let existingBonusGold = 0;

        for(let row = 0; row < this.numRows; row++) {
            for(let col = 0; col < this.numCols; col++) {
                const tile = this.tileArray[row]?.[col];

                if(!tile?.isValid) continue;

                const tileComp = tile.getComponent(TileBase);

                if(!tileComp?.isBonusTile()) continue;

                const tileType = tileComp.getTileType();

                if(tileType === 'rocket_horizontal' || tileType === 'rocket_vertical') {
                    existingBonusGold += 2;
                }
                else if(tileType === 'bomb') {
                    existingBonusGold += 3;
                }
                else if(this.availableColors.includes(tileType)) {
                    existingBonusGold += 5;
                }
            }
        }

        this.winSkipRewardSnapshot =
            existingBonusGold + this.winPlannedPositions.length * 2;

        this.winPlanReady = true;

        console.log('[WIN FLOW] Plan prepared', {
            moves: this.levelCompletePoints,
            rockets: this.winPlannedPositions.length,
            skipGold: this.winSkipRewardSnapshot
        });
    }

    setLevelAsCompleted(moves: number) {
        this.resetWinFlow();

        this.isLevelComplete = true;
        this.levelCompletePoints = moves;
    }


    completeLevel() {
        if(this.isCompleteScheduled || this.winSkipFinalized) return;

        this.prepareWinPlan();

        this.isCompleteScheduled = true;

        const timeBetweenLines = 0.2;
        const totalSpawns = this.winPlannedPositions.length;

        console.log('[WIN FLOW] Conversion started', {
            moves: this.levelCompletePoints,
            rockets: totalSpawns
        });

        const activatePoolWhenReady = (): void => {
            if(this.winSkipFinalized || this.winBonusActivationPlanned) return;
            if(this.winSpawnsDone !== totalSpawns) return;

            this.winBonusActivationPlanned = true;

            this.node.emit('win_conversion_finished');

            this.scheduleWinCallback(() => {
                console.log('[WIN FLOW] Activating bonus pool', {
                    rockets: this.winSpawnsDone,
                    poolSize: this.bonusPool.length
                });

                this.activateBonusPool();
            }, 0.35);
        };

        if(totalSpawns === 0) {
            this.node.emit('win_conversion_finished');

            this.scheduleWinCallback(() => {
                this.activateBonusPool();
            }, 0.2);

            return;
        }

        for(let i = 0; i < totalSpawns; i++) {
            this.scheduleWinCallback(() => {
                if(this.winSkipFinalized) return;

                const position = this.winPlannedPositions[i];
                if(!position) return;

                const row = position.x;
                const col = position.y;

                this.winMovesConsumed++;
                this.node.emit('move');

                const targetTile = this.tileArray[row]?.[col];

                const targetWorld = targetTile?.isValid
                    ? targetTile.worldPosition.clone()
                    : null;

                let rocketCreated = false;

                const spawnRocketOnReach = (): void => {
                    if(this.winSkipFinalized || rocketCreated) return;

                    rocketCreated = true;

                    const bonusId = Math.random() < 0.5
                        ? 'rocket_vertical'
                        : 'rocket_horizontal';

                    this.spawnBonusTile(row, col, bonusId, true);

                    this.winSpawnsDone++;

                    this.node.emit('coin_reward', row, col);

                    console.log('[WIN FLOW] Line reached target', {
                        row,
                        col,
                        spawned: this.winSpawnsDone,
                        total: totalSpawns
                    });

                    activatePoolWhenReady();
                };

                const request: WinRocketLineRequest = {
                    row,
                    col,
                    targetWorld,
                    handled: false,
                    onReach: spawnRocketOnReach
                };

                this.node.emit('win_rocket_line', request);

                if(!request.handled) {
                    spawnRocketOnReach();
                }

            }, timeBetweenLines * i);
        }
    }

    completeLevel_Skip() {
        if(this.winSkipFinalized || !this.isLevelComplete) return;

        this.prepareWinPlan();

        this.winSkipFinalized = true;

        this.cancelWinScheduledCallbacks();

        if(this.spawnTilesSchedule) {
            this.unschedule(this.spawnTilesSchedule);
            this.spawnTilesSchedule = null;
        }

        this.isSpawnScheduled = false;
        this.isCompleteScheduled = false;
        this.isClickAvailable = false;

        this.isBonusPoolActivated = false;
        this.bonusPool = [];
        this.bonusIndex = 0;

        this.activeDiscoballSequences.clear();
        this.shouldActivateBonusPoolAfterDiscoball = false;
        this.discoballPendingBlockingInaction = false;

        const remainingSpawns = Math.max(
            0,
            this.winPlannedPositions.length - this.winMovesConsumed
        );

        for(let i = 0; i < remainingSpawns; i++) {
            this.node.emit('move');
        }

        this.node.emit('complete', this.winSkipRewardSnapshot);
    }

	countBonusGold(): number {
		let bonusGold = 0;

		for (let row = 0; row < this.numRows; row++) {
			for (let col = 0; col < this.numCols; col++) {
				let tile = this.tileArray[row][col];
				if (tile !== null && tile !== undefined) {
					const tileComp = tile.getComponent(TileBase);
					if (tileComp.isBonusTile()) {
						const tileType = tileComp.getTileType();
						if (
							tileType === 'rocket_horizontal' ||
							tileType === 'rocket_vertical'
						) {
							bonusGold += 2;

							this.node.emit('destroy', tileType);
						} else if (tileType === 'bomb') {
							bonusGold += 3;
						} else if (this.availableColors.includes(tileType)) {
							bonusGold += 5;
						}
					}
				}
			}
		}

		return bonusGold;
	}


    shuffleArray<T>(array: T[]): T[] {
        let currentIndex = array.length;
        let randomIndex: number;

        while(currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex],
                array[currentIndex]
            ];
        }

        return array;
    }

	getDynamiteGoals(): GoalData[] {
		return this.dynamiteGoals;
	}

	getCosmorocketGoals(): GoalData[] {
		return this.cosmorocketGoals;
	}

	getStartSpawnPool(): string[] {
		return this.startPool;
	}

	getSpawnPools(): string[][] {
		return this.spawnPools;
	}

	getRocketPreset(): string {
		return this.rocketPreset;
	}

	moveNodeToIndex(node: Node, newIndex: number): void {
		const currentIndex: number = this.bonusPool.indexOf(node);

		if (currentIndex !== -1) {
			this.bonusPool.splice(currentIndex, 1);
			this.bonusPool.splice(newIndex, 0, node);
		} else {
			console.error('Node not found in the array');
		}
	}

	setSuperDiscoballMode(isActive: boolean) {
		this.isSuperDiscoballMode = isActive;
	}

	countAllTilesByType(typeToSearch: string) {
		let count = 0;

		let typesToSearch = [];

		if (this.isColoredType(typeToSearch) || typeToSearch === 'easteregg') {
			let baseType = typeToSearch.split('_')[0];

			for (let i = 0; i < this.availableColors.length; i++) {
				typesToSearch.push(baseType + '_' + this.availableColors[i]);
			}

			if (typeToSearch === 'easteregg') {
				typesToSearch.push(typeToSearch);
			}
		} else {
			typesToSearch.push(typeToSearch);
		}

		for (let k = 0; k < typesToSearch.length; k++) {
			for (let i = 0; i < this.numRows; i++) {
				for (let j = 0; j < this.numCols; j++) {
					const tile = this.tileArray[i][j];
					if (tile !== null) {
						const tileComp = tile.getComponent(TileBase);
						if (tileComp.getTileType() === typesToSearch[k]) {
							count++;
						}
					}
				}
			}
		}

		return count;
	}

	isColoredType(typeToSearch: string): boolean {
		for (let i = 0; i < this.availableColors.length; i++) {
			if (typeToSearch.includes(this.availableColors[i])) {
				return true;
			}
		}

		return false;
	}

	setPrimaryColors() {
		const counts = [];

		for (let color of this.availableColors) {
			let count = 0;

			for (let i = 0; i < this.numRows; i++) {
				for (let j = 0; j < this.numCols; j++) {
					const tile = this.tileArray[i][j];
					const status = this.statusArray[i][j];

					if (status) {
						const statusComp = status.getComponent(StatusBase);
						if (statusComp.isBlockingInteraction()) continue;
					}

					if (tile) {
						const tileComp = tile.getComponent(TileBase);
						if (tileComp.getTileType() === color) count++;
					}
				}
			}

			counts.push({ color, count });
		}

		counts.sort((a, b) => b.count - a.count);

		this.primaryColor = counts[0]?.color ?? null;
		this.secondaryColor = counts[1]?.color ?? null;

		this.setDiscoballsColors();
	}

	setDiscoballsColors() {
		for (let i = 0; i < this.numRows; i++) {
			for (let j = 0; j < this.numCols; j++) {
				const tile = this.tileArray[i][j];
				if (tile !== null && tile !== undefined) {
					const tileComp = tile.getComponent(TileBase);
					if (
						tileComp.getTileType() === 'multi' ||
						tileComp.getTileType() === 'super'
					) {
						tileComp.setColor(this.primaryColor, this.secondaryColor);
					}
				}
			}
		}
	}

	unloadAssets() {
		this.isAssetsLoaded = false;
		this.savedLevelData = null;

		/*this.tilePrefab = null;
        this.emptyPrefab = null;
        this.bombPrefab = null;
        this.rocketPrefab = null;
        this.discoballPrefab = null;*/

		this.specialPrefabs = [];
		this.statusPrefabs = [];
	}

	centrate() {
		this.node.emit('centrate', this.tileArray);
	}

	resetTutorial() {
		if (!this.isTutorialActive) {
			return;
		}

		this.isTutorialActive = false;
		this.tutorialKey = '';
		this.tutorialTiles = [];

		for (let i = 0; i < this.spawnedTutorialItems.length; i++) {
			this.spawnedTutorialItems[i].destroy();
		}

		this.spawnedTutorialItems = [];
	}

	getIsTutorialActive(): boolean {
		return this.isTutorialActive;
	}

	getTutorialKey(): string {
		return this.tutorialKey;
	}

	getTutorialTiles(): SpecialTileData[] {
		return this.tutorialTiles;
	}

	getTilesCountByType(t: string): number {
		let count = 0;

		for (let i = 0; i < this.numRows; i++) {
			for (let j = 0; j < this.numCols; j++) {
				const tile = this.tileArray[i][j];
				if (tile !== null) {
					const tileComp = tile.getComponent(TileBase);
					if (tileComp.isSpecialTile()) {
						let tileType = tileComp.getTileType();
						if (t === tileType) {
							count = count + 1;
						}
					}
				}
			}
		}

		return count;
	}


    private areTilesVisuallySettled(watchedBonus?: Node): boolean {
        if(watchedBonus?.isValid) {
            const bonusUi = watchedBonus.getComponent(UITile);

            if(bonusUi?.isVisualMoving()) {
                return false;
            }
        }

        for(const row of this.tileArray) {
            for(const tile of row) {
                if(!tile?.isValid) {
                    continue;
                }

                const tileComp = tile.getComponent(TileBase);

                if(!tileComp || !tileComp.isCommonTile()) {
                    continue;
                }

                const tileUi = tile.getComponent(UITile);

                if(tileUi?.isVisualMoving()) {
                    return false;
                }
            }
        }

        return true;
    }

    private waitForVisualFallEnd(
        onReady: () => void,
        watchedBonus?: Node,
        attempt: number = 0,
        stableChecks: number = 0
    ): void {
        if(!this.node.isValid || !this.node.activeInHierarchy) {
            return;
        }

        if(watchedBonus && !isValid(watchedBonus, true)) {
            console.warn('[FIELD FALL] Watched bonus destroyed');

            onReady();
            return;
        }

        const settled = this.areTilesVisuallySettled(watchedBonus);
        const nextStableChecks = settled ? stableChecks + 1 : 0;

        if(nextStableChecks >= 2) {
            console.log('[FIELD FALL SETTLED]', {
                waited: (attempt * 0.05).toFixed(2),
                bonus: watchedBonus?.name
            });

            onReady();
            return;
        }

        if(attempt >= 20) {
            console.warn('[FIELD FALL WAIT LIMIT]', {
                waited: '1.00s',
                settled,
                bonus: watchedBonus?.name
            });

            onReady();
            return;
        }

        this.scheduleOnce(() => {
            this.waitForVisualFallEnd(
                onReady,
                watchedBonus,
                attempt + 1,
                nextStableChecks
            );
        }, 0.05);
    }


    private followBonusSpawnVisual(
        bonusNode: Node,
        visualNode: Node | null,
        restoreAfterAppear: boolean = false
    ): void {

        const overlay = this.bonusSpawnOverlay;

        if(
            !bonusNode?.isValid ||
            !visualNode?.isValid ||
            !overlay?.isValid
        ) {
            return;
        }

        const originalParent = visualNode.parent;

        if(!originalParent?.isValid) return;

        const originalPosition = visualNode.position.clone();
        const originalRotation = visualNode.rotation.clone();
        const originalScale = visualNode.scale.clone();

        visualNode.setParent(overlay, true);
        visualNode.setSiblingIndex(overlay.children.length - 1);

        let hasSeenAppear = false;
        let elapsed = 0;

        const restore = () => {
            this.unschedule(updatePosition);

            if(!visualNode.isValid || !originalParent.isValid) {
                return;
            }

            if(visualNode.parent !== overlay) {
                return;
            }

            visualNode.setParent(originalParent);

            visualNode.setPosition(originalPosition);
            visualNode.setRotation(originalRotation);
            visualNode.setScale(originalScale);
        };

        const updatePosition = (dt: number) => {

            if(
                !bonusNode.isValid ||
                !visualNode.isValid ||
                !originalParent.isValid ||
                !overlay.isValid
            ) {
                this.unschedule(updatePosition);

                if(
                    visualNode.isValid &&
                    (!bonusNode.isValid || !originalParent.isValid)
                ) {
                    visualNode.destroy();
                }

                return;
            }

            if(visualNode.parent !== overlay) {
                this.unschedule(updatePosition);
                return;
            }

            const worldPosition = new Vec3();

            Vec3.transformMat4(
                worldPosition,
                originalPosition,
                originalParent.worldMatrix
            );

            visualNode.setWorldPosition(worldPosition);

            const worldRotation = new Quat();

            Quat.multiply(
                worldRotation,
                originalParent.worldRotation,
                originalRotation
            );

            visualNode.setWorldRotation(worldRotation);

            const parentScale = originalParent.worldScale;

            visualNode.setWorldScale(
                parentScale.x * originalScale.x,
                parentScale.y * originalScale.y,
                parentScale.z * originalScale.z
            );

            if (restoreAfterAppear) {
                const skeleton = visualNode.getComponent(sp.Skeleton);
                const currentAnimation =
                    skeleton?.getCurrent(0)?.animation?.name ?? '';

                if (currentAnimation === 'appiert') {
                    hasSeenAppear = true;
                }

                if (hasSeenAppear && currentAnimation === 'idle') {
                    restore();
                    return;
                }

                elapsed += dt;

                if (elapsed >= 3) {
                    console.warn('[BONUS SPAWN] Overlay restore fallback', {
                        bonus: bonusNode.name,
                        animation: currentAnimation,
                        hasSeenAppear,
                        elapsed
                    });

                    restore();
                    return;
                }
            }
        };

        this.schedule(updatePosition, 0);
        updatePosition(0);
    }
}
