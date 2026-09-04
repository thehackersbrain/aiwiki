---
num: '03'
name: 'Quantisation'
blurb: 'fewer bits per weight, and where the error goes'
category: 'inference'
---

Weights carry more precision than inference needs. The interesting part is not the rounding but the error compensation — deciding which weights to round first and how to adjust the rest so the layer's output survives.
