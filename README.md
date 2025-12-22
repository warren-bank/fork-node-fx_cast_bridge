<img src="https://github.com/hensm/fx_cast/raw/master/docs/images/preview.png"
     alt="Preview of cast device selection popup"
     align="right"
     width="462">

# [fx_cast](https://github.com/warren-bank/fork-node-fx_cast_bridge/tree/2-fork/main)

A Firefox extension that implements the Chromecast API and exposes it to web apps to enable cast support. Communication with receiver devices is handled by a companion application (bridge).

## Installing

Install the Firefox extension from:
* [releases](https://github.com/hensm/fx_cast/releases) for the original project

Install the companion application (bridge) from:
* `npm`:
  ```bash
    npm install -g '@warren-bank/fx_cast_bridge'
  ```

## Fork

The intended purpose for this fork of the companion application (bridge) is to:
* run it as a pure Javascript application in Node.js
  - in the original project, it is:
    * written in Typescript
    * compiled to Javascript w/ [`tsc`](https://github.com/microsoft/TypeScript)
    * packaged to a native executable w/ [`pkg`](https://github.com/vercel/pkg)
  - the reason it is packaged to a native executable is the way Firefox's built-in [native messaging system](https://wiki.mozilla.org/WebExtensions/Native_Messaging) works
    * this fork disables native messaging, and only runs in [daemon mode](https://github.com/hensm/fx_cast/wiki/daemon)
    * to summarize, this means that:
      - the bridge runs a WebSocket server and listens for incoming connections from the extension
      - the extension needs to be configured to make such a connection w/ the following parameters:
        * enable backup daemon connection?
          - required
          - value: `true`
          - default: `false`
        * host
          - required
          - default: `localhost`
        * port
          - required
          - default: `9556`
        * secure connection?
          - optional
          - default: `false`
        * password
          - optional
          - default: _none_
* replace troublesome dependencies
  - `mdns`
    * its [installation](https://github.com/agnat/node_mdns#installation) requires a compiler toolchain and the installation of 3rd-party libraries

## Usage

1. Start the companion application (bridge):<br>`fx_cast_bridge` &lt;[_options_](https://github.com/hensm/fx_cast/wiki/daemon#options)&gt;
2. Configure the Firefox extension
3. Click on the toolbar button or `Cast...` menu item in the page context menu to open a popup that shows a list of receiver devices, which will allow you to start casting the currently detected app[^cast_app] or media

### Site Whitelist

The extension provides a whitelist for ensuring only trusted sites are allowed to load the cast API and communicate with receiver devices.

Sites may be added to the whitelist, either by clicking one of the whitelist options in the toolbar button context menu whilst visiting the site, or by manually entering a valid [match pattern](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Match_patterns) on the options page.

Whitelisted sites should then display a cast button as in Chrome, provided they're compatible with the extension/Firefox.

## Requirements

* Node.js v16.x.x

## Video Demos

These are somewhat outdated now, but show the basic function of the extension:

[<img width="200" src="https://img.youtube.com/vi/Ex9dWKYguEE/0.jpg" alt="fx_cast Netflix" />](https://www.youtube.com/watch?v=Ex9dWKYguEE)
[<img width="200" src="https://img.youtube.com/vi/16r8lQKeEX8/0.jpg" alt="fx_cast HTML5" />](https://www.youtube.com/watch?v=16r8lQKeEX8)

[^cast_app]: Some sites may only function properly when initiating casting from the in-page player buttons.

## Legal

* copyright: [Matt Hensman](https://github.com/hensm)
* license: [MIT](https://github.com/hensm/fx_cast/blob/50851b48317aba11693ebd378b3e4bb9307db2ff/LICENSE)
