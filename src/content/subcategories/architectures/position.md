---
num: '02'
name: 'Position'
blurb: 'injecting order into an operation that has none'
category: 'architectures'
---

Attention is permutation-invariant: shuffle the tokens and the maths does not notice. Position has to be added back by hand, and the choice of how determines whether the model still works at four times the context it was trained on. The schemes here differ mainly in what they do off the end of that training distribution.
