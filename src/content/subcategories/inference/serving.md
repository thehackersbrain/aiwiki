---
num: '05'
name: 'Serving'
blurb: 'scheduling many requests against one set of weights'
category: 'inference'
---

A served model spends its time on a stream of requests of wildly different lengths. Throughput is decided by the scheduler — by whether a finished sequence's slot can be refilled without waiting for the rest of its batch.
