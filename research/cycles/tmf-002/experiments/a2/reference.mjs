// Synthetic-path oracle for A2 rules. It does not load or backtest market data.
export const defaults = Object.freeze({ mode: 'Retest', lookback: 20, atrLength: 14, wait: 6, horizon: 12, tick: 1, pointValue: 10, feePerSide: 29.8, slipTicks: 3 });

export function sessionAt(time) {
  const shifted = new Date(time + 8 * 3600000);
  const day = Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate()) - 8 * 3600000;
  const minute = shifted.getUTCHours() * 60 + shifted.getUTCMinutes();
  if (minute >= 525 && minute < 825) return { id: day + 525 * 60000, end: day + 825 * 60000 };
  if (minute >= 900) return { id: day + 900 * 60000, end: day + 1740 * 60000 };
  if (minute < 300) return { id: day - 540 * 60000, end: day + 300 * 60000 };
  return null;
}

export class SignalOracle {
  constructor(config = {}) {
    this.c = { ...defaults, ...config };
    if (!['Retest', 'Direct'].includes(this.c.mode) || this.c.horizon < this.c.wait + 2) throw Error('Invalid experiment configuration');
    this.i = -1; this.history = []; this.trSeed = []; this.atr = null; this.previousClose = null;
    this.previousTimeClose = null; this.session = null; this.episode = null; this.events = []; this.badSession = false;
  }
  step(bar) {
    if (bar.source !== 'synthetic') throw Error('This oracle accepts declared synthetic fixtures only, not market data');
    if (!bar.confirmed) return [];
    if (!(bar.low <= Math.min(bar.open, bar.close) && bar.high >= Math.max(bar.open, bar.close) && bar.closeTime > bar.time)) throw Error('Invalid OHLC/time fixture');
    if (this.previousTimeClose !== null && bar.time < this.previousTimeClose) throw Error('Out-of-order or duplicate completed bar');
    const c = this.c, out = [], emit = (type, extra = {}) => out.push({ type, bar: this.i, ...extra });
    this.i++;
    const s = sessionAt(bar.time), sid = s?.id ?? null;
    const changed = this.session !== sid;
    const gap = !changed && this.previousTimeClose !== null && bar.time !== this.previousTimeClose;
    const tr = Math.max(bar.high - bar.low, this.previousClose === null ? 0 : Math.abs(bar.high - this.previousClose), this.previousClose === null ? 0 : Math.abs(bar.low - this.previousClose));
    if (this.atr === null) {
      this.trSeed.push(tr);
      if (this.trSeed.length === c.atrLength) this.atr = this.trSeed.reduce((a, b) => a + b, 0) / c.atrLength;
    } else this.atr = (this.atr * (c.atrLength - 1) + tr) / c.atrLength;
    const upper = this.history.length >= c.lookback ? Math.max(...this.history.slice(-c.lookback).map(b => b.high)) : null;
    const lower = this.history.length >= c.lookback ? Math.min(...this.history.slice(-c.lookback).map(b => b.low)) : null;
    const remaining = s ? s.end - bar.closeTime : -1;
    if (changed) this.badSession = false;
    if (gap) this.badSession = true;
    const canEnter = s !== null && !this.badSession && remaining > 2 * bar.nominalMs;
    const forceTime = s === null || remaining <= bar.nominalMs;
    if (changed) {
      if (this.episode) emit('session_reset', { episode: this.episode.start });
      this.episode = null;
    }
    let e = this.episode;
    if (e && this.i > e.end + 1) this.episode = e = null;
    const hadEpisode = Boolean(e);
    if (e) {
      if ((this.badSession || forceTime || this.i >= e.end) && e.issued && !e.exitRequested) { emit('time_exit', { episode: e.start }); e.exitRequested = true; }
      if (e.waiting) {
        const fail = e.direction === 1 ? bar.close < e.level - .5 * e.vol : bar.close > e.level + .5 * e.vol;
        if (gap || !canEnter || fail) { e.waiting = false; emit('cancel', { reason: gap ? 'data_gap' : !canEnter ? 'session_cutoff' : 'close_invalidation', episode: e.start }); }
        else {
          const age = this.i - e.start;
          const touched = e.direction === 1 ? bar.low >= e.level - .25 * e.vol && bar.low <= e.level + .25 * e.vol && bar.close >= e.level + .25 * e.vol && bar.close > bar.open : bar.high >= e.level - .25 * e.vol && bar.high <= e.level + .25 * e.vol && bar.close <= e.level - .25 * e.vol && bar.close < bar.open;
          if (age >= 1 && age <= c.wait && touched) {
            const risk = e.direction * (bar.close - e.stop);
            e.waiting = false;
            if (risk >= .5 * e.vol && risk <= 2 * e.vol) { e.issued = true; emit('signal', { episode: e.start, direction: e.direction, stop: e.stop, vol: e.vol, signalClose: bar.close }); }
            else emit('cancel', { reason: 'signal_risk', episode: e.start });
          } else if (age >= c.wait) { e.waiting = false; emit('expired', { episode: e.start }); }
        }
      }
    }
    if (!hadEpisode && !gap && canEnter && this.atr > 0 && upper !== null) {
      const direction = bar.close > upper ? 1 : bar.close < lower ? -1 : 0;
      if (direction) {
        const level = direction === 1 ? upper : lower;
        const stop = (direction === 1 ? Math.floor((level - .5 * this.atr) / c.tick) : Math.ceil((level + .5 * this.atr) / c.tick)) * c.tick;
        const risk = direction * (bar.close - stop);
        if (risk >= .5 * this.atr && risk <= 2 * this.atr) {
          e = this.episode = { start: this.i, end: this.i + c.horizon, direction, level, vol: this.atr, stop, waiting: c.mode === 'Retest', issued: c.mode === 'Direct', exitRequested: false };
          emit('episode', { direction, level, vol: e.vol, stop, end: e.end });
          if (e.issued) emit('signal', { episode: e.start, direction, stop, vol: e.vol, signalClose: bar.close });
        } else emit('breakout_rejected', { reason: 'initial_risk' });
      }
    }
    this.history.push({ high: bar.high, low: bar.low });
    this.previousClose = bar.close; this.previousTimeClose = bar.closeTime; this.session = sid;
    this.events.push(...out); return out;
  }
}

