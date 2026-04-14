import { ref, update, get } from 'firebase/database';
import { db } from '../firebase/config';
import { BOARD_DATA, CHANCE_CARDS, CHEST_CARDS } from './boardData';

export const rollDice = async (roomId: string, userId: string, gameState: any) => {
  // Guard: do not roll if a dice result already exists for this turn
  if (gameState?.diceResult) return;
  const die1 = Math.floor(Math.random() * 6) + 1;
  const die2 = Math.floor(Math.random() * 6) + 1;
  const total = die1 + die2;
  const isDouble = die1 === die2;

  const player = gameState.players[userId];
  let newPosition = player.position;
  let newMoney = player.money;
  let inJail = player.inJail || false;
  let jailTurns = player.jailTurns || 0;
  let logs = [...(gameState.logs || [])];

  logs.push(`${player.username} rolled a ${die1} and ${die2} (${total}).`);

  if (inJail) {
    if (isDouble) {
      logs.push(`${player.username} rolled doubles and escaped Jail!`);
      inJail = false;
      jailTurns = 0;
    } else {
      jailTurns += 1;
      if (jailTurns >= 3) {
        logs.push(`${player.username} paid 50 Ryō to escape Jail.`);
        newMoney -= 50;
        inJail = false;
        jailTurns = 0;
      } else {
        logs.push(`${player.username} is still in Jail.`);
        const updates = {
          [`gameStates/${roomId}/diceResult`]: [die1, die2],
          [`gameStates/${roomId}/players/${userId}/jailTurns`]: jailTurns,
          [`gameStates/${roomId}/logs`]: logs.slice(-15)
        };
        await update(ref(db), updates);
        return; // End turn logic will handle the rest
      }
    }
  }

  newPosition += total;

  if (newPosition >= 40) {
    newPosition -= 40;
    newMoney += 200;
    logs.push(`${player.username} passed GO and collected 200 Ryō.`);
  }

  let landedTile = BOARD_DATA[newPosition];
  logs.push(`${player.username} landed on ${landedTile.name}.`);

  // Handle tile logic (rent, tax, etc.)
  const updates: any = {
    [`gameStates/${roomId}/diceResult`]: [die1, die2],
    [`gameStates/${roomId}/lastLog`]: `${player.username} rolled ${die1} + ${die2}`,
    [`gameStates/${roomId}/battleTriggered`]: false,
    [`gameStates/${roomId}/players/${userId}/position`]: newPosition,
    [`gameStates/${roomId}/players/${userId}/money`]: newMoney,
    [`gameStates/${roomId}/players/${userId}/inJail`]: inJail,
    [`gameStates/${roomId}/players/${userId}/jailTurns`]: jailTurns,
  };

  // If it's a tax tile
  if (landedTile.type === 'tax' && landedTile.price) {
    updates[`gameStates/${roomId}/players/${userId}/money`] = newMoney - landedTile.price;
    logs.push(`${player.username} paid ${landedTile.price} Ryō in taxes.`);
  }

  // If it's Go To Jail
  if (landedTile.type === 'gotojail') {
    updates[`gameStates/${roomId}/players/${userId}/position`] = 10;
    updates[`gameStates/${roomId}/players/${userId}/inJail`] = true;
    logs.push(`${player.username} was sent to Jail!`);
  }

  // Handle Chance / Community Chest
  if (landedTile.type === 'chance' || landedTile.type === 'chest') {
    const cards = landedTile.type === 'chance' ? CHANCE_CARDS : CHEST_CARDS;
    const card = cards[Math.floor(Math.random() * cards.length)];
    logs.push(`${player.username} drew a card: "${card.text}"`);

    // Set active card for UI popup
    const cardImageIndex = (card.id % 8) || 8;
    const cardImage = cardImageIndex === 1 ? '/img/Card/Card1.png' : `/img/Card/CARD${cardImageIndex}.png`;
    
    updates[`gameStates/${roomId}/activeCard`] = {
      ...card,
      type: landedTile.type,
      userId,
      image: cardImage,
      timestamp: Date.now()
    };

    if (card.action === 'money' && card.amount) {
      newMoney += card.amount;
      updates[`gameStates/${roomId}/players/${userId}/money`] = newMoney;
    } else if (card.action === 'move' && card.position !== undefined) {
      if (card.position < newPosition && card.position === 0) {
        newMoney += 200; // Passed GO
        logs.push(`${player.username} passed GO and collected 200 Ryō.`);
      }
      newPosition = card.position;
      updates[`gameStates/${roomId}/players/${userId}/position`] = newPosition;
      updates[`gameStates/${roomId}/players/${userId}/money`] = newMoney;
      landedTile = BOARD_DATA[newPosition]; // Update landed tile for potential rent
    } else if (card.action === 'jail') {
      newPosition = 10;
      updates[`gameStates/${roomId}/players/${userId}/position`] = newPosition;
      updates[`gameStates/${roomId}/players/${userId}/inJail`] = true;
    }
  }

  // Handle Rent (after potential card movement)
  if (landedTile.type === 'property' || landedTile.type === 'railroad' || landedTile.type === 'utility') {
    const ownerId = Object.keys(gameState.players).find(id =>
      gameState.players[id].properties?.includes(newPosition)
    );

    if (ownerId && ownerId !== userId) {
      // Skip rent if mortgaged
      if (gameState.mortgaged?.includes(newPosition)) {
        logs.push(`${landedTile.name} is mortgaged. No rent due!`);
      } else {
        let rentAmount = 0;
        const ownerProperties = gameState.players[ownerId].properties || [];

        if (landedTile.type === 'property' && landedTile.rent) {
          const houses = gameState.houses?.[newPosition] || 0;
          if (houses === 0) {
            const colorSet = BOARD_DATA.filter(t => t.color === landedTile.color).map(t => t.id);
            const hasMonopoly = colorSet.every(id => ownerProperties.includes(id));
            rentAmount = hasMonopoly ? landedTile.rent[0] * 2 : landedTile.rent[0];
          } else {
            rentAmount = landedTile.rent[houses];
          }
        } else if (landedTile.type === 'railroad' && landedTile.rent) {
          const railroadsOwned = BOARD_DATA.filter(t => t.type === 'railroad' && ownerProperties.includes(t.id)).length;
          rentAmount = landedTile.rent[railroadsOwned - 1] || 25;
        } else if (landedTile.type === 'utility') {
          const utilitiesOwned = BOARD_DATA.filter(t => t.type === 'utility' && ownerProperties.includes(t.id)).length;
          const multiplier = utilitiesOwned === 2 ? 10 : 4;
          rentAmount = total * multiplier;
        }

        newMoney -= rentAmount;
        updates[`gameStates/${roomId}/players/${userId}/money`] = newMoney;
        updates[`gameStates/${roomId}/players/${ownerId}/money`] = gameState.players[ownerId].money + rentAmount;
        logs.push(`${player.username} paid ${rentAmount} Ryō rent to ${gameState.players[ownerId].username}.`);
      }
    }
  }

  // Check Bankruptcy
  if (newMoney < 0) {
    logs.push(`${player.username} is BANKRUPT!`);
    updates[`gameStates/${roomId}/players/${userId}/isBankrupt`] = true;

    // Return properties and houses to bank
    if (player.properties && player.properties.length > 0) {
      player.properties.forEach((propId: number) => {
        if (gameState.houses?.[propId]) {
          updates[`gameStates/${roomId}/houses/${propId}`] = null;
        }
        if (gameState.mortgaged?.includes(propId)) {
          // Remove from mortgaged list
          const mortgaged = (gameState.mortgaged || []).filter((id: number) => id !== propId);
          updates[`gameStates/${roomId}/mortgaged`] = mortgaged;
        }
      });
      updates[`gameStates/${roomId}/players/${userId}/properties`] = [];
      logs.push(`${player.username}'s properties have been returned to the bank.`);
    }
  }

  if (isDouble && newMoney >= 0) {
    logs.push(`${player.username} rolled doubles!`);
  }

  updates[`gameStates/${roomId}/logs`] = logs.slice(-15); // Keep last 15 logs

  await update(ref(db), updates);
};

