declare const gamepush: any;

import { _decorator, Component, Node, Vec2, sys } from 'cc';
import { UserData } from './UserData';
import {
	GameData,
	LevelData,
	LevelProgressData,
	SpecialTileData,
	SpecialTileStateData,
} from './GameData';
import { SpecTileBase } from '../game/spec_tiles/SpecTileBase';
import { Statistics } from './Statistics';

import { Field } from '../game/Field';
import { Level } from '../game/Level';
import { TileBase } from '../game/TileBase';
import { Chest } from '../game/Chest';

import { MovesShop } from '../game/boosters/MovesShop';
import { StartBonuses } from '../game/boosters/StartBonuses';
import { ButlersGift } from '../game/boosters/ButlersGift';

import { EventBase } from '../game/events/EventBase';
import { StatusBase } from '../game/statuses/StatusBase';
import { AudioController } from '../utils/AudioController';
import { DebugGold } from './DebugGold';
const { ccclass, property } = _decorator;

@ccclass('SaveData')
export class SaveData extends Component {
	@property(Node)
	field: Node = null;
	@property(Node)
	level: Node = null;
	@property(Node)
	startBonuses: Node = null;
	@property(Node)
	butlersGift: Node = null;
	@property(Node)
	movesShop: Node = null;
	@property(Node)
	chest: Node = null;
	@property(Node)
	statistics: Node = null;

	@property([Node])
	events: Node[] = [];

	public static instance: SaveData = null;

	onLoad() {
		SaveData.instance = this;
		console.log(`[STARTUP +${performance.now().toFixed(0)}ms] SaveData onLoad`);
	}

	//UserData
	saveUserData() {
		let userData = {
			progress: UserData.instance.getProgress(),
			gold: UserData.instance.getResource('gold'),
			stars: UserData.instance.getResource('stars'),

			bomb: UserData.instance.getResource('bomb'),
			rocket: UserData.instance.getResource('rocket'),
			discoball: UserData.instance.getResource('discoball'),

			hammer: UserData.instance.getResource('hammer'),
			bow: UserData.instance.getResource('bow'),
			cannon: UserData.instance.getResource('cannon'),
			jester: UserData.instance.getResource('jester'),

			energyAskTimestamp: UserData.instance.getEnergyAskTimestamp(),

			friendsList: UserData.instance.getFriendsList(),
			kingLeagueProgress: UserData.instance.getKingLeagueProgress(),

			isPremium: UserData.instance.getIsPremium(),

			musicVolume: UserData.instance.getMusicVolume(),
			sfxVolume: UserData.instance.getSfxVolume(),
			lastMusicVolume: UserData.instance.getLastMusicVolume(),
			lastSfxVolume: UserData.instance.getLastSfxVolume(),

			helpedMessages: UserData.instance.getHelpedMessages(),

			currentLevelFails: UserData.instance.getLevelFails(),
		};

		sys.localStorage.setItem('userData', JSON.stringify(userData));
	}

