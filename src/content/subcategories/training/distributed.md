---
num: '05'
name: 'Distributed'
blurb: 'splitting a model that does not fit on one device'
category: 'training'
---

Once the model, its gradients and its optimiser state exceed a single accelerator, the question becomes what to shard and when to gather it again. The answers differ in how much communication they add to buy how much memory back.
