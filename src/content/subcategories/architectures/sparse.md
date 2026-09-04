---
num: '05'
name: 'Sparse blocks'
blurb: 'conditional compute: more parameters, the same FLOPs'
category: 'architectures'
---

If only a fraction of the network runs for any given token, parameter count and compute cost decouple. The difficulty is not the idea but the routing — deciding which fraction, keeping the decision differentiable, and stopping every token from choosing the same expert.