export const mortgageProperty = async (roomId: string, userId: string, propertyId: number, gameState: any) => {
  const player = gameState.players[userId];
  const tile = BOARD_DATA[propertyId];
  const currentHouses = gameState.houses?.[propertyId] || 0;

  if (currentHouses > 0) {
    // Cannot mortgage if there are houses
    return;
  }

  const mortgageValue = tile.mortgage || (tile.price ? tile.price / 2 : 0);
  const mortgaged = [...(gameState.mortgaged || []), propertyId];

  const updates = {
    [`gameStates/${roomId}/players/${userId}/money`]: player.money + mortgageValue,
    [`gameStates/${roomId}/mortgaged`]: mortgaged,
    [`gameStates/${roomId}/logs`]: [...(gameState.logs || []), `${player.username} mortgaged ${tile.name} for ${mortgageValue} Ryō.`].slice(-15)
  };
  await update(ref(db), updates);
};

export const unmortgageProperty = async (roomId: string, userId: string, propertyId: number, gameState: any) => {
  const player = gameState.players[userId];
  const tile = BOARD_DATA[propertyId];
  const mortgageValue = tile.mortgage || (tile.price ? tile.price / 2 : 0);
  const unmortgageCost = Math.ceil(mortgageValue * 1.1); // 10% interest

  if (player.money >= unmortgageCost) {
    const mortgaged = (gameState.mortgaged || []).filter((id: number) => id !== propertyId);
    const updates = {
      [`gameStates/${roomId}/players/${userId}/money`]: player.money - unmortgageCost,
      [`gameStates/${roomId}/mortgaged`]: mortgaged,
      [`gameStates/${roomId}/logs`]: [...(gameState.logs || []), `${player.username} unmortgaged ${tile.name} for ${unmortgageCost} Ryō.`].slice(-15)
    };
    await update(ref(db), updates);
  }
};

