import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient } from '@angular/common/http';
import { AdminSidebarComponent } from '../../shared/components/admin-sidebar/admin-sidebar.component';
import { environment } from '../../../environments/environment';

interface AdminStats {
  total_rooms: number; open_rooms: number; total_players: number;
  total_coins_in_circulation: number; total_transactions: number; total_matches_played: number;
}
interface AdminUser {
  id: string; username: string; email: string; is_admin: boolean;
  is_banned: boolean; is_verified: boolean; coins: number; created_at: string;
}
interface AuditLog {
  id: string; admin_id: string; action: string; target_type: string;
  target_id: string; details: any; created_at: string;
}
interface LeagueOption { id: string; name: string; tier: string; }

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatProgressSpinnerModule,
    AdminSidebarComponent,
  ],
  template: `
    <div class="container">
      <div class="layout">
        <app-admin-sidebar [active]="view" (navigate)="switchView($event)"></app-admin-sidebar>
        <div class="content">

          <!-- Dashboard -->
          <mat-card class="glass" *ngIf="view==='dashboard'">
            <h3 class="section-title">Dashboard</h3>
            <div class="stats-grid" *ngIf="stats">
              <div class="stat-card"><div class="stat-val">{{ stats.total_rooms }}</div><div class="stat-lbl">Total Rooms</div></div>
              <div class="stat-card"><div class="stat-val">{{ stats.open_rooms }}</div><div class="stat-lbl">Open Rooms</div></div>
              <div class="stat-card"><div class="stat-val">{{ stats.total_players }}</div><div class="stat-lbl">Players</div></div>
              <div class="stat-card"><div class="stat-val">{{ stats.total_coins_in_circulation | number }}</div><div class="stat-lbl">Coins in Circulation</div></div>
              <div class="stat-card"><div class="stat-val">{{ stats.total_transactions }}</div><div class="stat-lbl">Transactions</div></div>
              <div class="stat-card"><div class="stat-val">{{ stats.total_matches_played }}</div><div class="stat-lbl">Matches Played</div></div>
            </div>
            <div class="hint" *ngIf="!stats && statsLoading">Loading stats…</div>
            <div class="msg error" *ngIf="statsError">{{ statsError }}</div>
          </mat-card>

          <!-- League Management -->
          <mat-card class="glass" *ngIf="view==='leagues'">
            <h3 class="section-title">Create League</h3>
            <p class="hint">
              Leagues are permanent containers (Silver, Gold, Diamond, BR).
              Create them once — rooms are created inside leagues.
            </p>
            <form [formGroup]="leagueForm" (ngSubmit)="createLeague()" class="admin-form">
              <div class="form-row">
                <div class="form-field">
                  <label>League Name</label>
                  <input class="text-input" formControlName="name" placeholder="e.g. Gold League">
                </div>
                <div class="form-field">
                  <label>Tier</label>
                  <select class="text-input" formControlName="tier">
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="diamond">Diamond</option>
                    <option value="br">Battle Royale</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-field">
                  <label>Entry Fee (coins)</label>
                  <input type="number" class="text-input" formControlName="entry_fee" min="0">
                </div>
                <div class="form-field">
                  <label>Max Players</label>
                  <input type="number" class="text-input" formControlName="max_players" min="2">
                </div>
              </div>
              <div class="form-field">
                <label>Description</label>
                <input class="text-input" formControlName="description" placeholder="Short description">
              </div>
              <button mat-raised-button type="submit" class="action-btn" [disabled]="leagueForm.invalid || submitting">
                <mat-spinner *ngIf="submitting && activeAction==='league'" diameter="18"></mat-spinner>
                <span *ngIf="!(submitting && activeAction==='league')">Create League</span>
              </button>
            </form>

            <hr class="divider">
            <h3 class="section-title">Existing Leagues</h3>
            <div class="hint" *ngIf="leagues.length === 0">No leagues yet. Create one above.</div>
            <div class="league-list">
              <div class="league-row" *ngFor="let l of leagues">
                <span class="tier-badge tier-{{ l.tier }}">{{ l.tier | uppercase }}</span>
                <span>{{ l.name }}</span>
                <span class="league-id hint">{{ l.id }}</span>
              </div>
            </div>
            <div class="msg success" *ngIf="successMsg">{{ successMsg }}</div>
            <div class="msg error" *ngIf="errorMsg">{{ errorMsg }}</div>
          </mat-card>

          <!-- Rooms -->
          <mat-card class="glass" *ngIf="view==='rooms'">
            <h3 class="section-title">Create Room</h3>
            <div class="warn-banner" *ngIf="leagues.length === 0">
              ⚠️ No leagues exist yet. Go to <strong>League Mgmt</strong> and create at least one league first.
            </div>
            <form [formGroup]="roomForm" (ngSubmit)="createRoom()" class="admin-form">
              <div class="form-row">
                <div class="form-field">
                  <label>League</label>
                  <select class="text-input" formControlName="league_id">
                    <option value="" disabled>Select league</option>
                    <option *ngFor="let l of leagues" [value]="l.id">
                      {{ l.name }} ({{ l.tier }})
                    </option>
                  </select>
                </div>
                <div class="form-field"><label>Room Name</label><input class="text-input" formControlName="name"></div>
              </div>
              <div class="form-row">
                <div class="form-field"><label>Entry Fee (coins)</label><input type="number" class="text-input" formControlName="entry_fee" min="0"></div>
                <div class="form-field">
                  <label>Division</label>
                  <select class="text-input" formControlName="division">
                    <option value="1v1">1v1</option><option value="2v2">2v2</option>
                    <option value="3v3">3v3</option><option value="4v4">4v4</option>
                    <option value="br">Battle Royale</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-field"><label>Max Players</label><input type="number" class="text-input" formControlName="max_players" min="2"></div>
                <div class="form-field"><label>Start Time</label><input type="datetime-local" class="text-input" formControlName="starts_at"></div>
              </div>
              <button mat-raised-button type="submit" class="action-btn" [disabled]="roomForm.invalid || submitting || leagues.length === 0">
                <mat-spinner *ngIf="submitting && activeAction==='room'" diameter="18"></mat-spinner>
                <span *ngIf="!(submitting && activeAction==='room')">Create Room</span>
              </button>
            </form>
            <hr class="divider">
            <h3 class="section-title">Publish In-Game Room Code</h3>
            <p class="hint">After getting the Room ID from Free Fire, paste it here so joined players can see it.</p>
            <form [formGroup]="setRoomIdForm" (ngSubmit)="setRoomId()" class="admin-form">
              <div class="form-row">
                <div class="form-field"><label>Room UUID (from dashboard)</label><input class="text-input" formControlName="room_id" placeholder="Paste room UUID"></div>
                <div class="form-field"><label>In-Game Room ID / Password</label><input class="text-input" formControlName="admin_room_id" placeholder="e.g. ABC123 / pass456"></div>
              </div>
              <button mat-raised-button type="submit" class="action-btn" [disabled]="setRoomIdForm.invalid || submitting">
                <mat-spinner *ngIf="submitting && activeAction==='roomId'" diameter="18"></mat-spinner>
                <span *ngIf="!(submitting && activeAction==='roomId')">Publish Code</span>
              </button>
            </form>
            <div class="msg success" *ngIf="successMsg">{{ successMsg }}</div>
            <div class="msg error" *ngIf="errorMsg">{{ errorMsg }}</div>
          </mat-card>

          <!-- Match Settlement -->
          <mat-card class="glass" *ngIf="view==='leaderboards'">
            <h3 class="section-title">Settle Match</h3>
            <p class="hint">Enter the Room UUID and paste the results JSON to credit winners.</p>
            <form [formGroup]="settleForm" (ngSubmit)="settleMatch()" class="admin-form">
              <div class="form-field"><label>Room UUID</label><input class="text-input" formControlName="room_id" placeholder="Paste room UUID"></div>
              <div class="form-field">
                <label>Results JSON</label>
                <textarea class="text-input textarea" formControlName="results_json" rows="8"
                  placeholder='[{"user_id":"uuid","result":"win","coins_won":160,"kills":8,"position":1},{"user_id":"uuid","result":"loss","coins_won":0,"kills":2,"position":2}]'></textarea>
              </div>
              <button mat-raised-button type="submit" class="action-btn" [disabled]="settleForm.invalid || submitting">
                <mat-spinner *ngIf="submitting && activeAction==='settle'" diameter="18"></mat-spinner>
                <span *ngIf="!(submitting && activeAction==='settle')">Settle Match</span>
              </button>
            </form>
            <div class="msg success" *ngIf="successMsg">{{ successMsg }}</div>
            <div class="msg error" *ngIf="errorMsg">{{ errorMsg }}</div>
          </mat-card>

          <!-- Wallet Management -->
          <mat-card class="glass" *ngIf="view==='wallet'">
            <h3 class="section-title">Credit Coins</h3>
            <form [formGroup]="creditForm" (ngSubmit)="creditCoins()" class="admin-form">
              <div class="form-row">
                <div class="form-field"><label>User ID</label><input class="text-input" formControlName="user_id" placeholder="User UUID"></div>
                <div class="form-field"><label>Amount (coins)</label><input type="number" class="text-input" formControlName="amount" min="1"></div>
              </div>
              <div class="form-field"><label>Reason</label><input class="text-input" formControlName="reason" placeholder="e.g. Promotional bonus"></div>
              <button mat-raised-button type="submit" class="action-btn success-btn" [disabled]="creditForm.invalid || submitting">
                <mat-spinner *ngIf="submitting && activeAction==='credit'" diameter="18"></mat-spinner>
                <span *ngIf="!(submitting && activeAction==='credit')">Credit Coins</span>
              </button>
            </form>
            <hr class="divider">
            <h3 class="section-title">Debit Coins</h3>
            <form [formGroup]="debitForm" (ngSubmit)="debitCoins()" class="admin-form">
              <div class="form-row">
                <div class="form-field"><label>User ID</label><input class="text-input" formControlName="user_id" placeholder="User UUID"></div>
                <div class="form-field"><label>Amount (coins)</label><input type="number" class="text-input" formControlName="amount" min="1"></div>
              </div>
              <div class="form-field"><label>Reason</label><input class="text-input" formControlName="reason" placeholder="e.g. Penalty deduction"></div>
              <button mat-raised-button type="submit" class="action-btn danger-btn" [disabled]="debitForm.invalid || submitting">
                <mat-spinner *ngIf="submitting && activeAction==='debit'" diameter="18"></mat-spinner>
                <span *ngIf="!(submitting && activeAction==='debit')">Debit Coins</span>
              </button>
            </form>
            <div class="msg success" *ngIf="successMsg">{{ successMsg }}</div>
            <div class="msg error" *ngIf="errorMsg">{{ errorMsg }}</div>
          </mat-card>

          <!-- User Management -->
          <mat-card class="glass" *ngIf="view==='users'">
            <h3 class="section-title">User Management</h3>
            <div class="search-row">
              <input class="text-input search-input" [(ngModel)]="userSearch" placeholder="Search by username or email" (keyup.enter)="searchUsers()">
              <button mat-raised-button class="action-btn" (click)="searchUsers()">Search</button>
            </div>
            <div class="hint" *ngIf="!users.length">Enter a search term above to load users. Leave blank to see all.</div>
            <div class="user-table" *ngIf="users.length">
              <div class="user-row header-row">
                <span>Username</span><span>Email</span><span>Coins</span><span>Status</span><span>Actions</span>
              </div>
              <div class="user-row" *ngFor="let u of users">
                <span>{{ u.username }}</span>
                <span class="small-text">{{ u.email }}</span>
                <span>{{ u.coins }}</span>
                <span [class.banned]="u.is_banned" [class.ok]="!u.is_banned">{{ u.is_banned ? 'Banned' : 'Active' }}</span>
                <span class="actions-cell">
                  <button *ngIf="!u.is_banned" class="small-btn danger-btn" (click)="banUser(u.id, u.username)">Ban</button>
                  <button *ngIf="u.is_banned"  class="small-btn success-btn" (click)="unbanUser(u.id)">Unban</button>
                </span>
              </div>
            </div>
            <div class="msg success" *ngIf="successMsg">{{ successMsg }}</div>
            <div class="msg error" *ngIf="errorMsg">{{ errorMsg }}</div>
          </mat-card>

          <!-- Audit Logs -->
          <mat-card class="glass" *ngIf="view==='audit'">
            <h3 class="section-title">Audit Logs</h3>
            <div class="hint" *ngIf="!auditLogs.length">No logs loaded yet.</div>
            <div class="audit-list">
              <div class="audit-row" *ngFor="let log of auditLogs">
                <span class="audit-action">{{ log.action }}</span>
                <span class="audit-target">{{ log.target_type }}:{{ log.target_id?.slice(0,8) }}</span>
                <span class="audit-time">{{ log.created_at | date:'dd MMM HH:mm' }}</span>
                <span class="audit-detail">{{ log.details | json }}</span>
              </div>
            </div>
          </mat-card>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .container{padding:20px;max-width:1200px;margin:0 auto;color:#fff}
    .layout{display:grid;grid-template-columns:220px 1fr;gap:1rem}
    .content{display:flex;flex-direction:column;gap:1rem}
    .section-title{color:#ff6b35;margin:0 0 1rem;font-size:1.15rem;font-weight:700}
    .stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:.75rem}
    .stat-card{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:1rem;text-align:center}
    .stat-val{font-size:1.7rem;font-weight:700;color:#ff6b35}
    .stat-lbl{color:rgba(255,255,255,.6);font-size:.82rem;margin-top:.2rem}
    .admin-form{display:flex;flex-direction:column;gap:.85rem}
    .form-row{display:grid;grid-template-columns:1fr 1fr;gap:.75rem}
    .form-field{display:flex;flex-direction:column;gap:.3rem}
    .form-field label{color:rgba(255,255,255,.85);font-size:.85rem;font-weight:600}
    .text-input{width:100%;padding:9px 12px;border-radius:9px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.06);color:#fff;outline:none;box-sizing:border-box}
    .text-input:focus{border-color:#ff6b35}
    select.text-input option{background:#1a1a3a}
    .textarea{resize:vertical;font-family:monospace;font-size:.8rem}
    .action-btn{background:linear-gradient(45deg,#ff6b35,#f7931e)!important;color:#fff!important;border-radius:9px!important;padding:9px 20px!important;font-weight:600!important;align-self:flex-start}
    .success-btn{background:linear-gradient(45deg,#2e7d32,#43a047)!important}
    .danger-btn{background:linear-gradient(45deg,#c62828,#e53935)!important}
    .divider{border:none;border-top:1px solid rgba(255,255,255,.1);margin:1.25rem 0}
    .msg{margin-top:.6rem;padding:.45rem .7rem;border-radius:8px;font-size:.88rem}
    .msg.success{background:rgba(76,175,80,.15);color:#4caf50}
    .msg.error{background:rgba(244,67,54,.15);color:#f44336}
    .hint{color:rgba(255,255,255,.5);font-size:.85rem}
    .warn-banner{background:rgba(255,152,0,.12);border:1px solid rgba(255,152,0,.35);color:#ffa726;border-radius:10px;padding:10px 14px;font-size:.88rem;margin-bottom:.75rem}
    .search-row{display:flex;gap:.75rem;margin-bottom:1rem}
    .search-input{flex:1}
    .user-table{border:1px solid rgba(255,255,255,.1);border-radius:10px;overflow:hidden}
    .user-row{display:grid;grid-template-columns:1fr 1.4fr .6fr .7fr .8fr;gap:.5rem;padding:.55rem .85rem;border-bottom:1px solid rgba(255,255,255,.06);font-size:.83rem;align-items:center}
    .header-row{background:rgba(255,255,255,.08);font-weight:600}
    .small-text{font-size:.78rem;word-break:break-all}
    .banned{color:#f44336;font-weight:600}.ok{color:#4caf50}
    .actions-cell{display:flex;gap:.35rem}
    .small-btn{border:none;border-radius:6px;padding:.28rem .6rem;cursor:pointer;color:#fff;font-size:.77rem;font-weight:600}
    .audit-list{display:flex;flex-direction:column;gap:.4rem;max-height:500px;overflow-y:auto}
    .audit-row{display:grid;grid-template-columns:160px 130px 110px 1fr;gap:.5rem;background:rgba(255,255,255,.04);border-radius:8px;padding:.55rem .8rem;font-size:.8rem}
    .audit-action{color:#ff6b35;font-weight:600}
    .audit-target{color:rgba(255,255,255,.7)}
    .audit-time{color:rgba(255,255,255,.5)}
    .audit-detail{color:rgba(255,255,255,.4);word-break:break-all;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .league-list{display:flex;flex-direction:column;gap:.5rem;margin-top:.5rem}
    .league-row{display:flex;align-items:center;gap:.75rem;background:rgba(255,255,255,.04);border-radius:8px;padding:.6rem .9rem;font-size:.88rem}
    .league-id{font-size:.72rem;margin-left:auto}
    .tier-badge{padding:3px 10px;border-radius:12px;font-size:.72rem;font-weight:700}
    .tier-silver{background:rgba(192,192,192,.2);color:#c0c0c0}
    .tier-gold{background:rgba(255,215,0,.15);color:#ffd700}
    .tier-diamond{background:rgba(185,242,255,.15);color:#b9f2ff}
    .tier-br{background:rgba(255,107,53,.15);color:#ff6b35}
    @media(max-width:900px){.layout{grid-template-columns:1fr}.form-row{grid-template-columns:1fr}.user-row{grid-template-columns:1fr 1fr}}
  `]
})
export class AdminComponent implements OnInit {
  view = 'dashboard';
  stats: AdminStats | null = null;
  statsLoading = false;
  statsError = '';
  users: AdminUser[] = [];
  auditLogs: AuditLog[] = [];
  leagues: LeagueOption[] = [];
  submitting = false;
  activeAction = '';
  successMsg = '';
  errorMsg = '';
  userSearch = '';

