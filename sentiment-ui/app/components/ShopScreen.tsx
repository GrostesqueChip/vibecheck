"use client";

import { motion } from "framer-motion";
import { ConsumeableCard } from "./ConsumeableCard";
import { JokerCard } from "./JokerCard";
import type { GameState, VoucherId } from "../types/game";

interface ShopScreenProps {
  state: GameState;
  onBuyJoker: (jokerId: string) => void;
  onBuyTarot: () => void;
  onBuyPlanet: () => void;
  onBuyVoucher: (voucherId: VoucherId) => void;
  onSellJoker: (jokerId: string) => void;
  onNextBlind: () => void;
}

export function ShopScreen({
  state,
  onBuyJoker,
  onBuyTarot,
  onBuyPlanet,
  onBuyVoucher,
  onSellJoker,
  onNextBlind,
}: ShopScreenProps) {
  return (
    <main className="screen-shell">
      <div className="screen-heading">
        <h2>The Shop</h2>
        <p>Good Vibes: 💫{state.goodVibes}</p>
      </div>

      <section className="shop-panel">
        <div className="shop-grid">
          {state.shop.jokerOffers.map((joker) => (
            <motion.div key={joker.id} layout className="shop-slot">
              <JokerCard joker={joker} showCost />
              <button className="menu-button menu-button-primary" onClick={() => onBuyJoker(joker.id)} type="button">
                Buy
              </button>
            </motion.div>
          ))}
        </div>

        <div className="shop-subgrid">
          <div className="shop-slot">
            <ConsumeableCard item={state.shop.tarotOffer} showCost />
            <button className="menu-button" onClick={onBuyTarot} type="button">
              Tarot Pack
            </button>
          </div>
          <div className="shop-slot">
            <ConsumeableCard item={state.shop.planetOffer} showCost />
            <button className="menu-button" onClick={onBuyPlanet} type="button">
              Planet Pack
            </button>
          </div>
          <div className="shop-slot voucher-slot">
            <div className="voucher-card">
              <div className="voucher-card-name">{state.shop.voucherOffer?.name ?? "Voucher Sold Out"}</div>
              <div className="voucher-card-text">
                {state.shop.voucherOffer?.description ?? "Come back after the next Blind."}
              </div>
              <div className="voucher-card-cost">
                {state.shop.voucherOffer ? `💫${state.shop.voucherOffer.cost}` : "----"}
              </div>
            </div>
            <button
              className="menu-button"
              onClick={() => state.shop.voucherOffer && onBuyVoucher(state.shop.voucherOffer.id)}
              type="button"
              disabled={!state.shop.voucherOffer}
            >
              Buy Voucher
            </button>
          </div>
        </div>

        <div className="shop-holdings">
          <div className="holdings-title">Held Jokers</div>
          <div className="joker-row">
            {Array.from({ length: state.jokerSlots }).map((_, index) => {
              const joker = state.jokers[index];
              return (
                <JokerCard
                  key={joker?.id ?? `empty-${index}`}
                  joker={joker}
                  onSell={joker ? () => onSellJoker(joker.id) : null}
                />
              );
            })}
          </div>
        </div>

        <button className="menu-button menu-button-primary" onClick={onNextBlind} type="button">
          Next Blind
        </button>
      </section>
    </main>
  );
}