	async loadUserData() {
		const loadStartedAt = performance.now();
		console.log(
			`[STARTUP +${performance.now().toFixed(0)}ms] User data load started`,
		);

		const localStartedAt = performance.now();
		var userData = JSON.parse(sys.localStorage.getItem('userData'));
		console.log(
			`[STARTUP +${performance.now().toFixed(0)}ms] Local user data read finished (${(performance.now() - localStartedAt).toFixed(0)}ms), found: ${Boolean(userData)}`,
		);

		const gpStartedAt = performance.now();
		console.log(
			`[STARTUP +${performance.now().toFixed(0)}ms] GamePush player data apply started`,
		);

		UserData.instance.setProgress(gamepush.player.get('score'));
		UserData.instance.setIsPremium(gamepush.player.get('ispremium'));
		UserData.instance.setKingLeagueProgress(
			gamepush.player.get('score_king_league'),
		);
		UserData.instance.setSuperDiscoballProgress(
			gamepush.player.get('superdisco_progress'),
		);
		UserData.instance.setIsSuperDiscoballActive(
			gamepush.player.get('is_superdisco_active'),
		);

		UserData.instance.setResource('gold', gamepush.player.get('gold'));

		UserData.instance.setResource('bomb', gamepush.player.get('bomb'));
		UserData.instance.setResource('rocket', gamepush.player.get('rocket'));
		UserData.instance.setResource(
			'discoball',
			gamepush.player.get('discoball'),
		);

		UserData.instance.setResource('hammer', gamepush.player.get('hammer'));
		UserData.instance.setResource('bow', gamepush.player.get('bow'));
		UserData.instance.setResource('cannon', gamepush.player.get('cannon'));
		UserData.instance.setResource('jester', gamepush.player.get('jester'));

		console.log(
			`[STARTUP +${performance.now().toFixed(0)}ms] GamePush player data apply finished (${(performance.now() - gpStartedAt).toFixed(0)}ms), progress: ${UserData.instance.getProgress()}`,
		);

		if (userData) {
			console.log(
				`[STARTUP +${performance.now().toFixed(0)}ms] Local user data apply started`,
			);
			//UserData.instance.setProgress(gamepush.player.get('score'));
			//UserData.instance.setResource("gold", userData.gold);
			if (userData.stars) {
				UserData.instance.setResource('stars', userData.stars);
			}

			//UserData.instance.setResource("bomb", userData.bomb);
			//UserData.instance.setResource("rocket", userData.rocket);
			//UserData.instance.setResource("discoball", userData.discoball);

			//UserData.instance.setResource("hammer", userData.hammer);
			//UserData.instance.setResource("bow", userData.bow);
			//UserData.instance.setResource("cannon", userData.cannon);
			//UserData.instance.setResource("jester", userData.jester);

			UserData.instance.setEnergyAskTimestamp(userData.energyAskTimestamp);

			UserData.instance.setFriendsList(userData.friendsList);
			//UserData.instance.setKingLeagueProgress(gamepush.player.get('score_king_league'));

			if (userData.isPremium !== undefined) {
				//UserData.instance.setIsPremium(gamepush.player.get('ispremium'));
			}

			if (userData.musicVolume !== undefined) {
				UserData.instance.setMusicVolume(userData.musicVolume);
			}
			if (userData.sfxVolume !== undefined) {
				UserData.instance.setSfxVolume(userData.sfxVolume);
			}
			if (userData.lastMusicVolume !== undefined) {
				UserData.instance.setLastMusicVolume(userData.lastMusicVolume);
			}
			if (userData.lastSfxVolume !== undefined) {
				UserData.instance.setLastSfxVolume(userData.lastSfxVolume);
			}
			if (userData.helpedMessages !== undefined) {
				UserData.instance.setHelpedMessages(userData.helpedMessages);
			}
			if (userData.currentLevelFails !== undefined) {
				UserData.instance.setLevelFails(userData.currentLevelFails);
			}

			AudioController.instance.setMusicVolume(
				UserData.instance.getMusicVolume(),
			);
			AudioController.instance.setSfxVolume(UserData.instance.getSfxVolume());
			console.log(
				`[STARTUP +${performance.now().toFixed(0)}ms] Local user data apply finished`,
			);
		}
		/*else {
            UserData.instance.setProgress(gamepush.player.get('score'));
            UserData.instance.setKingLeagueProgress(gamepush.player.get('score_king_league'));
        }*/

		const debugGoldStartedAt = performance.now();
		console.log(
			`[STARTUP +${performance.now().toFixed(0)}ms] DebugGold restore check started`,
		);
		await DebugGold.restoreIfInterrupted();
		console.log(
			`[STARTUP +${performance.now().toFixed(0)}ms] DebugGold restore check finished (${(performance.now() - debugGoldStartedAt).toFixed(0)}ms)`,
		);

		console.log(
			`[STARTUP +${performance.now().toFixed(0)}ms] User data loaded (${(performance.now() - loadStartedAt).toFixed(0)}ms total)`,
		);
		console.log(
			`[STARTUP +${performance.now().toFixed(0)}ms] Emitting user_data`,
		);
		this.node.emit('user_data');
	}

