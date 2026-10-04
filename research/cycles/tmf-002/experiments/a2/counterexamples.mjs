// Invented prices only. Demonstrations of uncertainty and units, not market results.
import { bracketAtNextOpen, resolveSyntheticBar } from './reference.mjs';

const position = bracketAtNextOpen({ direction: 1, stop: 99, vol: 3 }, 103, { slipTicks: 0 });
const ambiguous = { source: 'synthetic', open: 103, high: 112, low: 98, close: 104 };
const stopped = resolveSyntheticBar(position, ambiguous, 'low-first', { slipTicks: 0 });
const target = resolveSyntheticBar(position, ambiguous, 'high-first', { slipTicks: 0 });
const gap = resolveSyntheticBar(position, { source: 'synthetic', open: 95, high: 100, low: 94, close: 97 }, 'low-first', { slipTicks: 0 });
const market = bracketAtNextOpen({ direction: 1, stop: 48900, vol: 100 }, 49000);
const costCase = resolveSyntheticBar(market, { source: 'synthetic', open: 49000, high: 49010, low: 48800, close: 48900 });
console.log(JSON.stringify({
  source: 'invented_synthetic_fixtures', market_data_used: false, strategy_effectiveness: 'not_evaluated',
  same_ohlc_different_order: { position, bar: ambiguous, slippage_ticks: 0, fee_per_side_twd: 29.8, low_first: stopped, high_first: target, pnl_difference_twd: target.pnl - stopped.pnl, limitation: 'Explicit path alternatives; not a TradingView emulator clone or actual TMF fill reconstruction' },
  gap_through_stop: { stop: 99, available_open: 95, result: gap },
  slippage_counted_once: { entry: market.entry, exit: costCase.exit, net_pnl_twd: costCase.pnl, cash_cost_twd: 59.6, slippage_already_in_prices: true },
}, null, 2));
