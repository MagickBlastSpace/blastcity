declare const gamepush: any;

import { _decorator, Component, Node } from 'cc';
import { GameData } from './GameData';
import { SaveData } from './SaveData';
import { CollectionEvent } from '../game/events/special/CollectionEvent';
import { PlayerEventData } from './EventData';
import { Net } from '../net/Net';
import { Localization } from '../utils/Localization';
import { Clans } from '../game/Clans';
import { CollectionCardData, CollectionCardSenderData } from './CollectionData';
import { Field } from '../game/Field';
const { ccclass, property } = _decorator;

@ccclass('UserData')
export class UserData extends Component {
	private playerName: string = '';
	private clanName: string = '';
	private playerId: number = 0;
	private registerDate: string = '';

	private currentProgress: number = 0;
	private levelsCount: number = 0;

	private kingLeagueProgress: number = 0;

	private Gold: number = 0;
	private Stars: number = 0;

	private StartBombs: number = 0;
	private StartRockets: number = 0;
	private StartDiscoballs: number = 0;

	private Hammers: number = 0;
	private Bows: number = 0;
	private Cannons: number = 0;
	private Jesters: number = 0;

	private Bombs_EndTime: Date;
	private Rockets_EndTime: Date;
	private Discoballs_EndTime: Date;

	private EndlessLives_EndTime: Date;
	private Modifier_x2_EndTime: Date;

	private energyAskTimestamp: number = 0;
	private energyAskDelay_Hours: number = 4;

	private energyMax_Free: number = 5;
	private energyMax_Premium: number = 8;

	private friendsList: number[] = [];
	private friendsRequests: number[] = [];

	private overMaxEnergy: number = 15;

	public static instance: UserData = null;

	private isDev: boolean = false;
	private isAphrodite: boolean = true;

	private isPremium: boolean = false;

	private musicVolume: number = 0;
	private sfxVolume: number = 0;

	private lastMusicVolume: number = 0;
	private lastSfxVolume: number = 0;

	private helpedMessages: number[] = [];
	private maxMessagesStorage: number = 50;

	private currentLevelFails: number = 0;

	private superDiscoballProgress: number = 0;
	private superDiscoballProgress_Max: number = 10;
	private superDiscoballLevel_Threshold: number = 293;
	private isSuperDiscoballActive: boolean = false;

	@property(CollectionEvent)
	collections: CollectionEvent;
	@property(Clans)
	clans: Clans;

	@property(Field)
	game: Field;

	@property([PlayerEventData])
	players: PlayerEventData[] = [];

	@property([CollectionCardSenderData])
	recievedCards: CollectionCardSenderData[] = [];

	onLoad() {
		UserData.instance = this;
	}

