---
num: '03'
name: 'Normalisation'
blurb: 'where the rescaling goes, and what breaks when it moves'
category: 'architectures'
---

Normalisation keeps activations in a range the optimiser can work with. Its placement relative to the residual stream matters more than its exact form — pre-norm trains stably and costs a little expressivity, post-norm the reverse. The entries here concern what can be dropped from the standard recipe without losing the stability it buys.
