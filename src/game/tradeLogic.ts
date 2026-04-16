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

  try {
    const updates: any = {};
    const pFrom = gameState.players[trade.from];
    const pTo = gameState.players[trade.to];

    if (!pFrom || !pTo) return;

    // Money exchange
    updates[`gameStates/${roomId}/players/${trade.from}/money`] = (pFrom.money || 0) - trade.moneyFrom + trade.moneyTo;
    updates[`gameStates/${roomId}/players/${trade.to}/money`] = (pTo.money || 0) - trade.moneyTo + trade.moneyFrom;

    // Property exchange
    const newPropsFrom = (pFrom.properties || []).filter((id: number) => !trade.propsFrom.includes(id)).concat(trade.propsFrom.length > 0 ? trade.propsTo : trade.propsTo);
    // Correcting property swap logic
    const finalPropsFrom = (pFrom.properties || []).filter((id: number) => !trade.propsFrom.includes(id)).concat(trade.propsTo);
    const finalPropsTo = (pTo.properties || []).filter((id: number) => !trade.propsTo.includes(id)).concat(trade.propsFrom);

    updates[`gameStates/${roomId}/players/${trade.from}/properties`] = finalPropsFrom;
    updates[`gameStates/${roomId}/players/${trade.to}/properties`] = finalPropsTo;

    // Clear trade
    updates[`gameStates/${roomId}/pendingTrade`] = null;
    updates[`gameStates/${roomId}/logs`] = [...(gameState.logs || []), `Scroll Accepted! Trade completed between ${pFrom.username} and ${pTo.username}.`].slice(-15);
    
    // Add a flag for the host to finalize if needed, though update(ref(db), updates) usually works if rules allow
    await update(ref(db), updates);
    return true;
  } catch (error) {
    console.error("Trade Execution Failed:", error);
    // If it fails, we can try to at least clear it or signal the host
    return false;
  }
};