	async start() {
		this.currentProgress = 0;
		this.kingLeagueProgress = 0;

		this.Gold = 5000;
		this.Stars = 0;

		this.currentLevelFails = 0;

		this.musicVolume = 1;
		this.sfxVolume = 1;

		const now = new Date();
		this.Bombs_EndTime = new Date(now);
		this.Rockets_EndTime = new Date(now);
		this.Discoballs_EndTime = new Date(now);
		this.EndlessLives_EndTime = new Date(now);
		this.Modifier_x2_EndTime = new Date(now);
		this.energyAskTimestamp = 0;
		this.friendsList = [];

		gamepush.player.set('energy:max', this.energyMax_Free);

		await SaveData.instance.loadUserData();

		this.node.emit('resources_update', this.Gold, this.Stars);

		if (gamepush.player.get('registration_date') === '') {
			console.log('register date init: ');

			const now = new Date();
			const month = (now.getMonth() + 1).toString().padStart(2, '0');
			const year = now.getFullYear().toString();

			const formattedDate = `${month}/${year}`;
			this.registerDate = formattedDate;

			gamepush.player.set('registration_date', this.registerDate);
			gamepush.player.sync();
		} else {
			console.log('register date load: ');

			this.registerDate = gamepush.player.get('registration_date');
		}

		console.log('register date: ' + this.registerDate);

		if (gamepush.player.name === '') {
			this.playerName = 'Player' + gamepush.player.id;

			gamepush.player.set('name', this.playerName);
			gamepush.player.sync();
		} else {
			this.playerName = gamepush.player.name;
		}

		this.playerId = gamepush.player.id;

		console.log('Logged as: ' + this.playerName);

		gamepush.channels.on('event:message', (message) => {
			if (message.target === 'PERSONAL' && message.tags.includes('energy')) {
				this.addResource('energy', 1);

				gamepush.player.add('stat_energy_recieved', 1);
				gamepush.player.sync();

				gamepush.channels.deleteMessage({ messageId: message.id });
			} else if (
				message.target === 'PERSONAL' &&
				message.tags.includes('endless_lives_minutes_15')
			) {
				this.addResource('endless_lives_minutes', 15);

				gamepush.channels.deleteMessage({ messageId: message.id });
			} else if (
				message.target === 'PERSONAL' &&
				message.tags.includes('endless_lives_minutes_30')
			) {
				this.addResource('endless_lives_minutes', 30);

				gamepush.channels.deleteMessage({ messageId: message.id });
			} else if (
				message.target === 'PERSONAL' &&
				message.tags.includes('endless_lives_minutes_60')
			) {
				this.addResource('endless_lives_minutes', 60);

				gamepush.channels.deleteMessage({ messageId: message.id });
			}
		});

		gamepush.channels.on('event:message', (message) => {
			if (
				message.target === 'PERSONAL' &&
				message.tags.includes('collection_card')
			) {
				let newCards = [];
				newCards.push(message.text);

				console.log('Collection card accepted: ' + message.text);

				this.collections.applyNewCards(newCards);

				let recieveData = new CollectionCardSenderData();
				recieveData.id = message.text;
				recieveData.playerId = message.authorId;

				this.recievedCards.push(recieveData);

				gamepush.channels.deleteMessage({ messageId: message.id });
			}
		});

		gamepush.channels.on('event:message', (message) => {
			if (message.target === 'FEED' && message.tags.includes('friend_accept')) {
				this.addFriend(message.player.id);
				this.removeFriendRequest(message.player.id);

				gamepush.channels.deleteMessage({ messageId: message.id });
			}
		});

		gamepush.channels.on('event:message', (message) => {
			if (message.target === 'FEED' && message.tags.includes('friend_reject')) {
				this.removeFriendRequest(message.player.id);

				gamepush.channels.deleteMessage({ messageId: message.id });
			}
		});

		gamepush.channels.on('event:message', (message) => {
			if (message.target === 'FEED' && message.tags.includes('friend_remove')) {
				this.removeFriendRequest(message.player.id);
				this.removeFriend(message.player.id);

				gamepush.channels.deleteMessage({ messageId: message.id });
			}
		});

		this.checkForItemsFromFriends();
		this.checkForFriendsAccepts();
		this.checkForFriendsRejects();
		this.checkForFriendsRemoves();

		this.fetchAndSavePlayers();
	}

	addProgress() {
		if (this.currentProgress < GameData.instance.getMaxProgress()) {
			this.currentProgress++;

			if (this.isSuperdiscoballAvailable() && !this.isSuperDiscoballActive) {
				this.superDiscoballProgress++;

				if (this.superDiscoballProgress >= this.superDiscoballProgress_Max) {
					this.isSuperDiscoballActive = true;

					this.superDiscoballProgress = 0;
				}
			}

			SaveData.instance.saveUserData();

			gamepush.player.set('score', this.currentProgress);
			gamepush.player.set('superdisco_progress', this.superDiscoballProgress);
			gamepush.player.set('is_superdisco_active', this.isSuperDiscoballActive);
			gamepush.player.sync();

			GameData.instance.updateLevelStage();
		} else {
			this.kingLeagueProgress++;

			if (this.isSuperdiscoballAvailable() && !this.isSuperDiscoballActive) {
				this.superDiscoballProgress++;

				if (this.superDiscoballProgress >= this.superDiscoballProgress_Max) {
					this.isSuperDiscoballActive = true;

					this.superDiscoballProgress = 0;
				}
			}

			gamepush.player.set('score_king_league', this.kingLeagueProgress);
			gamepush.player.set('superdisco_progress', this.superDiscoballProgress);
			gamepush.player.set('is_superdisco_active', this.isSuperDiscoballActive);
			gamepush.player.sync();
		}
	}

	getProgress(): number {
		return this.currentProgress;
	}

	getKingLeagueProgress(): number {
		if (isNaN(this.kingLeagueProgress)) {
			this.kingLeagueProgress = 0;
		}
		return this.kingLeagueProgress;
	}