	clearUserData() {
		sys.localStorage.removeItem('userData');

		sys.localStorage.removeItem('levelProgress');
		sys.localStorage.removeItem('statistics');
		sys.localStorage.removeItem('startBonuses');
		sys.localStorage.removeItem('butlersGift');
		sys.localStorage.removeItem('chest');

		for (let i = 0; i < this.events.length; i++) {
			let eventComp = this.events[i].getComponent(EventBase);

			sys.localStorage.removeItem('event_' + eventComp.getEventId());
		}

		gamepush.player.set('score', 0); //599 for last
		gamepush.player.set('score_king_league', 0);

		gamepush.player.sync();
	}

	clearEventSave(eventId: string) {
		sys.localStorage.removeItem('event_' + eventId);
	}

	cheatToLastLevel() {
		gamepush.player.set('score', 700);
		gamepush.player.set('score_king_league', 0);

		gamepush.player.sync();
	}

	//Level Progress Data
	saveLevelProgressData() {
		let levelProgressData = new LevelProgressData();
		let levelState = new LevelData();

		let fieldComp = this.field.getComponent(Field);
		let levelComp = this.level.getComponent(Level);
		let movesShopComp = this.movesShop.getComponent(MovesShop);

		levelState.emptyTiles = this.getEmptyTilesData(fieldComp.getTilesArray());
		levelState.specialTiles = this.getTilesData(fieldComp.getTilesArray());
		levelState.statuses = this.getStatusData(fieldComp.getStatusArray());
		levelState.destroyedOnStart = this.getDestroyedTilesData(
			fieldComp.getTilesArray(),
		);
		levelState.specsState = this.getSpecTilesStateData(
			fieldComp.getTilesArray(),
		);
		levelState.statusesState = this.getStatusesStateData(
			fieldComp.getStatusArray(),
		);

		levelState.startPool = fieldComp.getStartSpawnPool();
		levelState.spawnPools = fieldComp.getSpawnPools();
		levelState.rocketPreset = fieldComp.getRocketPreset();
		levelState.dynamiteGoals = fieldComp.getDynamiteGoals();
		levelState.cosmorocketGoals = fieldComp.getCosmorocketGoals();

		levelState.goals = levelComp.getGoals();
		levelState.movesCount = levelComp.getMoves();
		levelState.difficulty = levelComp.getDifficulty();
		levelState.movesShopStage = movesShopComp.getCurrentStage();

		if (fieldComp.getIsTutorialActive()) {
			levelState.tutorial = fieldComp.getTutorialKey();
			levelState.tutorialTiles = fieldComp.getTutorialTiles();
		}

		levelProgressData.levelState = levelState.toJSON();

		sys.localStorage.setItem(
			'levelProgress',
			JSON.stringify(levelProgressData),
		);
	}

