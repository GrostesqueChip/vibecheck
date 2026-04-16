"use client";

import { BackgroundSwirl } from "./components/BackgroundSwirl";
import { BlindSelect } from "./components/BlindSelect";
import { GameScreen } from "./components/GameScreen";
import { MainMenu } from "./components/MainMenu";
import { RunSummary } from "./components/RunSummary";
import { ShopScreen } from "./components/ShopScreen";
import { useGameState } from "./hooks/useGameState";

export default function Home() {
  const {
    state,
    startNewRun,
    setScreen,
    selectBlind,
    skipBlind,
    resolveHand,
    useConsumable,
    buyJoker,
    buyTarot,
    buyPlanet,
    buyVoucher,
    sellJoker,
    leaveShop,
  } = useGameState();

  let content = null;

  if (state.screen === "menu" || state.screen === "collection" || state.screen === "high-scores") {
    content = (
      <MainMenu
        mode={state.screen}
        achievements={state.achievements}
        discoveredJokers={state.discoveredJokers}
        highScores={state.highScores}
        onNewRun={startNewRun}
        onShowCollection={() => setScreen("collection")}
        onShowHighScores={() => setScreen("high-scores")}
        onBack={() => setScreen("menu")}
      />
    );
  } else if (state.screen === "blind-select") {
    content = <BlindSelect state={state} onSelect={selectBlind} onSkip={skipBlind} />;
  } else if (state.screen === "game") {
    content = <GameScreen state={state} onResolveHand={resolveHand} onUseConsumable={useConsumable} />;
  } else if (state.screen === "shop") {
    content = (
      <ShopScreen
        state={state}
        onBuyJoker={buyJoker}
        onBuyTarot={buyTarot}
        onBuyPlanet={buyPlanet}
        onBuyVoucher={buyVoucher}
        onSellJoker={sellJoker}
        onNextBlind={leaveShop}
      />
    );
  } else if (state.screen === "summary") {
    content = <RunSummary summary={state.currentSummary} onNewRun={startNewRun} onMenu={() => setScreen("menu")} />;
  }

  return (
    <div className="app-shell">
      <BackgroundSwirl />
      <div className="app-frame">{content}</div>
    </div>
  );
}