export function bracketAtNextOpen(signal, open, config = {}) {
  const c = { ...defaults, ...config };
  const entry = open + signal.direction * c.slipTicks * c.tick;
  const risk = signal.direction * (entry - signal.stop);
  const valid = risk > 0 && risk <= 2 * signal.vol;
  const raw = entry + signal.direction * 2 * risk;
  const target = valid ? (signal.direction === 1 ? Math.ceil(raw / c.tick) : Math.floor(raw / c.tick)) * c.tick : null;
  return { ...signal, entry, risk, valid, target, action: valid ? 'protect' : 'exit_on_next_available_tick', entryCost: c.feePerSide };
}

export function resolveSyntheticBar(position, bar, order = 'low-first', config = {}) {
  if (bar.source !== 'synthetic') throw Error('Synthetic fixture required');
  if (!['low-first', 'high-first'].includes(order) || !position.valid) throw Error('Explicit path and valid bracket required');
  const c = { ...defaults, ...config }, d = position.direction;
  const stopAtOpen = d * (bar.open - position.stop) <= 0;
  const targetAtOpen = d * (bar.open - position.target) >= 0;
  let reason = null, exit = null;
  if (stopAtOpen) { reason = 'gap_stop'; exit = bar.open - d * c.slipTicks * c.tick; }
  else if (targetAtOpen) { reason = 'gap_limit'; exit = bar.open; }
  else {
    const path = order === 'low-first' ? [bar.low, bar.high] : [bar.high, bar.low];
    for (const price of path) {
      if (d * (price - position.stop) <= 0) { reason = 'stop'; exit = position.stop - d * c.slipTicks * c.tick; break; }
      if (d * (price - position.target) >= 0) { reason = 'limit'; exit = position.target; break; }
    }
  }
  if (exit === null) return { reason: 'open', pnl: null };
  return { reason, exit, pnl: d * (exit - position.entry) * c.pointValue - 2 * c.feePerSide, assumption: `synthetic_${order}; limit_at_target_without_queue_model` };
}
