import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, computed, signal } from '@angular/core';
import { WorldFacadeService } from '../../services/world-facade.service';
import { Subscription } from 'rxjs';
import { Direction } from '../../../../../game/shared/direction';

@Component({
  selector: 'app-world-debug',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="world-debug-overlay">
      <h4>🗺️ World Debug Info</h4>

      <div class="debug-section">
        <div class="debug-item">
          <strong>Position:</strong>
          <span class="coordinate"> ({{ playerState().x }}, {{ playerState().y }}) </span>
        </div>

        <div class="debug-item">
          <strong>Direction:</strong>
          <span
            class="direction-indicator"
            [class]="'dir-' + playerState().direction.toLowerCase()"
          >
            {{ getDirectionDisplay() }}
          </span>
        </div>

        <div class="debug-item">
          <strong>Movement:</strong>
          <span class="movement-status" [class]="playerState().isMoving ? 'moving' : 'idle'">
            {{ playerState().isMoving ? '🚶‍♂️ Moving' : '🧍 Idle' }}
          </span>
        </div>

        <div class="debug-item" *ngIf="npcInteraction().isInteracting">
          <strong>NPC:</strong>
          <span class="npc-name">Interacting</span>
        </div>

        <div class="debug-item">
          <strong>Wild Encounter:</strong>
          <span class="encounter-status" [class]="wildEncounter() ? 'active' : 'inactive'">
            {{ wildEncounter() ? '⚔️ Active' : '🌿 Safe' }}
          </span>
        </div>
      </div>

      <div class="debug-actions">
        <button class="debug-btn" (click)="toggleDetailedView()">
          {{ showDetails() ? 'Hide' : 'Show' }} Details
        </button>
      </div>

      <div *ngIf="showDetails()" class="detailed-debug">
        <h5>Movement Log</h5>
        <div class="event-log">
          <div *ngFor="let event of recentEvents()" class="event-item">
            <span class="event-time">{{ event.time }}</span>
            <span class="event-type">{{ event.type }}</span>
            <span class="event-data">{{ event.data }}</span>
          </div>
        </div>

        <h5>NPCs Status</h5>
        <div class="npc-list">
          <div *ngFor="let npc of npcs(); let i = index" class="npc-item">
            <span class="npc-id">#{{ i + 1 }}</span>
            <span class="npc-position">({{ npc.sprite?.x || 0 }}, {{ npc.sprite?.y || 0 }})</span>
            <span class="npc-status" [class]="npc.isTalkingToPlayer ? 'talking' : 'idle'">
              {{ npc.isTalkingToPlayer ? '💬 Talking' : '😶 Idle' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .world-debug-overlay {
        position: fixed;
        top: 20px;
        left: 20px;
        background: rgba(0, 50, 0, 0.9);
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

      .world-debug-overlay h4 {
        margin: 0 0 10px 0;
        color: #90ee90;
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
        min-width: 80px;
      }

      .coordinate {
        font-family: monospace;
        background: #333;
        padding: 2px 6px;
        border-radius: 3px;
        color: #00ffff;
      }

      .direction-indicator {
        padding: 2px 6px;
        border-radius: 3px;
        font-weight: bold;
      }

      .dir-up {
        background: #2196f3;
        color: white;
      }
      .dir-down {
        background: #ff9800;
        color: white;
      }
      .dir-left {
        background: #9c27b0;
        color: white;
      }
      .dir-right {
        background: #4caf50;
        color: white;
      }
      .dir-none {
        background: #666;
        color: white;
      }

      .movement-status.moving {
        color: #ffeb3b;
      }
      .movement-status.idle {
        color: #90ee90;
      }

      .encounter-status.active {
        color: #ff5722;
        font-weight: bold;
      }
      .encounter-status.inactive {
        color: #4caf50;
      }

      .npc-name {
        color: #ff69b4;
        font-weight: bold;
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
        max-height: 300px;
        overflow-y: auto;
      }

      .detailed-debug h5 {
        margin: 0 0 8px 0;
        color: #90ee90;
        font-size: 12px;
      }

      .event-log,
      .npc-list {
        background: #111;
        padding: 8px;
        border-radius: 3px;
        border: 1px solid #333;
        margin-bottom: 10px;
      }

      .event-item,
      .npc-item {
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
        color: #90ee90;
        min-width: 60px;
        font-weight: bold;
      }

      .event-data {
        color: #ffffff;
        flex: 1;
      }

      .npc-id {
        color: #ff69b4;
        min-width: 30px;
        font-weight: bold;
      }

      .npc-position {
        color: #00ffff;
        min-width: 80px;
        font-family: monospace;
      }

      .npc-status.talking {
        color: #ffeb3b;
      }
      .npc-status.idle {
        color: #90ee90;
      }
    `,
  ],
})
export class WorldDebugComponent implements OnInit, OnDestroy {
  // Reactive signals for the template
  playerState = signal({ x: 0, y: 0, direction: 'DOWN' as Direction, isMoving: false });
  npcInteraction = signal<{ npc: any | null; isInteracting: boolean }>({
    npc: null,
    isInteracting: false,
  });
  wildEncounter = signal(false);
  showDetails = signal(false);
  recentEvents = signal<Array<{ time: string; type: string; data: string }>>([]);
  npcs = signal<any[]>([]);

  private subscriptions: Subscription[] = [];

  constructor(private readonly worldFacade: WorldFacadeService) {}

  ngOnInit() {
    // Subscribe to world facade observables
    this.subscriptions.push(
      this.worldFacade.playerState$.subscribe(state => {
        this.playerState.set(state);
        this.addEvent('MOVE', `${state.x}, ${state.y} (${state.direction})`);
      }),

      this.worldFacade.npcInteraction$.subscribe(interaction => {
        this.npcInteraction.set(interaction);
        if (interaction.isInteracting) {
          this.addEvent('NPC', `Talking to NPC`);
        } else {
          this.addEvent('NPC', 'Interaction ended');
        }
      }),

      this.worldFacade.wildEncounter$.subscribe(encounter => {
        this.wildEncounter.set(encounter);
        if (encounter) {
          this.addEvent('ENCOUNTER', 'Wild encounter triggered!');
        }
      })
    );

    // Get initial NPCs state
    this.npcs.set(this.worldFacade.npcs$() || []);

    // Update NPCs periodically
    setInterval(() => {
      this.npcs.set(this.worldFacade.npcs$() || []);
    }, 1000);
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  getDirectionDisplay(): string {
    const direction = this.playerState().direction;
    const arrows: Record<string, string> = {
      UP: '⬆️ UP',
      DOWN: '⬇️ DOWN',
      LEFT: '⬅️ LEFT',
      RIGHT: '➡️ RIGHT',
      NONE: '⏸️ NONE',
    };
    return arrows[direction] || direction;
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