	loadLevelProgressData() {
		const loadStartedAt = performance.now();
		console.log(
			`[STARTUP +${performance.now().toFixed(0)}ms] Level progress load started`,
		);

		const storageStartedAt = performance.now();
		const rawLevelProgressData = sys.localStorage.getItem('levelProgress');
		console.log(
			`[STARTUP +${performance.now().toFixed(0)}ms] Level progress localStorage read finished (${(performance.now() - storageStartedAt).toFixed(0)}ms), found: ${Boolean(rawLevelProgressData)}`,
		);

		const parseStartedAt = performance.now();
		var levelProgressData = JSON.parse(rawLevelProgressData);
		console.log(
			`[STARTUP +${performance.now().toFixed(0)}ms] Level progress JSON parse finished (${(performance.now() - parseStartedAt).toFixed(0)}ms)`,
		);

		if (levelProgressData) {
			if (levelProgressData.levelState) {
				console.log(
					`[STARTUP +${performance.now().toFixed(0)}ms] Saved gameplay session found`,
				);

				const levelStateStartedAt = performance.now();
				const levelState = LevelData.fromJSON(levelProgressData.levelState);
				console.log(
					`[STARTUP +${performance.now().toFixed(0)}ms] Saved level state parsed (${(performance.now() - levelStateStartedAt).toFixed(0)}ms)`,
				);

				console.log(
					`[STARTUP +${performance.now().toFixed(0)}ms] Emitting level_progress_loaded (${(performance.now() - loadStartedAt).toFixed(0)}ms after level progress load start)`,
				);
				this.node.emit('level_progress_loaded', levelState);
			} else {
				console.log(
					`[STARTUP +${performance.now().toFixed(0)}ms] Level progress exists without saved level state`,
				);
				console.log(
					`[STARTUP +${performance.now().toFixed(0)}ms] Emitting level_progress_checked`,
				);
				this.node.emit('level_progress_checked');
			}
		} else {
			console.log('No saved level progress data found');
			console.log(
				`[STARTUP +${performance.now().toFixed(0)}ms] No saved gameplay session`,
			);
			console.log(
				`[STARTUP +${performance.now().toFixed(0)}ms] Emitting level_progress_checked`,
			);
			this.node.emit('level_progress_checked');
		}
	}

	clearLevelProgress() {
		sys.localStorage.removeItem('levelProgress');
		sys.localStorage.removeItem('statistics');
	}

	getTilesData(tiles: Node[][]): SpecialTileData[] {
		let tilesData = [];

		const numRows: number = tiles.length;
		const numCols: number = tiles.length > 0 ? tiles[0].length : 0;

		for (let i = 0; i < numRows; i++) {
			for (let j = 0; j < numCols; j++) {
				if (tiles[i][j] !== null) {
					let tileComp = tiles[i][j].getComponent(TileBase);
					if (
						tileComp.isCommonTile() ||
						tileComp.isBonusTile() ||
						tileComp.isSpecialTile()
					) {
						let specData = new SpecialTileData();
						specData.id = tileComp.getTileType();
						specData.row = tileComp.getRow();
						specData.col = tileComp.getCol();

						if (tilesData.indexOf(specData) === -1) {
							tilesData.push(specData);
						}
					}
				}
			}
		}

		return tilesData;
	}

	getDestroyedTilesData(tiles: Node[][]): Vec2[] {
		let tilesData = [];

		const numRows: number = tiles.length;
		const numCols: number = tiles.length > 0 ? tiles[0].length : 0;

		for (let i = 0; i < numRows; i++) {
			for (let j = 0; j < numCols; j++) {
				if (tiles[i][j] === null) {
					tilesData.push(new Vec2(j, i));
				}
			}
		}

		return tilesData;
	}

	getEmptyTilesData(tiles: Node[][]): Vec2[] {
		let tilesData = [];

		const numRows: number = tiles.length;
		const numCols: number = tiles.length > 0 ? tiles[0].length : 0;

		for (let i = 0; i < numRows; i++) {
			for (let j = 0; j < numCols; j++) {
				if (tiles[i][j] !== null) {
					let tileComp = tiles[i][j].getComponent(TileBase);
					if (tileComp.isEmptyTile()) {
						tilesData.push(new Vec2(j, i));
					}
				}
			}
		}

		return tilesData;
	}

	getStatusData(tiles: Node[][]): SpecialTileData[] {
		let tilesData = [];

		const numRows: number = tiles.length;
		const numCols: number = tiles.length > 0 ? tiles[0].length : 0;

		for (let i = 0; i < numRows; i++) {
			for (let j = 0; j < numCols; j++) {
				if (tiles[i][j] !== null) {
					let statusComp = tiles[i][j].getComponent(StatusBase);

					let specData = new SpecialTileData();
					specData.id = statusComp.getStatusType();
					specData.row = statusComp.getRow();
					specData.col = statusComp.getCol();

					if (tilesData.indexOf(specData) === -1) {
						tilesData.push(specData);
					}
				}
			}
		}

		return tilesData;
	}