	setProgress(progress: number) {
		this.currentProgress = progress;
	}

	setKingLeagueProgress(progress: number) {
		if (isNaN(progress)) {
			console.error('Invalid progress value: Not a number');

			this.kingLeagueProgress = 0;

			return;
		}

		this.kingLeagueProgress = progress;
	}

	setLevelsCount(levelsCount: number) {
		this.levelsCount = levelsCount;

		console.log('Levels count:', levelsCount);
	}

	addResource(resourceType: string, value: number) {
		let now = new Date();
		let timeDiff = 0;

		switch (resourceType) {
			case 'gold':
				this.Gold += value;

				gamepush.player.set('gold', this.Gold);
				gamepush.player.sync();

				break;
			case 'stars':
				this.Stars += value;
				this.node.emit('stars', value);
				break;

			case 'bomb':
				this.StartBombs += value;

				gamepush.player.set('bomb', this.StartBombs);
				gamepush.player.sync();

				break;
			case 'rocket':
				this.StartRockets += value;

				gamepush.player.set('rocket', this.StartRockets);
				gamepush.player.sync();

				break;
			case 'discoball':
				this.StartDiscoballs += value;

				gamepush.player.set('discoball', this.StartDiscoballs);
				gamepush.player.sync();

				break;

			case 'hammer':
				this.Hammers += value;

				gamepush.player.set('hammer', this.Hammers);
				gamepush.player.sync();

				break;
			case 'bow':
				this.Bows += value;

				gamepush.player.set('bow', this.Bows);
				gamepush.player.sync();

				break;
			case 'cannon':
				this.Cannons += value;

				gamepush.player.set('cannon', this.Cannons);
				gamepush.player.sync();

				break;
			case 'jester':
				this.Jesters += value;

				gamepush.player.set('jester', this.Jesters);
				gamepush.player.sync();

				break;

			case 'bomb_minutes':
				timeDiff =
					this.Bombs_EndTime instanceof Date
						? this.Bombs_EndTime.getTime() - now.getTime()
						: -1;

				this.Bombs_EndTime =
					timeDiff < 0
						? new Date(now.getTime() + value * 60 * 1000)
						: new Date(this.Bombs_EndTime.getTime() + value * 60 * 1000);
				break;
			case 'rocket_minutes':
				timeDiff =
					this.Rockets_EndTime instanceof Date
						? this.Rockets_EndTime.getTime() - now.getTime()
						: -1;

				this.Rockets_EndTime =
					timeDiff < 0
						? new Date(now.getTime() + value * 60 * 1000)
						: new Date(this.Rockets_EndTime.getTime() + value * 60 * 1000);
				break;
			case 'discoball_minutes':
				timeDiff =
					this.Discoballs_EndTime instanceof Date
						? this.Discoballs_EndTime.getTime() - now.getTime()
						: -1;

				this.Discoballs_EndTime =
					timeDiff < 0
						? new Date(now.getTime() + value * 60 * 1000)
						: new Date(this.Discoballs_EndTime.getTime() + value * 60 * 1000);
				break;
			case 'endless_lives_minutes':
				timeDiff =
					this.EndlessLives_EndTime instanceof Date
						? this.EndlessLives_EndTime.getTime() - now.getTime()
						: -1;

				this.EndlessLives_EndTime =
					timeDiff < 0
						? new Date(now.getTime() + value * 60 * 1000)
						: new Date(this.EndlessLives_EndTime.getTime() + value * 60 * 1000);
				break;
			case 'modifier_x2_minutes':
				timeDiff =
					this.Modifier_x2_EndTime instanceof Date
						? this.Modifier_x2_EndTime.getTime() - now.getTime()
						: -1;

				this.Modifier_x2_EndTime =
					timeDiff < 0
						? new Date(now.getTime() + value * 60 * 1000)
						: new Date(this.Modifier_x2_EndTime.getTime() + value * 60 * 1000);
				break;

			case 'energy':
				if (gamepush.player.get('energy') < this.overMaxEnergy) {
					gamepush.player.add('energy', value);
					gamepush.player.sync();
				}

				break;
		}

		this.node.emit('resources_update', this.Gold, this.Stars);

		SaveData.instance.saveUserData();
	}

