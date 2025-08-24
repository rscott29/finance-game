import { Injectable } from '@angular/core';
import { Signal, computed, signal } from '@angular/core';
import { IBattleStats } from '../interfaces/battle.interfaces';

export interface BattleStats {
  enemyHealth: number;
  playerHealth: number;
  isAnimating: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class BattleStatsService implements IBattleStats {
  private stats = signal<BattleStats>({
    enemyHealth: 100,
    playerHealth: 100,
    isAnimating: false,
  });

  readonly enemyHealth: Signal<number> = computed(() => this.stats().enemyHealth);
  readonly playerHealth: Signal<number> = computed(() => this.stats().playerHealth);
  readonly isAnimating: Signal<boolean> = computed(() => this.stats().isAnimating);

  reset() {
    this.stats.set({
      enemyHealth: 100,
      playerHealth: 100,
      isAnimating: false,
    });
  }

  setEnemyHealth(health: number) {
    this.stats.update(stats => ({
      ...stats,
      enemyHealth: health,
    }));
  }

  setPlayerHealth(health: number) {
    this.stats.update(stats => ({
      ...stats,
      playerHealth: health,
    }));
  }

  setIsAnimating(isAnimating: boolean) {
    this.stats.update(stats => ({
      ...stats,
      isAnimating,
    }));
  }
}
