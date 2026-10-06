import { native } from 'cc';

type PreviewPlayerState = Record<string, any>;

interface PreviewExperiment {
	experiment: string;
	cohort: string;
}

interface PreviewBootstrapResponse {
	ok: boolean;

	player?: {
		id: number;
		name: string;
		state: PreviewPlayerState;
	};

	experiments?: PreviewExperiment[];

	error?: string;
}

type PreviewListener = (...args: any[]) => void;

class PreviewEventEmitter {
	private listeners = new Map<string, PreviewListener[]>();

	on(
		event: string,
		callback: PreviewListener,
	): void {
		const listeners =
			this.listeners.get(event) ?? [];

		listeners.push(callback);

		this.listeners.set(
			event,
			listeners,
		);
	}

	off(
		event: string,
		callback?: PreviewListener,
	): void {
		if (!callback) {
			this.listeners.delete(event);
			return;
		}

		const listeners =
			this.listeners.get(event);

		if (!listeners) {
			return;
		}

		this.listeners.set(
			event,
			listeners.filter(
				listener =>
					listener !== callback,
			),
		);
	}

	emit(
		event: string,
		...args: any[]
	): void {
		const listeners =
			this.listeners.get(event);

		if (!listeners) {
			return;
		}

		for (const listener of listeners) {
			listener(...args);
		}
	}
}

export class PreviewGamePush {
	private static readonly BOOTSTRAP_URL =
		'http://127.0.0.1:3001/preview/bootstrap';

	public static async load(): Promise<any> {

        native.fileUtils.writeStringToFile(
            'PreviewGamePush.load started', native.fileUtils.getWritablePath() + 'art-preview-debug.txt');

		console.log(
			'[Art Preview] Loading bootstrap...',
		);

		const bootstrap =
			await this.requestBootstrap();

		if (
			!bootstrap.ok ||
			!bootstrap.player
		) {
			throw new Error(
				bootstrap.error ??
					'Preview bootstrap returned no player',
			);
		}

		const gamepush =
			this.createGamePush(
				bootstrap.player,
				bootstrap.experiments ?? [],
			);

		(globalThis as any).gamepush =
			gamepush;

		console.log(
			'[Art Preview] PreviewGamePush ready',
			{
				playerId:
					gamepush.player.id,
				playerName:
					gamepush.player.name,
				experiments:
					bootstrap.experiments ??
					[],
			},
		);

		return gamepush;
	}

	private static requestBootstrap():
		Promise<PreviewBootstrapResponse> {
		return new Promise(
			(resolve, reject) => {
				const xhr =
					new XMLHttpRequest();

				xhr.open(
					'GET',
					this.BOOTSTRAP_URL,
					true,
				);

				xhr.timeout = 5000;

				xhr.onload = () => {
					if (
						xhr.status < 200 ||
						xhr.status >= 300
					) {
						reject(
							new Error(
								`Art Preview proxy HTTP ${xhr.status}: ${xhr.responseText}`,
							),
						);

						return;
					}

					try {
						const data =
							JSON.parse(
								xhr.responseText,
							) as PreviewBootstrapResponse;

						resolve(data);
					} catch {
						reject(
							new Error(
								'Art Preview proxy returned invalid JSON',
							),
						);
					}
				};

				xhr.onerror = () => {
					reject(
						new Error(
							`Cannot connect to Art Preview proxy: ${this.BOOTSTRAP_URL}`,
						),
					);
				};

				xhr.ontimeout = () => {
					reject(
						new Error(
							`Art Preview proxy timeout: ${this.BOOTSTRAP_URL}`,
						),
					);
				};

				xhr.send();
			},
		);
	}