	subResource(resourceType: string, value: number): boolean {
		switch (resourceType) {
			case 'gold':
				if (this.Gold >= value) {
					this.Gold -= value;

					gamepush.player.set('gold', this.Gold);
					gamepush.player.sync();
				} else {
					return false;
				}
				break;

			case 'bomb':
				if (
					this.StartBombs >= value &&
					this.getRemainingTimeString('bomb') === ''
				) {
					this.StartBombs -= value;

					gamepush.player.set('bomb', this.StartBombs);
					gamepush.player.sync();
				}

				break;
			case 'rocket':
				if (
					this.StartRockets >= value &&
					this.getRemainingTimeString('rocket') === ''
				) {
					this.StartRockets -= value;

					gamepush.player.set('rocket', this.StartRockets);
					gamepush.player.sync();
				}

				break;
			case 'discoball':
				if (
					this.StartDiscoballs >= value &&
					this.getRemainingTimeString('discoball') === ''
				) {
					this.StartDiscoballs -= value;

					gamepush.player.set('discoball', this.StartDiscoballs);
					gamepush.player.sync();
				}
				break;

			case 'hammer':
				if (this.Hammers >= value) {
					this.Hammers -= value;

					gamepush.player.set('hammer', this.Hammers);
					gamepush.player.sync();
				}
				break;
			case 'bow':
				if (this.Bows >= value) {
					this.Bows -= value;

					gamepush.player.set('bow', this.Bows);
					gamepush.player.sync();
				}
				break;
			case 'cannon':
				if (this.Cannons >= value) {
					this.Cannons -= value;

					gamepush.player.set('cannon', this.Cannons);
					gamepush.player.sync();
				}
				break;
			case 'jester':
				if (this.Jesters >= value) {
					this.Jesters -= value;

					gamepush.player.set('jester', this.Jesters);
					gamepush.player.sync();
				}
				break;

			case 'energy':
				gamepush.player.add('energy', -1);
				gamepush.player.sync();

				break;
		}

		this.node.emit('resources_update', this.Gold, this.Stars);

		SaveData.instance.saveUserData();

		return true;
	}

	getResource(resourceType: string): number {
		switch (resourceType) {
			case 'gold':
				return this.Gold;
			case 'stars':
				return this.Stars;

			case 'bomb':
				return this.StartBombs;
			case 'rocket':
				return this.StartRockets;
			case 'discoball':
				return this.StartDiscoballs;

			case 'hammer':
				return this.Hammers;
			case 'bow':
				return this.Bows;
			case 'cannon':
				return this.Cannons;
			case 'jester':
				return this.Jesters;

			case 'cards':
				return (
					this.collections.getCollectedCardsCount() +
					this.collections.getDuplicatesCount()
				);
		}

		return 0;
	}

	setResource(resourceType: string, value: number) {
		if (!value) {
			return;
		}

		switch (resourceType) {
			case 'gold':
				this.Gold = value;
				break;
			case 'stars':
				this.Stars = value;
				break;

			case 'bomb':
				this.StartBombs = value;
				break;
			case 'rocket':
				this.StartRockets = value;
				break;
			case 'discoball':
				this.StartDiscoballs = value;
				break;

			case 'hammer':
				this.Hammers = value;
				break;
			case 'bow':
				this.Bows = value;
				break;
			case 'cannon':
				this.Cannons = value;
				break;
			case 'jester':
				this.Jesters = value;
				break;
		}

		this.node.emit('resources_update', this.Gold, this.Stars);
	}

	getPlayerName(): string {
		return this.playerName;
	}

	getPlayerId(): number {
		return this.playerId;
	}

	getClanName(): string {
		return this.clanName;
	}

	setClanName(clan: string) {
		this.clanName = clan;

		gamepush.player.set('clanname', this.clanName);
		gamepush.player.sync();
	}

	getRemainingTimeString(timerType: string): string {
		const now = new Date();

		let timer = new Date();
		switch (timerType) {
			case 'bomb':
				timer = this.Bombs_EndTime;
				break;
			case 'rocket':
				timer = this.Rockets_EndTime;
				break;
			case 'discoball':
				timer = this.Discoballs_EndTime;
				break;
			case 'endless_lives':
				timer = this.EndlessLives_EndTime;
				break;
			case 'modifier_x2':
				timer = this.Modifier_x2_EndTime;
				break;
		}

		const timeDiff = timer.getTime() - now.getTime();

		if (timeDiff < 0) {
			return '';
		}

		const hours = Math.floor(timeDiff / (1000 * 60 * 60));
		const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

		return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	}

