declare const gamepush: any;

import { sys } from 'cc';
import { UserData } from './UserData';

export class DebugGold {
	private static readonly debugGoldAmount = 35000;
	private static readonly originalGoldKey = 'debug_original_gold';
	private static readonly activeKey = 'debug_gold_active';

	public static async enable() {
		const isActive = sys.localStorage.getItem(this.activeKey) === 'true';

		// Если Debug Gold ещё не активен —
		// запоминаем текущий настоящий баланс.
		if (!isActive) {
			const originalGold = UserData.instance.getResource('gold');

			sys.localStorage.setItem(this.originalGoldKey, originalGold.toString());

			sys.localStorage.setItem(this.activeKey, 'true');

			console.log('Debug Gold enabled. Original gold:', originalGold);
		}

		UserData.instance.setResource('gold', this.debugGoldAmount);

		gamepush.player.set('gold', this.debugGoldAmount);

		try {
			await gamepush.player.sync();

			console.log('Debug Gold synced:', this.debugGoldAmount);
		} catch (error) {
			console.error('Failed to sync Debug Gold:', error);
		}
	}

	public static async disable() {
		const savedGold = sys.localStorage.getItem(this.originalGoldKey);

		if (savedGold === null) {
			console.warn('Cannot restore Debug Gold: original gold not found');

			return;
		}

		const originalGold = Number(savedGold);

		if (Number.isNaN(originalGold)) {
			console.error('Invalid saved Debug Gold:', savedGold);

			return;
		}

		UserData.instance.setResource('gold', originalGold);

		gamepush.player.set('gold', originalGold);

		try {
			await gamepush.player.sync();

			// Только после успешного sync считаем,
			// что Debug Gold действительно выключен.
			sys.localStorage.setItem(this.activeKey, 'false');

			console.log('Debug Gold disabled. Restored:', originalGold);
		} catch (error) {
			console.error('Failed to restore original gold:', error);
		}
	}

	public static async restoreIfInterrupted() {
		const isActive = sys.localStorage.getItem(this.activeKey) === 'true';

		if (!isActive) {
			return;
		}

		const savedGold = sys.localStorage.getItem(this.originalGoldKey);

		if (savedGold === null) {
			console.error('Debug Gold is active, but original gold is missing');

			return;
		}

		const originalGold = Number(savedGold);

		if (Number.isNaN(originalGold)) {
			console.error('Invalid saved Debug Gold:', savedGold);

			return;
		}

		console.log('Interrupted Debug Gold detected. Restoring:', originalGold);

		UserData.instance.setResource('gold', originalGold);

		gamepush.player.set('gold', originalGold);

		try {
			await gamepush.player.sync();

			sys.localStorage.setItem(this.activeKey, 'false');

			console.log('Interrupted Debug Gold restored:', originalGold);
		} catch (error) {
			console.error('Failed to restore interrupted Debug Gold:', error);
		}
	}
}
