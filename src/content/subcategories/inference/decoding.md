---
num: '02'
name: 'Decoding'
blurb: 'turning a distribution into a token, and the shortcuts around it'
category: 'inference'
---

Every generated token is a choice made from a distribution, and the sampling rule shapes output quality as much as the model does. Beyond the choice itself, the entries here cover the trick of letting a smaller model guess ahead and verifying its guesses in parallel.