	isTemproraryBonusActive(): boolean {
		if (
			this.getRemainingTimeString('bomb') !== '' ||
			this.getRemainingTimeString('rocket') !== '' ||
			this.getRemainingTimeString('discoball') !== ''
		) {
			return true;
		}

		return false;
	}

	isEndlessLivesActive(): boolean {
		if (this.getRemainingTimeString('endless_lives') !== '') {
			return true;
		}

		return false;
	}

	/*Energy*/
	getEnergyAskTimestamp(): number {
		return this.energyAskTimestamp;
	}

	setEnergyAskTimestamp(stamp: number) {
		this.energyAskTimestamp = stamp;
	}

	getEnergyAskTimeDifferenceInHours(): number {
		const currentTime = Date.now();

		const differenceInMillis = currentTime - this.energyAskTimestamp;

		const differenceInHours = differenceInMillis / (1000 * 60 * 60);

		return differenceInHours;
	}

	isEnergyAskAvailable(): boolean {
		if (
			this.energyAskTimestamp === 0 ||
			this.energyAskTimestamp === undefined ||
			this.energyAskTimestamp === null
		) {
			return true;
		}

		if (this.getEnergyAskTimeDifferenceInHours() >= this.energyAskDelay_Hours) {
			return true;
		}

		return false;
	}