  leagueForm!: FormGroup;
  roomForm!: FormGroup;
  setRoomIdForm!: FormGroup;
  settleForm!: FormGroup;
  creditForm!: FormGroup;
  debitForm!: FormGroup;

  private api = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient, private fb: FormBuilder) {}

  ngOnInit() {
    this.leagueForm = this.fb.group({
      name:        ['', Validators.required],
      tier:        ['silver', Validators.required],
      entry_fee:   [50, [Validators.required, Validators.min(0)]],
      max_players: [50, [Validators.required, Validators.min(2)]],
      description: [''],
    });
    this.roomForm = this.fb.group({
      league_id:   ['', Validators.required],
      name:        ['', Validators.required],
      entry_fee:   [0,  [Validators.required, Validators.min(0)]],
      division:    ['1v1', Validators.required],
      max_players: [50,  [Validators.required, Validators.min(2)]],
      starts_at:   ['',  Validators.required],
    });
    this.setRoomIdForm = this.fb.group({
      room_id:       ['', Validators.required],
      admin_room_id: ['', Validators.required],
    });
    this.settleForm = this.fb.group({
      room_id:      ['', Validators.required],
      results_json: ['', Validators.required],
    });
    this.creditForm = this.fb.group({
      user_id: ['', Validators.required],
      amount:  [1, [Validators.required, Validators.min(1)]],
      reason:  ['', Validators.required],
    });
    this.debitForm = this.fb.group({
      user_id: ['', Validators.required],
      amount:  [1, [Validators.required, Validators.min(1)]],
      reason:  ['', Validators.required],
    });

    // Load leagues list (needed for Room create dropdown) and dashboard stats.
    // Never auto-create leagues — admin does this manually via the Leagues section.
    this.loadLeagues();
    this.loadStats();
  }

  private loadLeagues() {
    this.http.get<any[]>(`${environment.apiUrl}/leagues`).subscribe({
      next: res => {
        this.leagues = res.map(l => ({ id: l.id, name: l.name, tier: l.tier }));
        // Pre-select the first league in the room form if none is selected yet.
        if (this.leagues.length && !this.roomForm.get('league_id')?.value) {
          this.roomForm.patchValue({ league_id: this.leagues[0].id });
        }
      },
      error: () => { this.leagues = []; }
    });
  }

  switchView(v: string) {
    this.view = v;
    this.clearMsgs();
    if (v === 'dashboard') this.loadStats();
    if (v === 'audit')     this.loadAuditLogs();
    if (v === 'rooms' || v === 'leagues') this.loadLeagues();
  }

  loadStats() {
    this.statsLoading = true;
    this.statsError = '';
    this.http.get<AdminStats>(`${this.api}/stats`).subscribe({
      next: s  => { this.stats = s; this.statsLoading = false; },
      error: e => { this.statsError = e?.error?.detail || 'Failed to load stats'; this.statsLoading = false; },
    });
  }

  createLeague() {
    if (this.leagueForm.invalid) return;
    this.begin('league');
    const v = this.leagueForm.value;
    this.http.post(`${this.api}/leagues`, { ...v, image_url: null }).subscribe({
      next: () => {
        this.end();
        this.leagueForm.reset({ tier: 'silver', entry_fee: 50, max_players: 50 });
        this.loadLeagues();
        this.ok('League created successfully!');
      },
      error: e => this.err(e),
    });
  }

  createRoom() {
    if (this.roomForm.invalid || this.leagues.length === 0) return;
    this.begin('room');
    const v = this.roomForm.value;
    this.http.post(`${this.api}/rooms`, { ...v, starts_at: new Date(v.starts_at).toISOString() }).subscribe({
      next: (r: any) => {
        this.end();
        const resetLeague = this.leagues.length ? this.leagues[0].id : '';
        this.roomForm.reset({ entry_fee: 0, max_players: 50, division: '1v1', league_id: resetLeague });
        this.ok(`Room created! UUID: ${r.id}`);
      },
      error: e => this.err(e),
    });
  }

  setRoomId() {
    if (this.setRoomIdForm.invalid) return;
    this.begin('roomId');
    const { room_id, admin_room_id } = this.setRoomIdForm.value;
    this.http.put(`${this.api}/rooms/${room_id}`, { admin_room_id }).subscribe({
      next: () => { this.end(); this.setRoomIdForm.reset(); this.ok('Room code published — players can now see it after joining.'); },
      error: e => this.err(e),
    });
  }

  settleMatch() {
    if (this.settleForm.invalid) return;
    this.begin('settle');
    let results: any[];
    try { results = JSON.parse(this.settleForm.value.results_json); }
    catch { this.errorMsg = 'Invalid JSON — check your results array.'; this.end(); return; }
    this.http.post(`${this.api}/matches/${this.settleForm.value.room_id}/settle`, { results }).subscribe({
      next: (r: any) => { this.end(); this.settleForm.reset(); this.ok(`Settled! ${r.players_settled} players credited.${r.errors?.length ? ' Errors: ' + r.errors.join(', ') : ''}`); },
      error: e => this.err(e),
    });
  }

  creditCoins() {
    if (this.creditForm.invalid) return;
    this.begin('credit');
    this.http.post(`${this.api}/wallet/credit`, this.creditForm.value).subscribe({
      next: (r: any) => { this.end(); this.creditForm.reset({ amount: 1 }); this.ok(r.message); },
      error: e => this.err(e),
    });
  }

  debitCoins() {
    if (this.debitForm.invalid) return;
    this.begin('debit');
    this.http.post(`${this.api}/wallet/debit`, this.debitForm.value).subscribe({
      next: (r: any) => { this.end(); this.debitForm.reset({ amount: 1 }); this.ok(r.message); },
      error: e => this.err(e),
    });
  }

  searchUsers() {
    const p: any = { page: '1', limit: '30' };
    if (this.userSearch.trim()) p.search = this.userSearch.trim();
    this.http.get<{ users: AdminUser[] }>(`${this.api}/users`, { params: p }).subscribe({
      next: r  => this.users = r.users,
      error: e => this.err(e),
    });
  }

  banUser(id: string, name: string) {
    const reason = prompt(`Reason for banning ${name}?`);
    if (!reason) return;
    this.http.put(`${this.api}/users/${id}/ban`, null, { params: { reason } }).subscribe({
      next: () => { this.ok(`${name} banned.`); this.searchUsers(); },
      error: e => this.err(e),
    });
  }

  unbanUser(id: string) {
    this.http.put(`${this.api}/users/${id}/unban`, null).subscribe({
      next: () => { this.ok('User unbanned.'); this.searchUsers(); },
      error: e => this.err(e),
    });
  }

  loadAuditLogs() {
    this.http.get<{ logs: AuditLog[] }>(`${this.api}/audit-logs?limit=50`).subscribe({
      next: r  => this.auditLogs = r.logs,
      error: e => console.error(e),
    });
  }

  private begin(a: string) { this.submitting = true; this.activeAction = a; this.clearMsgs(); }
  private end()            { this.submitting = false; this.activeAction = ''; }
  private ok(m: string)    { this.successMsg = m; setTimeout(() => this.successMsg = '', 8000); }
  private err(e: any)      { this.end(); this.errorMsg = e?.error?.detail || e?.message || 'An error occurred.'; }
  private clearMsgs()      { this.successMsg = ''; this.errorMsg = ''; }
}
