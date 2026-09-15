---
layout: paper
permalink: /papers/zoaf/
title: "ZOAF: Towards Efficient Zeroth-Order Optimization for Analog/RF Circuit Design"
author_profile: false
paper:
  short: ZOAF
  authors:
    - Liyan Tan
    - Yequan Zhao
    - Jinming Lu
    - Ben F. Jamroz
    - Ari Feldman
    - Zheng Zhang
  venue: "Under review"
  venue_meta: "arXiv preprint"
  year: 2026
  date: "2026-06-01"
  arxiv: "2606.02869"
  doi: "10.48550/arXiv.2606.02869"
  code: "https://github.com/LiyanTan111/ZOAF"
  tldr: "Analog/RF circuit optimizers usually have to choose between expensive surrogate models and slow evolutionary search. ZOAF instead recovers descent directions straight from a handful of black-box simulations, reaching convergence with 1.3–3.8× fewer simulator calls."
  problem: "Analog/RF simulators are closed black boxes, so no gradient is available. Surrogate models are costly to fit and hyperparameter-sensitive; population heuristics burn through the simulator budget before converging."
  method: "ZOAF recovers descent directions from a handful of simulations — no surrogate. A hybrid schedule switches from random-direction exploration to coordinate-wise refinement, one-shot quasi-random multi-start concentrates the budget, and a sliding-window monitor handles early stopping and keeps designs feasible."
  result: "Best median value on every reported figure of merit across three schematics — up to an order of magnitude better median peaking on a 22-parameter amplifier — with the most robust worst case across seeds and 1.3–3.8× fewer simulator calls to convergence."
  figures:
    - src: /images/papers/zoaf-method.png
      kind: method
      alt: "Multi-start clipped zeroth-order optimizer illustrated on a multimodal landscape"
      caption: "The multi-start clipped ZO optimizer. On a rugged objective, one-shot quasi-random multi-start places a handful of candidates, each step estimates a descent direction from a small set of black-box probes, and box-projected updates carry the surviving start to the global optimum while a poor start is stopped early."
  faq:
    - q: "What problem does ZOAF solve?"
      a: "Optimizing analog and RF circuit parameters when the simulator is a black box, so gradients are unavailable and every evaluation is expensive."
    - q: "Why not just use gradient-based optimization?"
      a: "Classical gradient-based methods need access to simulator internals or an adjoint implementation. Commercial analog/RF simulators expose neither, so the gradient simply is not available."
    - q: "How does ZOAF differ from Bayesian optimization, CMA-ES, or other black-box baselines?"
      a: "Surrogate methods such as TuRBO, AutoCkt and DNN-Opt fit a model of the circuit response and optimize that model, which is expensive to build and sensitive to hyperparameters. Population heuristics such as CMA-ES, DE and PSO need many evaluations. ZOAF is surrogate-free: it estimates descent directions directly from a small number of simulations and takes gradient-style steps, converging with 1.3–3.8× fewer simulator calls."
    - q: "What are the three main components?"
      a: "A hybrid ZO schedule that switches between random-direction ZO for budget-efficient exploration and coordinate-wise ZO for accurate late-stage refinement; one-shot quasi-random multi-start to focus the evaluation budget; and a sliding-window monitor that triggers early stops and box-projected updates to keep parameters within feasible ranges."
    - q: "What circuits was it evaluated on, and does it need simulator source code?"
      a: "Three distinct schematics, including a 22-parameter two-stage cascaded amplifier where ZOAF shows up to an order-of-magnitude advantage in median peaking. It needs no source code — the simulator is treated strictly as a black box mapping design parameters to a figure of merit."
    - q: "What comes next?"
      a: "Extending the framework toward uncertainty-aware design: stochastic zeroth-order optimization to handle process variations in nanoscale circuits, and distributionally robust circuit optimization that accounts for distribution shift in those variations."
  abstract: >-
    Circuit optimization is an indispensable step in analog/RF IC design. Classical fast gradient-based optimization methods are typically infeasible due to lack of access to simulator source code and the technical barriers to implementing adjoint methods. Therefore, surrogate-based black-box optimization is widely used in practice; however, it can be costly to build and sensitive to hyperparameters, whereas population heuristics often suffer from slow convergence and large evaluation counts under tight simulator-call budgets. To address these limitations, we propose the Zeroth-Order Analog/RF Framework (ZOAF), which recovers gradient-descent directions from a small number of black-box circuit simulations, combining the benefits of both gradient-based optimization and black-box optimization. We also employ several surrogate-free techniques to improve the efficiency and accuracy, including (1) a hybrid ZO scheduling method that switches between random-direction ZO for budget-efficient exploration and coordinate-wise ZO for accurate late-stage refinement, (2) one-shot quasi-random multi-start to focus evaluations, and (3) a sliding-window monitor that triggers early stops and box-projected updates to maintain feasibility. Evaluated on three distinct schematics, ZOAF consistently outperforms state-of-the-art baselines, achieving the best median final value on every reported figure of merit — with up to an order-of-magnitude advantage in median peaking on the 22-parameter two-stage amplifier — together with the most robust worst-case behavior across seeds, while reducing simulator calls to convergence by 1.3–3.8×.
  bibtex: |
    @article{tan2026zoaf,
      title   = {ZOAF: Towards Efficient Zeroth-Order Optimization for Analog/RF Circuit Design},
      author  = {Tan, Liyan and Zhao, Yequan and Lu, Jinming and Jamroz, Ben F. and Feldman, Ari and Zhang, Zheng},
      journal = {arXiv preprint arXiv:2606.02869},
      year    = {2026}
    }
---

## Results

<div class="fig-row fig-row--3">
  <div><img src="{{ site.baseurl }}/images/papers/zoaf-peaking.png" alt="Best-so-far peaking versus simulator calls"></div>
  <div><img src="{{ site.baseurl }}/images/papers/zoaf-ripple.png" alt="Best-so-far ripple versus simulator calls"></div>
  <div><img src="{{ site.baseurl }}/images/papers/zoaf-overshoot.png" alt="Best-so-far overshoot versus simulator calls"></div>
</div>
<p class="fig-caption">Best-so-far convergence on the 22-parameter two-stage cascaded amplifier under a 100-call simulator budget, aggregated over 100 random seeds — peaking, ripple and overshoot. Solid lines are the median across seeds, shaded bands the inter-quartile range, dotted lines the 10th and 90th percentiles. ZOAF (blue, bold) separates from CMA-ES, TuRBO-1, DE, PSO, AutoCkt and DNN-Opt early and holds the lead on every figure of merit.</p>
