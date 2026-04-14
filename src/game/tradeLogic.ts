import { ref, update, set } from 'firebase/database';
import { db } from '../firebase/config';

export interface TradeOffer {
  from: string;
  to: string;
  moneyFrom: number;
  moneyTo: number;
  propsFrom: number[];
  propsTo: number[];
}

export const proposeTrade = async (roomId: string, offer: TradeOffer) => {
  await set(ref(db, `gameStates/${roomId}/pendingTrade`), offer);
};

export const executeTrade = async (roomId: string, gameState: any) => {
  const trade = gameState.pendingTrade;
  if (!trade) return;

  const updates: any = {};
  const pFrom = gameState.players[trade.from];
  const pTo = gameState.players[trade.to];

  // Money exchange
  updates[`gameStates/${roomId}/players/${trade.from}/money`] = pFrom.money - trade.moneyFrom + trade.moneyTo;
  updates[`gameStates/${roomId}/players/${trade.to}/money`] = pTo.money - trade.moneyTo + trade.moneyFrom;

  // Property exchange
  const newPropsFrom = (pFrom.properties || []).filter((id: number) => !trade.propsFrom.includes(id)).concat(trade.propsTo);
  const newPropsTo = (pTo.properties || []).filter((id: number) => !trade.propsTo.includes(id)).concat(trade.propsFrom);

  updates[`gameStates/${roomId}/players/${trade.from}/properties`] = newPropsFrom;
  updates[`gameStates/${roomId}/players/${trade.to}/properties`] = newPropsTo;

  // Clear trade
  updates[`gameStates/${roomId}/pendingTrade`] = null;
  updates[`gameStates/${roomId}/logs`] = [...(gameState.logs || []), `Trade executed between ${pFrom.username} and ${pTo.username}!`].slice(-10);

  await update(ref(db), updates);
};
