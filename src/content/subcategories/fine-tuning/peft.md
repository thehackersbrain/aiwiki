---
num: '02'
name: 'Parameter-efficient methods'
blurb: 'low-rank updates and the arithmetic of merging them'
category: 'fine-tuning'
---

Full fine-tuning updates every weight and needs optimiser state for all of them. The methods here constrain the update to a low-rank or quantised form, which makes tuning cheap, adapters portable, and merging several of them into one model a question with an actual answer.
