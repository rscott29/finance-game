import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, computed, signal, Inject } from '@angular/core';
import { IBattleFacade, BATTLE_FACADE_TOKEN } from '../../interfaces/battle.interfaces';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-battle-debug',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="battleActive()" class="battle-debug-overlay">
      <h4>🐛 Battle Debug Info</h4>

      <div class="debug-section">
        <div class="debug-item">
          <strong>State:</strong>
          <span class="state-badge" [class]="'state-' + battleState().toLowerCase()">
            {{ battleState() }}
          </span>
        </div>

        <div class="debug-item">
          <strong>Turn:</strong>
          <span class="turn-indicator">
            {{ getTurnIndicator() }}
          </span>
        </div>

        <div class="debug-item">
          <strong>Player HP:</strong>
          <span class="health-debug">
            {{ playerHealth().current }}/{{ playerHealth().max }} ({{
              playerHealthPercentage().toFixed(1)
            }}%)
          </span>
        </div>

        <div class="debug-item">
          <strong>Enemy HP:</strong>
          <span class="health-debug">
            {{ enemyHealth().current }}/{{ enemyHealth().max }} ({{
              enemyHealthPercentage().toFixed(1)
            }}%)
          </span>
        </div>

        <div class="debug-item">
          <strong>Battle Duration:</strong>
          <span>{{ getBattleDuration() }}s</span>
        </div>
      </div>

      <div class="debug-actions">
        <button class="debug-btn" (click)="toggleDetailedView()">
          {{ showDetails() ? 'Hide' : 'Show' }} Details
        </button>
      </div>

      <div *ngIf="showDetails()" class="detailed-debug">
        <h5>Event History</h5>
        <div class="event-log">
          <div *ngFor="let event of recentEvents()" class="event-item">
            <span class="event-time">{{ event.time }}</span>
            <span class="event-type">{{ event.type }}</span>
            <span class="event-data">{{ event.data }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .battle-debug-overlay {
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.9);
        color: #00ff00;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        padding: 15px;
        border: 1px solid #00ff00;
        border-radius: 5px;
        min-width: 280px;
        max-width: 350px;
        z-index: 1000;
        box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
      }

      .battle-debug-overlay h4 {
        margin: 0 0 10px 0;
        color: #ffff00;
        font-size: 14px;
        text-align: center;
        border-bottom: 1px solid #333;
        padding-bottom: 5px;
      }

      .debug-section {
        margin-bottom: 15px;
      }

      .debug-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 5px;
        padding: 2px 0;
      }

      .debug-item strong {
        color: #ffffff;
        min-width: 90px;
      }

      .state-badge {
        background: #333;
        padding: 2px 6px;
        border-radius: 3px;
        font-weight: bold;
        text-transform: uppercase;
      }

      .state-intro {
        background: #ff9800;
        color: black;
      }
      .state-pre_battle_info {
        background: #2196f3;
      }
      .state-bring_out_monster {
        background: #9c27b0;
      }
      .state-player_input {
        background: #4caf50;
      }
      .state-enemy_input {
        background: #f44336;
      }
      .state-battle {
        background: #ff5722;
      }
      .state-post_attack_check {
        background: #795548;
      }
      .state-finished {
        background: #607d8b;
      }

      .turn-indicator {
        font-weight: bold;
      }

      .turn-player {
        color: #4caf50;
      }
      .turn-enemy {
        color: #f44336;
      }
      .turn-neutral {
        color: #ffeb3b;
      }

      .health-debug {
        font-family: monospace;
        color: #00ffff;
      }

      .debug-actions {
        text-align: center;
        margin-bottom: 10px;
        padding-top: 10px;
        border-top: 1px solid #333;
      }

      .debug-btn {
        background: #333;
        color: #00ff00;
        border: 1px solid #00ff00;
        padding: 4px 8px;
        font-size: 10px;
        border-radius: 3px;
        cursor: pointer;
        font-family: inherit;
      }

      .debug-btn:hover {
        background: #00ff00;
        color: #000;
      }

      .detailed-debug {
        border-top: 1px solid #333;
        padding-top: 10px;
        max-height: 200px;
        overflow-y: auto;
      }

      .detailed-debug h5 {
        margin: 0 0 8px 0;
        color: #ffff00;
        font-size: 12px;
      }

      .event-log {
        background: #111;
        padding: 8px;
        border-radius: 3px;
        border: 1px solid #333;
      }

      .event-item {
        display: flex;
        gap: 8px;
        margin-bottom: 3px;
        font-size: 10px;
      }

      .event-time {
        color: #666;
        min-width: 50px;
      }

      .event-type {
        color: #00ffff;
        min-width: 60px;
        font-weight: bold;
      }

      .event-data {
        color: #ffffff;
        flex: 1;
      }
    `,
  ],
})
export class BattleOverlayComponent implements OnInit, OnDestroy {
  // Reactive signals for the template
  playerHealth = signal({ current: 0, max: 0 });
  enemyHealth = signal({ current: 0, max: 0 });
  battleState = signal('IDLE');
  battleActive = signal(false);
  showDetails = signal(false);
  recentEvents = signal<Array<{ time: string; type: string; data: string }>>([]);

  private battleStartTime: number = 0;

  // Computed values
  playerHealthPercentage = computed(() => {
    const health = this.playerHealth();
    return health.max > 0 ? (health.current / health.max) * 100 : 0;
  });

  enemyHealthPercentage = computed(() => {
    const health = this.enemyHealth();
    return health.max > 0 ? (health.current / health.max) * 100 : 0;
  });

  private subscriptions: Subscription[] = [];

  constructor(@Inject(BATTLE_FACADE_TOKEN) private readonly battleFacade: IBattleFacade) {}

  ngOnInit() {
    // Subscribe to battle facade observables
    this.subscriptions.push(
      this.battleFacade.playerHealth$.subscribe((health: any) => {
        this.playerHealth.set(health);
        this.addEvent('HEALTH', `Player: ${health.current}/${health.max}`);
      }),

      this.battleFacade.enemyHealth$.subscribe((health: any) => {
        this.enemyHealth.set(health);
        this.addEvent('HEALTH', `Enemy: ${health.current}/${health.max}`);
      }),

      this.battleFacade.battleState$.subscribe((state: any) => {
        this.battleState.set(state);
        this.addEvent('STATE', state);
      }),

      this.battleFacade.battleActive$.subscribe((active: any) => {
        this.battleActive.set(active);
        if (active) {
          this.battleStartTime = Date.now();
          this.addEvent('BATTLE', 'Started');
        } else {
          this.addEvent('BATTLE', 'Ended');
        }
      })
    );
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  getTurnIndicator(): string {
    const state = this.battleState();
    if (state === 'PLAYER_INPUT') return '🟢 Player Turn';
    if (state === 'ENEMY_INPUT') return '🔴 Enemy Turn';
    if (state === 'BATTLE') return '⚔️ Combat';
    return '⏸️ Waiting';
  }

  getBattleDuration(): number {
    if (!this.battleActive() || this.battleStartTime === 0) return 0;
    return Math.floor((Date.now() - this.battleStartTime) / 1000);
  }

  toggleDetailedView(): void {
    this.showDetails.set(!this.showDetails());
  }

  private addEvent(type: string, data: string): void {
    const time = new Date().toLocaleTimeString().slice(-8, -3); // MM:SS format
    const events = this.recentEvents();
    const newEvents = [{ time, type, data }, ...events.slice(0, 9)]; // Keep last 10 events
    this.recentEvents.set(newEvents);
  }
}