	getSpecTilesStateData(tiles: Node[][]): SpecialTileStateData[] {
		const tilesData: SpecialTileStateData[] = [];

		const numRows: number = tiles.length;
		const numCols: number = tiles.length > 0 ? tiles[0].length : 0;

		for (let i = 0; i < numRows; i++) {
			for (let j = 0; j < numCols; j++) {
				if (tiles[i][j] === null) {
					continue;
				}

				const tileComp = tiles[i][j].getComponent(SpecTileBase);

				if (!tileComp) {
					continue;
				}

				const specData = new SpecialTileStateData();

				specData.row = tileComp.getRow();
				specData.col = tileComp.getCol();
				specData.strength = tileComp.getStrength();

				specData.strengthRed = tileComp.getStrengthRed();
				specData.strengthBlue = tileComp.getStrengthBlue();
				specData.strengthGreen = tileComp.getStrengthGreen();
				specData.strengthYellow = tileComp.getStrengthYellow();
				specData.strengthPurple = tileComp.getStrengthPurple();

				specData.customParameter = tileComp.getCustomParameter();

				tilesData.push(specData);
			}
		}

		return tilesData;
	}

	getStatusesStateData(statuses: Node[][]): SpecialTileStateData[] {
		let tilesData = [];

		const numRows: number = statuses.length;
		const numCols: number = statuses.length > 0 ? statuses[0].length : 0;

		for (let i = 0; i < numRows; i++) {
			for (let j = 0; j < numCols; j++) {
				if (statuses[i][j] !== null) {
					let statusComp = statuses[i][j].getComponent(StatusBase);

					let specData = new SpecialTileStateData();
					specData.row = statusComp.getRow();
					specData.col = statusComp.getCol();

					specData.customParameter = statusComp.getCustomParameter();

					tilesData.push(specData);
				}
			}
		}

		return tilesData;
	}

	//Start Bonuses
	saveStartBonusesData() {
		let startBonusesComp = this.startBonuses.getComponent(StartBonuses);

		let startBonusesData = {
			bonuses: startBonusesComp.getStartBonusPool(),
		};

		sys.localStorage.setItem('startBonuses', JSON.stringify(startBonusesData));
	}

	loadStartBonusesData() {
		const startedAt = performance.now();
		console.log(
			`[STARTUP +${performance.now().toFixed(0)}ms] Start bonuses load started`,
		);
		var startBonusesData = JSON.parse(sys.localStorage.getItem('startBonuses'));

		if (startBonusesData) {
			let startBonusesComp = this.startBonuses.getComponent(StartBonuses);
			startBonusesComp.setStartBonusPool(startBonusesData.bonuses);
		} else {
			//console.log("No saved start bonuses data found");
		}
		console.log(
			`[STARTUP +${performance.now().toFixed(0)}ms] Start bonuses load finished (${(performance.now() - startedAt).toFixed(0)}ms), found: ${Boolean(startBonusesData)}`,
		);
	}

	//Butler's Gift
	saveButlersGiftData() {
		let butlersGiftComp = this.butlersGift.getComponent(ButlersGift);

		let butlersGiftData = {
			streak: butlersGiftComp.getStreak(),
			isGifted: butlersGiftComp.getIsGifted(),
		};

		sys.localStorage.setItem('butlersGift', JSON.stringify(butlersGiftData));
	}

	loadButlersGiftData() {
		const startedAt = performance.now();
		console.log(
			`[STARTUP +${performance.now().toFixed(0)}ms] Butler's Gift load started`,
		);
		var butlersGiftData = JSON.parse(sys.localStorage.getItem('butlersGift'));

		if (butlersGiftData) {
			let butlersGiftComp = this.butlersGift.getComponent(ButlersGift);
			butlersGiftComp.setStreak(butlersGiftData.streak);
			butlersGiftComp.setIsGifted(butlersGiftData.isGifted);
		} else {
			//console.log("No saved butlers gift data found");
		}
		console.log(
			`[STARTUP +${performance.now().toFixed(0)}ms] Butler's Gift load finished (${(performance.now() - startedAt).toFixed(0)}ms), found: ${Boolean(butlersGiftData)}`,
		);
	}