	private static createGamePush(
		playerData: {
			id: number;
			name: string;
			state: PreviewPlayerState;
		},
		experimentsData: PreviewExperiment[],
	): any {
		const state: PreviewPlayerState = {
			...playerData.state,
		};

		const variablesEvents =
			new PreviewEventEmitter();

		const channelsEvents =
			new PreviewEventEmitter();

		const player = {
			id: playerData.id,

			name: playerData.name,

			ready: true,

			get(
				key: string,
			): any {
				return state[key];
			},

			set(
				key: string,
				value: any,
			): any {
				state[key] = value;

				console.log(
					'[Art Preview] player.set',
					key,
					value,
				);

				return value;
			},

			add(
				key: string,
				value: number = 1,
			): number {
				const current =
					Number(
						state[key] ?? 0,
					);

				const next =
					current + value;

				state[key] = next;

				console.log(
					'[Art Preview] player.add',
					key,
					value,
					'→',
					next,
				);

				return next;
			},

			getMaxValue(
				key: string,
			): number {
				const explicitMax =
					state[`${key}:max`] ??
					state[`${key}_max`];

				if (
					typeof explicitMax ===
					'number'
				) {
					return explicitMax;
				}

				const current =
					state[key];

				return typeof current ===
					'number'
					? current
					: 0;
			},

			async sync(): Promise<boolean> {
				console.log(
					'[Art Preview] player.sync skipped',
				);

				return true;
			},
		};

		const experiments = {
			has(
				experiment: string,
				cohort?: string,
			): boolean {
				return experimentsData.some(
					item =>
						item.experiment ===
							experiment &&
						(
							cohort ===
								undefined ||
							item.cohort ===
								cohort
						),
				);
			},
		};

		const ads = {
			async showPreloader():
				Promise<boolean> {
				console.log(
					'[Art Preview] ads.showPreloader skipped',
				);

				return true;
			},

			async showFullscreen():
				Promise<boolean> {
				console.log(
					'[Art Preview] ads.showFullscreen skipped',
				);

				return false;
			},

			async showRewardedVideo():
				Promise<boolean> {
				console.log(
					'[Art Preview] ads.showRewardedVideo skipped',
				);

				return false;
			},
		};

		const variables = {
			on(
				event: string,
				callback: PreviewListener,
			): void {
				variablesEvents.on(
					event,
					callback,
				);
			},

			off(
				event: string,
				callback?: PreviewListener,
			): void {
				variablesEvents.off(
					event,
					callback,
				);
			},

			async fetch():
				Promise<boolean> {
				console.log(
					'[Art Preview] variables.fetch skipped',
				);

				/*
				 * НЕ вызываем событие fetch
				 */
				return false;
			},

			get(
				key: string,
			): any {
				console.log(
					'[Art Preview] variables.get unavailable:',
					key,
				);

				return undefined;
			},
		};

		const channels = {
			on(
				event: string,
				callback: PreviewListener,
			): void {
				channelsEvents.on(
					event,
					callback,
				);
			},

			off(
				event: string,
				callback?: PreviewListener,
			): void {
				channelsEvents.off(
					event,
					callback,
				);
			},

			fetchChannels:
				async () => [],
			fetchMoreChannels:
				async () => [],
			fetchMessages:
				async () => [],
			fetchFeedMessages:
				async () => [],
			fetchPersonalMessages:
				async () => [],
			fetchMembers:
				async () => [],
			fetchJoinRequests:
				async () => [],

			createChannel:
				async () => null,
			deleteChannel:
				async () => false,

			join:
				async () => false,
			cancelJoin:
				async () => false,
			leave:
				async () => false,

			acceptJoinRequest:
				async () => false,
			rejectJoinRequest:
				async () => false,

			kick:
				async () => false,

			sendMessage:
				async () => null,
			sendFeedMessage:
				async () => null,
			sendPersonalMessage:
				async () => null,

			deleteMessage:
				async () => false,

			openChat:
				async () => false,
			openPersonalChat:
				async () => false,
		};

		const leaderboard = {
			fetch:
				async () => [],
			fetchScoped:
				async () => [],
			publishRecord:
				async () => false,
		};

		const players = {
			fetch:
				async () => [],
		};

		const payments = {
			isAvailable: false,

			purchase:
				async () => false,

			consume:
				async () => false,
		};

		const events = {
			has(): boolean {
				return false;
			},

			getEvent(): null {
				return null;
			},
		};

		const rewards = {
			has(): boolean {
				return false;
			},

			async give():
				Promise<boolean> {
				return false;
			},
		};

		return {
			__artPreview: true,

			player,
			experiments,
			ads,
			variables,
			channels,
			leaderboard,
			players,
			payments,
			events,
			rewards,
		};
	}
}