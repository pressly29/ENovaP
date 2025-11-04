# Advanced Strategies Bots – User Guide

This guide explains how to load and operate the prebuilt Advanced Strategies (XML) bots included with the project. It summarizes what each bot does, the key inputs you can tweak, and the basic workflow in the app.

> Important
>
> -   Always test on a virtual account first.
> -   Set modest stake and clear stop-loss/target levels before going live.
> -   Bots operate on Deriv DBot-style logic blocks (Blockly). Understanding the blocks helps you customize safely.

## Where to find and load the bots

-   Open the app, go to Advanced Strategies.
-   Pick a bot from the list and click Load.
-   Adjust parameters (variables) if needed, then Start.
-   The workspace will remain empty if an XML fails to load; fix inputs or pick a different bot and try again.

Common building blocks you’ll see:

-   Market selection (e.g., Synthetic → Random Index → 1HZxxV)
-   Trade class: Digits → (Over/Under, Even/Odd)
-   Duration (usually 1 tick)
-   Amount (stake) and optional martingale logic
-   Before Purchase / During Purchase / After Purchase stacks to control flow
-   read_details(4) = profit/loss for the last contract
-   total_profit = cumulative P/L for the session
-   notify/text_print for on-screen feedback

---

## Bots included

### 1) AlgoSniper

-   Symbol/Type
    -   Market: Synthetic Index → Random Index → 1HZ25V
    -   Trade: Digits → Over/Under, Purchase DIGITOVER
    -   Duration: 1 tick
-   Key Variables (you can edit their default values on the canvas)
    -   Amount: base stake (default 4)
    -   Target Level: stop when total_profit ≥ this (default 10)
    -   Risk Limit: trigger protective action when total_profit ≤ −Risk Limit (default 10)
    -   Entry Zone: target last digit to enter (default 7)
    -   AutoRecover: multiplier to recover after a loss (default 2)
-   How it works
    -   Loops and waits for an “entry” condition: last_digit == Entry Zone.
    -   Buys DIGITOVER when condition meets.
    -   After purchase:
        -   If total_profit ≥ Target Level → prints success message.
        -   If total_profit ≤ −Risk Limit → prints “System Guard Active” warning.
        -   Else if win → reset Amount to DollarStake (initial value) and trade again.
        -   Else if loss → Amount = Amount × AutoRecover and trade again.
-   Tips
    -   Entry Zone drives entries; keep it stable while you test.
    -   AutoRecover > 1 implies martingale-like risk; start conservatively.

### 2) SignalSniperAutoBot

-   Symbol/Type
    -   Market: Synthetic Index → Random Index → 1HZ100V
    -   Trade: Digits → Even/Odd (purchase DIGITEVEN)
    -   Duration: 1 tick
-   Key Variables
    -   Loss value: threshold used to reset staking when losses accumulate (default 500)
    -   Income Target: total_profit threshold to keep trading until reached (default 2)
    -   Trade amount: primary stake variable (default 2)
    -   Trade amount 2: fallback/reset stake (default 2)
-   How it works
    -   Buys DIGITEVEN with current Trade amount.
    -   After purchase:
        -   On win → show “Analysing: …” notification and set Trade amount = Trade amount 2.
        -   On loss → show warn notification; increase Trade amount by a function of abs(contract profit). If loss magnitude grows past Loss value, reset Trade amount back to Trade amount 2.
    -   Prints periodic summaries and keeps trading while total_profit < Income Target; otherwise prints celebration text.
-   Tips
    -   If you want fixed stakes, keep Trade amount = Trade amount 2.
    -   Tuning Loss value higher lowers the chance of early stake reset.

### 3) BRAMEVENODDPRINTER

-   Symbol/Type
    -   Market: Synthetic Index → Random Index → 1HZ10V
    -   Trade: Digits → Even/Odd (purchase DIGITODD)
    -   Duration: 1 tick
-   Key Variables
    -   Profit Target (default 10)
    -   Initial Amount (default 2.5)
    -   Martingale (default 1): factor used in stake adjustments
    -   Loss Count / Next Trade Condition (internal toggles)
    -   Win Amount (usually Initial Amount)
-   How it works
    -   Tracks Contract Detail Profit and classifies results into win/loss.
    -   On win: resets Loss Count to 0, stake back to Initial Amount.
    -   On loss: increments Loss Count, modifies stake with a function tied to abs(contract profit) and Martingale.
    -   Safety/Flow controls:
        -   When Loss Count == 2, sets Next Trade Condition flag for the next purchase path.
        -   At 4 consecutive losses, prints stop-loss style messages and summaries (protecting account).
    -   Continues while profit checks and flow conditions allow.
-   Tips
    -   Leave Martingale at 1 while you explore the flow; increase cautiously.
    -   If you see frequent loss streak warnings, lower the initial stake.

### 4) DollarPrintAi

-   Symbol/Type
    -   Market: Synthetic Index → Random Index → 1HZ75V
    -   Trade: Digits → Even/Odd (purchase DIGITEVEN)
    -   Duration: 1 tick
-   Parameters (procedure “Daily Profit’s System”)
    -   Target Profit: session take-profit (e.g., 1)
    -   Stop Loss: session stop-loss (e.g., 100, applied as negative threshold)
    -   First Stake: initial stake (e.g., 2)
    -   Martingale Factor: stake multiplier (e.g., 1 for off, >1 for on)
    -   Martingale Level: max martingale depth (e.g., 1)
    -   Do Martingale After: how many losses before starting martingale (e.g., 1)
-   How it works
    -   Initializes tracking: Profit, Win/Loss counts, stake (Stake), first stake (FirstStake), thresholds (TargetProfit/Stoploss).
    -   After each trade:
        -   Updates Profit with last contract’s profit (read_details(4)).
        -   If win → increments Win Count, resets Loss Count and Stake to FirstStake.
        -   If loss → increments Loss Count; if Loss Count ≥ MartiStart and ≤ MartiLossLevel, multiplies Stake by MartiFactor; otherwise shows “Martingale Reset” and resets Stake.
        -   Checks take-profit: if Profit ≥ TargetProfit, prints a “Take Profit Triggered Successfully!” message.
        -   Checks stop-loss: if Profit ≤ Stoploss (negative), prints a stop-loss notice.
        -   Otherwise prints a running P/L summary and continues.
-   Tips
    -   Set Martingale Factor = 1 to disable martingale while you confirm logic.
    -   Keep Target Profit small and Stop Loss absolute value larger for shorter sessions.

---

## General usage tips

-   Duration and symbol
    -   These bots are tuned for 1-tick digit contracts on specific Random Index symbols. Changing symbols/intervals changes the behavior.
-   Stake sizing
    -   Start very small. Martingale-like settings can grow stakes quickly.
-   Targets and limits
    -   Use Target/Stop parameters to define session boundaries.
    -   Watch total_profit; it’s the primary session KPI used by most bots.
-   Notifications & logs
    -   Bots print and notify on wins, losses, P/L boundaries, resets. Use these to understand decisions.

## Troubleshooting

-   “XML file contains unsupported elements”
    -   We’ve normalized known legacy shadows; if you still see this, tell us the bot name and the error text so we can add a safe mapping.
-   Workspace empty after load
    -   That’s by design when a load fails. Re-open the bot or try another XML.
-   Blocks missing or unfamiliar
    -   apollo_purchase is the Purchase block alias.
    -   read_details(4) is contract profit; total_profit is the session P/L.

## Disclaimer

Trading involves risk. The bots are provided for educational purposes only. Past performance doesn’t guarantee future results. Always test on virtual funds and manage your risk.