	//Chest
	saveChest() {
		let chestComp = this.chest.getComponent(Chest);

		let chestData = {
			stage: chestComp.getStage(),
			//collectables: chestComp.getCollectables()
			pickedRewards: chestComp.getPickedRewards(),
		};

		sys.localStorage.setItem('chest', JSON.stringify(chestData));
	}

	loadChest() {
		const startedAt = performance.now();
		console.log(
			`[STARTUP +${performance.now().toFixed(0)}ms] Chest data load started`,
		);
		var chestData = JSON.parse(sys.localStorage.getItem('chest'));

		if (chestData) {
			let chestComp = this.chest.getComponent(Chest);
			chestComp.setStage(chestData.stage);
			//chestComp.setCollectables(chestData.collectables);
			chestComp.setPickedRewards(chestData.pickedRewards);
		} else {
			//console.log("No saved start bonuses data found");
		}
		console.log(
			`[STARTUP +${performance.now().toFixed(0)}ms] Chest data load finished (${(performance.now() - startedAt).toFixed(0)}ms), found: ${Boolean(chestData)}`,
		);
	}

	//Statistics Data
	saveStatistics() {
		let statisticsComp = this.statistics.getComponent(Statistics);

		let statistics = {
			levelsStats: statisticsComp.getLevelsStats(),
		};

		try {
			sys.localStorage.setItem('statistics', JSON.stringify(statistics));
		} catch (error) {
			console.error('Error saving statistics:', error);
		}
	}

	loadStatistics() {
		const startedAt = performance.now();
		console.log(
			`[STARTUP +${performance.now().toFixed(0)}ms] Saved statistics load started`,
		);
		try {
			var statistics = JSON.parse(sys.localStorage.getItem('statistics'));

			if (statistics && statistics.levelsStats) {
				let statisticsComp = this.statistics.getComponent(Statistics);

				for (let i = 0; i < statistics.levelsStats.length; i++) {
					statisticsComp.updateLevelStat(statistics.levelsStats[i]);
				}
			} else {
				//console.log("No stats data found");
			}
		} catch (error) {
			console.error('Error loading statistics:', error);
		}
		console.log(
			`[STARTUP +${performance.now().toFixed(0)}ms] Saved statistics load finished (${(performance.now() - startedAt).toFixed(0)}ms)`,
		);
	}

	//Events
	saveEvent(eventId: string) {
		for (let i = 0; i < this.events.length; i++) {
			let eventComp = this.events[i].getComponent(EventBase);

			if (eventComp.getEventId() === eventId) {
				let eventData = {
					isStarted: eventComp.getIsStarted(),
					lastAttemptTimestamp: eventComp.getLastTimestamp(),
					currentStage: eventComp.getCurrentStage(),
					isComplete: eventComp.getIsComplete(),
					collectable: eventComp.getCollectable(),
					currentLevel: eventComp.getCurrentLevel(),
					hp: eventComp.getHp(),
					specialPool: eventComp.getSpecialPool(),
					specialPredictions: eventComp.getSpecialPredictions(),
					specialHints: eventComp.getSpecialHints(),
					multiplayerChannel: eventComp.getMultiplayerChannel(),
					isTutorialComplete: eventComp.getIsTutorialComplete(),
					lastMpChannel: eventComp.getLastMultiplayerChannel(),
					playerPlace: eventComp.getPlayerPlace(),

					collections: eventComp.getCompletedCollections(),
					isTotalRewardPicked: eventComp.getIsTotalRewardTaken(),
					takenRewards: eventComp.getTakenRewards(),
					takenRewards_Premium: eventComp.getTakenRewards_Premium(),
					isRewardPicked: eventComp.getIsRewardPicked(),
					unpickedRewards: eventComp.getUnpickedRewards(),

					bots: eventComp.getBots(),

					bonusBank: eventComp.getBonusBank(),
				};

				try {
					sys.localStorage.setItem(
						'event_' + eventComp.getEventId(),
						JSON.stringify(eventData),
					);
				} catch (error) {
					console.error(
						'Error saving event ' + eventComp.getEventId() + ': ',
						error,
					);
				}
			}
		}
	}

