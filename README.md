# Bitcoin Price Ticker (BTC/BRL)

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/acdibmngomngfmgjkghpebfndbhmeabb?label=Chrome%20Web%20Store&color=blue)](https://chrome.google.com/webstore/detail/acdibmngomngfmgjkghpebfndbhmeabb)
[![Chrome Web Store Users](https://img.shields.io/chrome-web-store/users/acdibmngomngfmgjkghpebfndbhmeabb?label=users)](https://chrome.google.com/webstore/detail/acdibmngomngfmgjkghpebfndbhmeabb)
[![Chrome Web Store Rating](https://img.shields.io/chrome-web-store/rating/acdibmngomngfmgjkghpebfndbhmeabb?label=rating)](https://chrome.google.com/webstore/detail/acdibmngomngfmgjkghpebfndbhmeabb)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A simple, lightweight, and reliable Chrome extension that displays the current price of Bitcoin (BTC) in Brazilian Real (BRL) directly on your browser's toolbar.

## Extension Preview

<p align="center">
  <img src="/assets/banner-bitcoin-brazilian-real-price-ticker.png" alt="Bitcoin BRL Ticker Banner" width="348"/>
</p>
<p align="center">
  &nbsp;&nbsp;    
  <img src="/assets/how-to-use-extension-chrome-btc-brl-dark.png" alt="BTC/BRL Ticker Dark Mode" width="348"/>
  &nbsp;&nbsp;
  <img src="/assets/how-to-use-extension-chrome-btc-brl-light.png" alt="BTC/BRL Ticker Light Mode" width="348"/>
</p>


## Features

-   **Real-Time Price:** Get the BTC/BRL price updated every 60 seconds.
-   **Quick View Badge:** The extension icon shows a compact price (e.g., `588k`, `1.2m`).
-   **Detailed Tooltip:** Hover over the icon to see:
    -   The current price in BRL.
    -   The price from exactly 24 hours ago.
    -   The 24-hour price variation percentage (e.g., `↑ 2.52%`).
-   **Quick Access to Trading:** Click the icon to open the BTC/BRL trading page on Binance.
-   **Reliable Data:** Uses the Binance API as the primary source and CoinGecko as a fallback for maximum uptime.
-   **Plug-and-Play:** No configuration needed. Just install and go.

## Installation

### From the Chrome Web Store (Recommended)

1.  Visit the BTC BRL Price Ticker page on the [Chrome Web Store](https://chrome.google.com/webstore/detail/acdibmngomngfmgjkghpebfndbhmeabb).
2.  Click "Add to Chrome".
3.  Pin the extension to your toolbar for easy access!

### Manual Installation (for Development)

1.  **Download:** Clone or download this repository as a ZIP file and unzip it.
    ```bash
    git clone https://github.com/ricardodelfino/btc-brl-price-ticker.git
    ```
2.  **Open Chrome Extensions:** Open Chrome and navigate to `chrome://extensions`.
3.  **Enable Developer Mode:** Turn on the "Developer mode" toggle in the top-right corner.
4.  **Load Unpacked:** Click the "Load unpacked" button and select the `btc-brl-price-ticker` directory you just downloaded.
5.  The extension icon will appear in your toolbar.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