export const sellHouse = async (roomId: string, userId: string, propertyId: number, gameState: any) => {
  const player = gameState.players[userId];
  const tile = BOARD_DATA[propertyId];
  const currentHouses = gameState.houses?.[propertyId] || 0;

  if (currentHouses > 0) {
    const sellValue = (tile.houseCost || 0) / 2;
    const updates = {
      [`gameStates/${roomId}/players/${userId}/money`]: player.money + sellValue,
      [`gameStates/${roomId}/houses/${propertyId}`]: currentHouses - 1,
      [`gameStates/${roomId}/logs`]: [...(gameState.logs || []), `${player.username} sold a ${currentHouses === 5 ? 'hotel' : 'house'} on ${tile.name} for ${sellValue} Ryō.`].slice(-15)
    };
    await update(ref(db), updates);
  }
};

export const buyHouse = async (roomId: string, userId: string, propertyId: number, gameState: any) => {
  const player = gameState.players[userId];
  const tile = BOARD_DATA[propertyId];

  if (!tile || tile.type !== 'property' || !tile.houseCost) return;
  if (!player.properties?.includes(propertyId)) return;

  const colorSet = BOARD_DATA.filter(t => t.color === tile.color).map(t => t.id);
  const hasMonopoly = colorSet.every(id => player.properties?.includes(id));

  if (!hasMonopoly) return;

  const currentHouses = gameState.houses?.[propertyId] || 0;
  if (currentHouses >= 5) return; // 5 = hotel

  if (player.money >= tile.houseCost) {
    const isHotel = currentHouses === 4;
    const updates = {
      [`gameStates/${roomId}/players/${userId}/money`]: player.money - tile.houseCost,
      [`gameStates/${roomId}/houses/${propertyId}`]: currentHouses + 1,
      [`gameStates/${roomId}/logs`]: [...(gameState.logs || []), `${player.username} built a ${isHotel ? 'hotel' : 'house'} on ${tile.name}.`].slice(-15)
    };
    await update(ref(db), updates);
  }
};

export const payJailFine = async (roomId: string, userId: string, gameState: any) => {
  const player = gameState.players[userId];
  if (player.inJail && player.money >= 50) {
    const updates = {
      [`gameStates/${roomId}/players/${userId}/money`]: player.money - 50,
      [`gameStates/${roomId}/players/${userId}/inJail`]: false,
      [`gameStates/${roomId}/players/${userId}/jailTurns`]: 0,
      [`gameStates/${roomId}/logs`]: [...(gameState.logs || []), `${player.username} paid 50 Ryō to escape Jail.`].slice(-15)
    };
    await update(ref(db), updates);
  }
};

export const buyProperty = async (roomId: string, userId: string, gameState: any) => {
  const player = gameState.players[userId];
  const tile = BOARD_DATA[player.position];

  if ((tile.type === 'property' || tile.type === 'railroad' || tile.type === 'utility') && tile.price) {
    if (player.money >= tile.price) {
      const propertyImageIndex = (player.position % 7) + 1;
      const updates = {
        [`gameStates/${roomId}/players/${userId}/money`]: player.money - tile.price,
        [`gameStates/${roomId}/players/${userId}/properties`]: [...(player.properties || []), player.position],
        [`gameStates/${roomId}/activePurchase`]: {
          propertyId: player.position,
          userId,
          image: `/img/Property Title/PROPERTY${propertyImageIndex}.png`,
          timestamp: Date.now()
        },
        [`gameStates/${roomId}/logs`]: [...(gameState.logs || []), `${player.username} bought ${tile.name} for ${tile.price} Ryō.`].slice(-15)
      };
      await update(ref(db), updates);
    }
  }
};