	loadEvent(eventId: string) {
		const startedAt = performance.now();
		console.log(
			`[PRELOAD +${performance.now().toFixed(0)}ms] Event data load started: ${eventId}`,
		);
		console.log('Loading Event Data: ' + eventId);

		for (let i = 0; i < this.events.length; i++) {
			let eventComp = this.events[i].getComponent(EventBase);

			if (eventComp.getEventId() === eventId) {
				try {
					var eventData = JSON.parse(
						sys.localStorage.getItem('event_' + eventComp.getEventId()),
					);

					if (eventData) {
						eventComp.setIsStarted(eventData.isStarted);
						eventComp.setCurrentStage(eventData.currentStage);
						eventComp.setIsComplete(eventData.isComplete);
						eventComp.setCollectable(eventData.collectable);
						eventComp.setCurrentLevel(eventData.currentLevel);
						eventComp.setHp(eventData.hp);
						eventComp.setSpecialPool(eventData.specialPool);
						eventComp.setSpecialPredictions(eventData.specialPredictions);
						eventComp.setSpecialHints(eventData.specialHints);

						eventComp.setMultiplayerChannel(eventData.multiplayerChannel);

						eventComp.setIsTutorialComplete(eventData.isTutorialComplete);

						eventComp.setLastMultiplayerChannel(eventData.lastMpChannel);

						eventComp.setPlayerPlace(eventData.playerPlace);

						if (eventData.completedCollections !== undefined) {
							eventComp.setCompletedCollections(eventData.completedCollections);
						}
						if (eventData.isTotalRewardPicked !== undefined) {
							eventComp.setIsTotalRewardTaken(eventData.isTotalRewardPicked);
						}
						if (eventData.takenRewards !== undefined) {
							eventComp.setTakenRewards(eventData.takenRewards);
						}
						if (eventData.takenRewards_Premium !== undefined) {
							eventComp.setTakenRewards_Premium(eventData.takenRewards_Premium);
						}
						if (eventData.isRewardPicked !== undefined) {
							eventComp.setIsRewardPicked(eventData.isRewardPicked);
						}
						if (eventData.unpickedRewards !== undefined) {
							eventComp.setUnpickedRewards(eventData.unpickedRewards);
						}
						if (eventData.bots !== undefined) {
							eventComp.setBots(eventData.bots);
						}
						if (eventData.bonusBank !== undefined) {
							eventComp.setBonusBank(eventData.bonusBank);
						}

						//eventComp.loadInventoryFromGP();

						if (eventId !== 'battlepass' && eventId !== 'collection') {
							eventComp.setLastTimestamp(eventData.lastAttemptTimestamp); //always last
						}
					} else {
						//console.log("No event " + eventComp.getEventId() + " data found");
					}
				} catch (error) {
					console.error(
						'Error loading event ' + eventComp.getEventId() + ': ',
						error,
					);
				}

				eventComp.loadInventoryFromGP();

				if (eventId === 'collection') {
					console.log('collection timestamp load');
					eventComp.setLastTimestamp(
						gamepush.player.get('timestamp_collection'),
					);
				} else if (eventId === 'battlepass') {
					console.log('battlepass timestamp load');
					eventComp.setLastTimestamp(
						gamepush.player.get('timestamp_battlepass'),
					);
				}
			}
		}
		console.log(
			`[PRELOAD +${performance.now().toFixed(0)}ms] Event data load finished: ${eventId} (${(performance.now() - startedAt).toFixed(0)}ms)`,
		);
	}
}
