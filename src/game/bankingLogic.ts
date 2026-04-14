import { ref, update, get } from 'firebase/database';
import { db } from '../firebase/config';
import { BOARD_DATA } from './boardData';

export interface Loan {
  amount: number;
  interest: number; // 15% 
  totalOwed: number;
  turnsTaken: number;
  turnsDue: number; // repay within 10 turns
}

const MAX_LOAN_AMOUNT = 500;
const INTEREST_RATE = 0.15;
const LOAN_TERM_TURNS = 10;

export const takeLoan = async (roomId: string, userId: string, amount: number, gameState: any) => {
  const player = gameState.players[userId];
  if (!player || player.isBankrupt) return;
  
  // Check if player already has a loan
  const existingLoan = gameState.loans?.[userId];
  if (existingLoan) return; // Only 1 loan at a time
  
  // Clamp amount
  const loanAmount = Math.min(amount, MAX_LOAN_AMOUNT);
  if (loanAmount <= 0) return;
  
  const interest = Math.ceil(loanAmount * INTEREST_RATE);
  const totalOwed = loanAmount + interest;
  
  const loan: Loan = {
    amount: loanAmount,
    interest: INTEREST_RATE,
    totalOwed,
    turnsTaken: gameState.totalTurns || 0,
    turnsDue: LOAN_TERM_TURNS,
  };
  
  const logs = [...(gameState.logs || []), `${player.username} took a loan of ${loanAmount} Ryō from the bank (owes ${totalOwed} Ryō).`];
  
  const updates: any = {
    [`gameStates/${roomId}/players/${userId}/money`]: player.money + loanAmount,
    [`gameStates/${roomId}/loans/${userId}`]: loan,
    [`gameStates/${roomId}/logs`]: logs.slice(-15),
  };
  
  await update(ref(db), updates);
};

export const repayLoan = async (roomId: string, userId: string, gameState: any) => {
  const player = gameState.players[userId];
  const loan = gameState.loans?.[userId];
  if (!player || !loan) return;
  
  if (player.money < loan.totalOwed) return; // Can't afford full repayment
  
  const logs = [...(gameState.logs || []), `${player.username} repaid their loan of ${loan.totalOwed} Ryō to the bank.`];
  
  const updates: any = {
    [`gameStates/${roomId}/players/${userId}/money`]: player.money - loan.totalOwed,
    [`gameStates/${roomId}/loans/${userId}`]: null,
    [`gameStates/${roomId}/logs`]: logs.slice(-15),
  };
  
  await update(ref(db), updates);
};

// Called in endTurn - checks if loan is overdue and applies penalties
export const processLoanPayments = (roomId: string, userId: string, gameState: any, updates: any, logs: string[]) => {
  const loan = gameState.loans?.[userId];
  if (!loan) return;
  
  const player = gameState.players[userId];
  const turnsSinceLoan = (gameState.totalTurns || 0) - loan.turnsTaken;
  
  if (turnsSinceLoan >= loan.turnsDue) {
    // Loan is overdue - force repayment or penalize
    if (player.money >= loan.totalOwed) {
      // Auto-repay
      updates[`gameStates/${roomId}/players/${userId}/money`] = player.money - loan.totalOwed;
      updates[`gameStates/${roomId}/loans/${userId}`] = null;
      logs.push(`${player.username}'s loan was auto-repaid (${loan.totalOwed} Ryō).`);
    } else {
      // Can't pay - increase owed by 25% penalty
      const newOwed = Math.ceil(loan.totalOwed * 1.25);
      updates[`gameStates/${roomId}/loans/${userId}/totalOwed`] = newOwed;
      updates[`gameStates/${roomId}/loans/${userId}/turnsDue`] = loan.turnsDue + 5; // Extension
      logs.push(`${player.username} couldn't repay their loan! Penalty added: now owes ${newOwed} Ryō.`);
    }
  }
};

// Enhanced bankruptcy with cascading resolution
export const handleBankruptcy = async (roomId: string, userId: string, gameState: any, creditorId?: string) => {
  const player = gameState.players[userId];
  const updates: any = {};
  const logs = [...(gameState.logs || [])];
  
  // Step 1: Try to mortgage unmortgaged properties
  const unmortgagedProps = (player.properties || []).filter(
    (id: number) => !(gameState.mortgaged || []).includes(id)
  );
  
  let currentMoney = player.money;
  const newMortgaged = [...(gameState.mortgaged || [])];
  
  for (const propId of unmortgagedProps) {
    if (currentMoney >= 0) break;
    const tile = BOARD_DATA[propId];
    
    // Sell houses first
    const houses = gameState.houses?.[propId] || 0;
    if (houses > 0) {
      const sellValue = houses * ((tile.houseCost || 0) / 2);
      currentMoney += sellValue;
      updates[`rooms/${roomId}/gameState/houses/${propId}`] = 0;
      logs.push(`${player.username} sold ${houses} building(s) on ${tile.name} for ${sellValue} Ryō.`);
    }
    
    // Then mortgage
    if (currentMoney < 0) {
      const mortgageValue = tile.mortgage || (tile.price ? tile.price / 2 : 0);
      currentMoney += mortgageValue;
      newMortgaged.push(propId);
      logs.push(`${player.username} mortgaged ${tile.name} for ${mortgageValue} Ryō.`);
    }
  }
  
  updates[`gameStates/${roomId}/mortgaged`] = newMortgaged;
  updates[`gameStates/${roomId}/players/${userId}/money`] = currentMoney;
  
  // Step 2: If still negative, declare bankruptcy
  if (currentMoney < 0) {
    logs.push(`💀 ${player.username} is BANKRUPT and eliminated!`);
    updates[`rooms/${roomId}/gameState/players/${userId}/isBankrupt`] = true;
    
    // Transfer properties to creditor or bank
    if (creditorId && gameState.players[creditorId]) {
      const creditor = gameState.players[creditorId];
      const combinedProps = [...(creditor.properties || []), ...(player.properties || [])];
      updates[`gameStates/${roomId}/players/${creditorId}/properties`] = combinedProps;
      logs.push(`${player.username}'s properties were seized by ${creditor.username}.`);
    } else {
      // Return to bank - clear ownership
      logs.push(`${player.username}'s properties were returned to the bank.`);
    }
    
    updates[`rooms/${roomId}/gameState/players/${userId}/properties`] = [];
    
    // Clear any loans
    if (gameState.loans?.[userId]) {
      updates[`rooms/${roomId}/gameState/loans/${userId}`] = null;
    }
  }
  
  updates[`gameStates/${roomId}/logs`] = logs.slice(-15);
  await update(ref(db), updates);
  
  return currentMoney < 0; // true if bankrupted
};