export const endTurn = async (roomId: string, gameState: any) => {
  const turnOrder: string[] = gameState.turnOrder || [];
  const players = gameState.players || {};
  const currentIndex: number = gameState.currentTurnIndex ?? 0;

  const currentPlayerId = turnOrder[currentIndex];
  const currentPlayer = players[currentPlayerId];
  const isDouble = gameState.diceResult &&
    gameState.diceResult[0] === gameState.diceResult[1];

  // Check if game is over first (only 1 non-bankrupt player left)
  const activePlayers = turnOrder.filter((id: string) => players[id] && !players[id].isBankrupt);
  if (activePlayers.length <= 1) {
    const winner = players[activePlayers[0]];
    const updates = {
      [`rooms/${roomId}/status`]: 'finished',
      [`gameStates/${roomId}/isGameOver`]: true,
      [`gameStates/${roomId}/logs`]: [...(gameState.logs || []), `Game Over! ${winner?.username || 'Unknown'} wins!`].slice(-15)
    };
    await update(ref(db), updates);
    return;
  }

  // If doubles rolled and current player not bankrupt, they roll again (same index, just clear dice)
  let actualNextIndex: number;
  if (isDouble && currentPlayer && !currentPlayer.isBankrupt) {
    actualNextIndex = currentIndex; // same player goes again
  } else {
    actualNextIndex = (currentIndex + 1) % turnOrder.length;
  }

  // Skip bankrupt players (with null-safety)
  let loopCount = 0;
  while (
    loopCount < turnOrder.length &&
    players[turnOrder[actualNextIndex]] &&
    players[turnOrder[actualNextIndex]].isBankrupt
  ) {
    actualNextIndex = (actualNextIndex + 1) % turnOrder.length;
    loopCount++;
  }

  // Safety: if loopCount exhausted, game is over
  if (loopCount >= turnOrder.length) {
    await update(ref(db), {
      [`rooms/${roomId}/status`]: 'finished',
      [`gameStates/${roomId}/isGameOver`]: true,
    });
    return;
  }

  const nextPlayerName = players[turnOrder[actualNextIndex]]?.username || 'Unknown';
  const totalTurns = (gameState.totalTurns || 0) + 1;
  const isInterestTurn = totalTurns % 10 === 0;

  const updates: any = {
    [`gameStates/${roomId}/currentTurnIndex`]: actualNextIndex,
    [`gameStates/${roomId}/diceResult`]: null,
    [`gameStates/${roomId}/activeCard`]: null,
    [`gameStates/${roomId}/activePurchase`]: null,
    [`gameStates/${roomId}/battleTriggered`]: false,
    [`gameStates/${roomId}/totalTurns`]: totalTurns,
    [`gameStates/${roomId}/turnStartedAt`]: Date.now(),
    [`gameStates/${roomId}/logs`]: [...(gameState.logs || []), {
      type: 'system',
      text: `Turn ends. ${nextPlayerName}'s mission begins.`,
      timestamp: Date.now()
    }].slice(-15)
  };

  if (isInterestTurn) {
    Object.keys(players).forEach(pId => {
      const p = players[pId];
      if (!p.isBankrupt) {
        const interest = Math.floor(p.money * 0.05);
        updates[`gameStates/${roomId}/players/${pId}/money`] = p.money + interest;
      }
    });
    updates[`gameStates/${roomId}/logs`] = [...updates[`gameStates/${roomId}/logs`], 'The Village Bank granted 5% interest to all Shinobi!'].slice(-15);
  }

  await update(ref(db), updates);
};

export const startAuction = async (roomId: string, propertyId: number, gameState: any) => {
  const updates = {
    [`gameStates/${roomId}/auction`]: {
      propertyId,
      currentBid: 0,
      highestBidder: null,
      endTime: Date.now() + 15000 // 15 seconds auction
    },
    [`gameStates/${roomId}/logs`]: [...(gameState.logs || []), `Auction started for ${BOARD_DATA[propertyId].name}!`].slice(-15)
  };
  await update(ref(db), updates);
};

export const placeBid = async (roomId: string, userId: string, amount: number, gameState: any) => {
  const auction = gameState.auction;
  if (!auction || amount <= auction.currentBid || amount > (gameState.players[userId].money || 0)) return;

  const updates = {
    [`gameStates/${roomId}/auction/currentBid`]: amount,
    [`gameStates/${roomId}/auction/highestBidder`]: userId,
  };
  await update(ref(db), updates);
};
