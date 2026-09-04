---
num: '01'
name: 'Attention'
blurb: 'the quadratic core, and the windows and sinks that cheapen it'
category: 'architectures'
---

The operation everything else is arranged around. A token asks every other token a question, weights the answers by how well they match, and sums. The cost of that generosity is quadratic in sequence length, so most of the work here is about giving some of it up on purpose — restricting who may be asked, or sharing the machinery that stores the answers.
