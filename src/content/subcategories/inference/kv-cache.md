---
num: '01'
name: 'KV cache'
blurb: 'the memory that decoding is really bound by'
category: 'inference'
---

Autoregressive decoding is not compute-bound; it is bound by moving cached keys and values. Shrinking that cache, sharing it across heads, paging it, or reusing it across requests are all the same optimisation approached from different sides.
