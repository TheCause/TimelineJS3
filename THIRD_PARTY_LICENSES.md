# Third-Party Licenses

This project bundles runtime dependencies whose licenses require attribution.
Per-bundle license notices are generated automatically by webpack/terser at
build time and emitted alongside each bundle as a `.LICENSE.txt` file. The
sections below aggregate those notices for documentation purposes; the
authoritative copies remain `dist/js/*.LICENSE.txt`.

## Bundle: `dist/js/timeline.js` (vanilla)

### DOMPurify 3.x — Apache-2.0 OR MPL-2.0

> Copyright © Cure53 and other contributors
> https://github.com/cure53/DOMPurify

Dual-licensed. We rely on the MPL-2.0 grant, which is compatible with this
project's MPL-2.0 license.

## Bundle: `dist/js/timeline.react.js` (React skins)

Includes everything from the vanilla bundle, plus the following:

### React 18 — MIT

> Copyright © Meta Platforms, Inc. and affiliates.
> https://github.com/facebook/react

Covers `react`, `react-dom`, `react-jsx-runtime`, and `scheduler`.

```
MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

## Compatibility note

MPL-2.0 (this project) and MIT / Apache-2.0 (dependencies) are compatible
under combined distribution. Per MIT, the React copyright notice is
preserved in the bundle's `.LICENSE.txt` sidecar.