	getEnergyCooldownTimeString(): string {
		if (this.isEnergyAskAvailable()) {
			return '';
		}

		const now = Date.now();
		const cooldownEndTime =
			this.energyAskTimestamp + this.energyAskDelay_Hours * 60 * 60 * 1000;

		if (now >= cooldownEndTime) {
			return '';
		}

		const timeDiff = cooldownEndTime - now;
		const hours = Math.floor(timeDiff / (1000 * 60 * 60));
		const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

		return (
			Localization.instance.getLabelByKey('events.lrcooldown') +
			': ' +
			`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
		);
	}

	addFriend(playerId: number) {
		if (this.friendsList === undefined || this.friendsList === null) {
			this.friendsList = [];
		}

		if (this.friendsList.includes(playerId)) {
			return;
		}

		this.friendsList.push(playerId);
	}

	addFriendRequest(playerId: number) {
		if (this.friendsRequests === undefined || this.friendsRequests === null) {
			this.friendsRequests = [];
		}

		if (this.friendsRequests.includes(playerId)) {
			return;
		}

		this.friendsRequests.push(playerId);
	}

	removeFriend(playerId: number) {
		if (this.friendsList.includes(playerId)) {
			this.friendsList = this.friendsList.filter((num) => num !== playerId);
		}
	}

	removeFriendRequest(playerId: number) {
		if (this.friendsRequests.includes(playerId)) {
			this.friendsRequests = this.friendsRequests.filter(
				(num) => num !== playerId,
			);
		}
	}

	isFriend(playerId: number) {
		if (this.friendsList === undefined || this.friendsList === null) {
			return false;
		}
		return this.friendsList.includes(playerId);
	}

	isFriendRequested(playerId: number) {
		if (this.friendsRequests === undefined || this.friendsRequests === null) {
			return false;
		}
		return this.friendsRequests.includes(playerId);
	}

	getFriendsList(): number[] {
		if (this.friendsList === undefined || this.friendsList === null) {
			return [];
		}
		return this.friendsList;
	}

	setFriendsList(list: number[]) {
		this.friendsList = list;
	}

	setDevMode(isDev: boolean) {
		this.isDev = isDev;
	}

	isDevMode(): boolean {
		return this.isDev;
	}

	setAphroditeAvailable(isAphrodite: boolean) {
		this.isAphrodite = isAphrodite;
	}

	isAphroditeAvailable(): boolean {
		return this.isAphrodite;
	}

	setIsPremium(isPremium: boolean): boolean {
		this.isPremium = isPremium;
	}

	getIsPremium(): boolean {
		return this.isPremium;
	}

	async buyPremium(): Promise<boolean> {
		if (!gamepush.payments.isAvailable) {
			console.log('Payments not available');
			return false;
		}

		try {
			console.log('payments available: premium');

			await gamepush.payments.purchase({ tag: 'battlepass' });

			this.isPremium = true;

			gamepush.player.set('energy:max', this.energyMax_Premium);
			gamepush.player.set('energy', this.energyMax_Premium);

			gamepush.player.set('ispremium', true);

			this.node.emit('premium_purchase');

			SaveData.instance.saveUserData();

			await gamepush.player.sync();

			await gamepush.payments.consume({ tag: 'battlepass' });

			console.log('payment successfull: battlepass');

			this.sendClanPremiumGift();

			return true;
		} catch (err) {
			console.warn('Purchase error:', err);
			return false;
		}
	}

	async buy(data: ShopItemData): Promise<boolean> {
		if (!gamepush.payments.isAvailable) {
			console.log('Payments not available');
			return false;
		}

		try {
			console.log('Attempting purchase: ' + data.tag);

			const result = await gamepush.payments.purchase({ tag: data.tag });

			console.log('Purchase result:', result); // для дебага

			// Если `purchase` не выбросила ошибку, считаем покупку успешной:
			this.consume(data);

			await gamepush.player.sync();
			await gamepush.payments.consume({ tag: data.tag });

			return true;
		} catch (err) {
			console.warn('Purchase error:', err);
			return false;
		}
	}

	removePremium() {
		this.isPremium = false;

		gamepush.player.set('energy:max', this.energyMax_Free);

		if (gamepush.player.get('energy') > this.energyMax_Free) {
		}

		gamepush.player.set('ispremium', false);

		gamepush.player.sync();

		//this.node.emit("premium_purchase");

		SaveData.instance.saveUserData();
	}

	updateName(newName: string) {
		this.playerName = newName;

		gamepush.player.set('name', newName);
		gamepush.player.sync();
	}

	openCardsPack(type: number): string[] {
		let newCards = this.collections.openCardsPackage(type);

		return newCards;
	}

	getCollectionIdByCard(id: string): string {
		return this.collections.findCollectionIdByCard(id);
	}

	getCollectionSeasonPrefix(): string {
		return this.collections.getSeasonPrefix();
	}

	findCardDataByCard(id: string): CollectionCardData {
		return this.collections.findCardDataByCard(id);
	}

	async checkForItemsFromFriends() {
		for (let i = 0; i < this.friendsList.length; i++) {
			const response = await gamepush.channels.fetchPersonalMessages({
				playerId: this.friendsList[i],
				tags: ['collection_card'],
				limit: 100,
				offset: 0,
			});

			response.items.forEach((message) => {
				let newCards = [];
				newCards.push(message.text);

				this.collections.applyNewCards(newCards);

				let recieveData = new CollectionCardSenderData();
				recieveData.id = message.text;
				recieveData.playerId = message.authorId;

				this.recievedCards.push(recieveData);

				gamepush.channels.deleteMessage({ messageId: message.id });
			});
		}
	}

	async checkForFriendsAccepts() {
		const response = await gamepush.channels.fetchFeedMessages({
			playerId: this.getPlayerId(),
			tags: ['friend_accept'],
			limit: 100,
			offset: 0,
		});

		response.items.forEach((message) => {
			this.addFriend(message.player.id);
			this.removeFriendRequest(message.player.id);

			gamepush.channels.deleteMessage({ messageId: message.id });
		});
	}

	async checkForFriendsRejects() {
		const response = await gamepush.channels.fetchFeedMessages({
			playerId: this.getPlayerId(),
			tags: ['friend_reject'],
			limit: 100,
			offset: 0,
		});

		response.items.forEach((message) => {
			this.removeFriendRequest(message.player.id);

			gamepush.channels.deleteMessage({ messageId: message.id });
		});
	}

	async checkForFriendsRemoves() {
		const response = await gamepush.channels.fetchFeedMessages({
			playerId: this.getPlayerId(),
			tags: ['friend_remove'],
			limit: 100,
			offset: 0,
		});

		response.items.forEach((message) => {
			this.removeFriendRequest(message.player.id);
			this.removeFriend(message.player.id);

			gamepush.channels.deleteMessage({ messageId: message.id });
		});
	}

	async fetchAndSavePlayers() {
		this.players = [];
		let count = 50;

		try {
			const result =
				await Net.instance.fetchScoreLeaderboardDataUnscoped('level_1');
			const {
				players,
				fields,
				topPlayers,
				abovePlayers,
				belowPlayers,
				player,
			} = result;

			for (let i = 0; i < players.length; i++) {
				let player = new PlayerEventData();
				player.playerName = players[i].name;
				player.progressValue = 0;
				player.playerId = players[i].id;

				this.players.push(player);

				if (this.players.length >= count) {
					return;
				}
			}
		} catch (error) {
			console.log('Error fetching leaderboard data:', error);
		}
	}

	getRandomPlayers(count: number): PlayerEventData[] {
		if (count >= this.players.length) {
			return [...this.players];
		}

		return this.players
			.slice()
			.sort(() => Math.random() - 0.5)
			.slice(0, count);
	}

	getMusicVolume(): number {
		return this.musicVolume;
	}

	getSfxVolume(): number {
		return this.sfxVolume;
	}

	setMusicVolume(vol: number) {
		this.musicVolume = vol;

		SaveData.instance.saveUserData();
	}

	setSfxVolume(vol: number) {
		this.sfxVolume = vol;

		SaveData.instance.saveUserData();
	}

	getLastMusicVolume(): number {
		return this.lastMusicVolume;
	}

	getLastSfxVolume(): number {
		return this.lastSfxVolume;
	}

	setLastMusicVolume(vol: number) {
		this.lastMusicVolume = vol;

		SaveData.instance.saveUserData();
	}

	setLastSfxVolume(vol: number) {
		this.lastSfxVolume = vol;

		SaveData.instance.saveUserData();
	}

	addHelpedMessageId(id: number) {
		if (this.helpedMessages.length >= this.maxMessagesStorage) {
			this.helpedMessages.shift();
		}

		this.helpedMessages.push(id);

		SaveData.instance.saveUserData();
	}

	getHelpedMessages(): number[] {
		return this.helpedMessages;
	}

	setHelpedMessages(m: number[]) {
		this.helpedMessages = m;
	}

	isHelped(id: number): boolean {
		return this.helpedMessages.includes(id);
	}

	addLevelFail() {
		this.currentLevelFails = this.currentLevelFails + 1;

		this.isSuperDiscoballActive = false;

		gamepush.player.set('is_superdisco_active', this.isSuperDiscoballActive);
		gamepush.player.sync();

		SaveData.instance.saveUserData();
	}

	resetLevelFails() {
		this.currentLevelFails = 0;

		SaveData.instance.saveUserData();
	}

	getLevelFails(): number {
		return this.currentLevelFails;
	}

	setLevelFails(fails: number) {
		this.currentLevelFails = fails;
	}

	isModifierX2(): boolean {
		return this.getRemainingTimeString('modifier_x2') !== '';
	}

	sendClanPremiumGift() {
		gamepush.channels.sendMessage({
			channelId: this.clans.getClanId(),
			text: this.getPlayerName() + ' купил Боевой Пропуск!',
			tags: ['clan_premium_gift'],
		});
	}

	getRecievedCards(): CollectionCardSenderData[] {
		return this.recievedCards;
	}

	removeRecievedCard(id: string) {
		this.recievedCards = this.recievedCards.filter((card) => card.id !== id);
	}

	addRecievedCard(id: string, playerId: number) {
		let newCards = [];
		newCards.push(id);

		this.collections.applyNewCards(newCards);

		let recieveData = new CollectionCardSenderData();
		recieveData.id = id;
		recieveData.playerId = playerId;

		this.recievedCards.push(recieveData);
	}

	/*super disco*/
	isSuperdiscoballAvailable(): boolean {
		return this.getProgress() >= this.superDiscoballLevel_Threshold;
	}

	getIsSuperDiscoballActive(): boolean {
		return this.isSuperDiscoballActive;
	}

	getSuperDiscoballProgress(): number {
		return this.superDiscoballProgress / this.superDiscoballProgress_Max;
	}

	getSuperDiscoballProgress_Max(): number {
		return this.superDiscoballProgress_Max;
	}

	getSuperDiscoballProgress_Value(): number {
		return this.superDiscoballProgress;
	}

	setSuperDiscoballProgress(p: number) {
		this.superDiscoballProgress = p;
	}

	setIsSuperDiscoballActive(isAct: boolean) {
		this.isSuperDiscoballActive = isAct;
	}
}
