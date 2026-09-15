---
layout: paper
permalink: /papers/zo-mc-sgd/
title: "Sample-Efficient Yield Optimization of Analog Circuits via Stochastic Zeroth-Order Methods"
paper:
  slug: zo-mc-sgd
  title: "Sample-Efficient Yield Optimization of Analog Circuits via Stochastic Zeroth-Order Methods"
  authors:
    - Liyan Tan
    - Yequan Zhao
    - Ben F. Jamroz
    - Ari Feldman
    - Zheng Zhang
  year: 2026
  date: "2026-09-01"
  venue: "Under review"
  venue_meta: "Manuscript under review"
  tldr: "Yield is the right objective for a manufacturable analog circuit, but a Monte Carlo yield estimate is piecewise constant in the design and expensive to sharpen, so it gives an optimizer almost nothing to follow. ZO-MC-SGD keeps yield as the score and optimizes a smooth specification-margin surrogate instead, turning every eight SPICE calls into one descent direction. It reaches a mean yield of 0.95 within 50–200 simulations on five benchmarks — up to 8x fewer than the best baseline."
  problem: "Yield — the probability that a fabricated instance meets every specification under process variation — is what makes a design manufacturable, but it is a hard optimization target. An empirical yield estimate averages binary pass/fail outcomes, so over large regions of the design space it does not move at all, and sharpening it costs simulations that only buy one scalar. Adjoint gradients would help but need derivatives from inside the simulator, which proprietary SPICE flows do not expose."
  method: "Each SPICE run is converted into signed specification margins rather than a pass/fail bit, and the margins are passed through a softplus and combined into a smooth per-sample loss. A Spearman rank-correlation test on a fixed calibration set confirms that lower loss really does mean higher yield before any optimization starts. ZO-MC-SGD then perturbs the design along random directions in +/- pairs, holding the process realization fixed within each pair, and averages the differences into a stochastic zeroth-order gradient — 2K = 8 SPICE calls per step — followed by an Adam update projected back onto the design box."
  result: "Mean yield of 0.95 within 50–200 SPICE simulations on all five benchmarks (design dimension 6–30, process dimension 10–42). On the three larger circuits the best baseline needs four, eight and four times the budget; CMA-ES never reaches the target on 3-stage csamp and RobustAnalog misses it on three of five circuits, even at 3200 simulations. Re-estimated with 1000 fresh process samples, the returned designs score 0.976, 1.000, 0.976 and 1.000 on four circuits, and 0.934 on the fifth — an empirical yield ceiling that no method exceeds."
  figures:
    - src: /images/papers/zomcsgd-conv-csamp.png
      kind: method
      alt: "Mean yield versus SPICE budget for one-, three- and five-stage common-source cascades"
      caption: "Mean yield against SPICE budget on the common-source cascade family, five seeds per point; the dashed line is the 0.95 target. The gap widens with stage count — the competing methods must first fit a model, evaluate a population or train a policy, while ZO-MC-SGD turns each 8-simulation batch straight into a descent direction."
  faq:
    - q: "What problem does ZO-MC-SGD solve?"
      a: "Sizing an analog circuit so that it meets all of its specifications under process variation, not just at the nominal operating point — that is, maximizing yield — when SPICE is a black box and the simulation budget is only a few hundred runs."
    - q: "Why not just run a black-box optimizer on the Monte Carlo yield estimate?"
      a: "Because with a fixed set of process samples the estimate only changes when a sample crosses a specification boundary, so it is piecewise constant over large regions and carries no local direction. Its accuracy also improves only as N^(-1/2), so a reliable estimate is expensive, and each one buys a single scalar at a single design point."
    - q: "What is the yield-aligned loss, and how do you know it is aligned?"
      a: "Every metric is scaled to comparable units, turned into a signed margin against its specification, and passed through a softplus whose sharpness controls how far past the boundary the metric keeps influencing the loss; the penalties are then combined with weights plus a mild preference for gain headroom. Alignment is checked, not assumed: the Spearman rank correlation between mean loss and empirical yield is measured on a fixed calibration set of 81 perturbed designs and the loss is accepted only at rho_s <= -0.7. All five benchmarks pass, from -0.873 to -0.977."
    - q: "How is the gradient estimated, and why is it cheap?"
      a: "At each step the design is perturbed along K random Gaussian directions in plus/minus pairs, with the process realization held fixed inside each pair so the difference isolates the design perturbation rather than process noise. The K differences are averaged into one stochastic gradient at a cost of 2K = 8 SPICE simulations. For comparison, the direct-yield baselines spend ten simulations to estimate one scalar yield — eight simulations buy a direction in design space instead."
    - q: "What does the theory guarantee?"
      a: "The estimator is unbiased for the gradient of the Gaussian-smoothed objective, with an O(eps^2) discrepancy from the unsmoothed one. Its variance falls as 1/K and carries no explicit factor in the process dimension — process variation enters only through the per-sample gradient variance. Reaching nu-stationarity takes O(n/nu^2) SPICE evaluations, independent of the mini-batch size and of the process dimension. Synthetic problems with analytic reference gradients confirm the predicted M^(-1/2) error decay."
    - q: "How does it compare with Bayesian optimization, CMA-ES, PSO, TuRBO and RobustAnalog?"
      a: "All six methods run under the same per-run SPICE budget rather than the same iteration count. ZO-MC-SGD ties the best baseline on the two easiest circuits and needs four to eight times less budget on the other three. An ablation reruns BO, CMA-ES, PSO and TuRBO on the softplus surrogate as well: direct yield is better for all four on every circuit, by 0.24–0.41 mean yield on average, so the baselines are reported on the objective that favors them."
    - q: "Does it need the process variables to be independent?"
      a: "No — only independent samples from their joint distribution. Replacing the independent process model with a correlated one (correlation 0.5 among parameters sharing oxide, doping or lithographic effects) leaves the advantage intact: 200 simulations to target on 3-stage csamp against 400 for CMA-ES, and 25 against 100 on 2-stage csmiller."
    - q: "What are the limits, and what comes next?"
      a: "The method needs a process distribution that can be sampled. If that distribution is itself uncertain or drifts across manufacturing conditions, the problem becomes optimization under distributional uncertainty, and a distributionally robust formulation is the natural extension. The bounds carry no explicit process-dimension term, but the experiments only reach 42 mismatch variables; production-scale circuits with hundreds may need variance reduction or structure-exploiting estimators."
  abstract: "Process variation makes yield a central concern in analog circuit design because a circuit must satisfy all specifications across manufacturing variations, not only at the nominal operating point. Direct yield optimization is difficult, however, because finite-sample Monte Carlo yield estimates are non-smooth with respect to design parameters, while accurate estimates can require many costly SPICE simulations. To address these challenges, zeroth-order Monte Carlo stochastic gradient descent (ZO-MC-SGD) is introduced as a black-box method for sample-efficient yield optimization. The method replaces the binary pass/fail objective with a smooth surrogate based on specification margins and estimates descent directions from a small number of perturbed SPICE simulations. A rank-correlation criterion checks whether the surrogate preserves the design ordering induced by empirical yield. The resulting gradient estimator is analyzed theoretically, with guarantees on its accuracy and sample complexity. Across five analog circuit benchmarks, ZO-MC-SGD reaches a mean yield of 0.95 on four circuits within 50–200 SPICE simulations and the empirical yield ceiling on the fifth. It reduces the required simulation budget by up to a factor of eight relative to the best baseline; several of the five black-box and learning-based baselines fail to reach the target even at substantially larger budgets."
  bibtex: |
    @unpublished{tan2026yield,
      title  = {Sample-Efficient Yield Optimization of Analog Circuits via Stochastic Zeroth-Order Methods},
      author = {Tan, Liyan and Zhao, Yequan and Jamroz, Ben F. and Feldman, Ari and Zhang, Zheng},
      year   = {2026},
      note   = {Manuscript under review}
    }
---

## Results

<div class="paper-table" markdown="0">
<table>
  <caption>Minimum SPICE budget at which the five-seed mean yield reaches 0.95. <code>&gt;3200</code> means the target was never reached; RA = RobustAnalog.</caption>
  <thead>
    <tr><th>Circuit (d<sub>&xi;</sub>)</th><th>ZO-MC-SGD</th><th>BO</th><th>CMA-ES</th><th>PSO</th><th>TuRBO</th><th>RA</th></tr>
  </thead>
  <tbody>
    <tr><td>1-stage csamp (10)</td><td class="ours">200</td><td>200</td><td>800</td><td>400</td><td>400</td><td>1600</td></tr>
    <tr><td>3-stage csamp (26)</td><td class="ours">200</td><td>1600</td><td>&gt;3200</td><td>800</td><td>800</td><td>&gt;3200</td></tr>
    <tr><td>5-stage csamp (42)</td><td class="ours">100</td><td>3200</td><td>800</td><td>1600</td><td>800</td><td>&gt;3200</td></tr>
    <tr><td>2-stage csmiller (26)</td><td class="ours">100</td><td>400</td><td>100</td><td>400</td><td>400</td><td>&gt;3200</td></tr>
    <tr><td>3-stage csmiller (38)</td><td class="ours">50</td><td>200</td><td>400</td><td>400</td><td>800</td><td>1600</td></tr>
  </tbody>
</table>
</div>

<figure class="paper-fig">
  <img src="{{ site.baseurl }}/images/papers/zomcsgd-conv-miller.png" alt="Mean yield versus SPICE budget for two- and three-stage Miller-compensated amplifiers">
  <figcaption>The same comparison on the Miller-compensated family. ZO-MC-SGD reaches the target with 100 and 50 simulations; RobustAnalog does not reach it on 2-stage csmiller within the tested range.</figcaption>
</figure>

<div class="paper-table" markdown="0">
<table>
  <caption>The returned designs, re-estimated with 1000 fresh process samples — five-seed mean and observed range.</caption>
  <thead>
    <tr><th>Circuit (budget)</th><th>Mean yield</th><th>Per-seed range</th></tr>
  </thead>
  <tbody>
    <tr><td>1-stage csamp (200)</td><td>0.934</td><td>[0.934, 0.934]</td></tr>
    <tr><td>3-stage csamp (200)</td><td>0.976</td><td>[0.973, 0.985]</td></tr>
    <tr><td>5-stage csamp (100)</td><td>1.000</td><td>[1.000, 1.000]</td></tr>
    <tr><td>2-stage csmiller (100)</td><td>0.976</td><td>[0.878, 1.000]</td></tr>
    <tr><td>3-stage csmiller (50)</td><td>1.000</td><td>[1.000, 1.000]</td></tr>
  </tbody>
</table>
</div>

## The estimator, checked against ground truth

<figure class="paper-fig paper-fig--narrow">
  <img src="{{ site.baseurl }}/images/papers/zomcsgd-estimator.png" alt="Normalized gradient-estimation error versus the number of independent estimates, on two synthetic problems">
  <figcaption>Before any circuit is touched, the estimator is compared with reference gradients on two synthetic problems — a stochastic quadratic with an exact gradient, and a softplus yield-like problem with an analytic yield expression. The normalized error of the mean estimate falls at the predicted <em>M</em><sup>-1/2</sup> rate, with 95% bootstrap intervals.</figcaption>
</figure>

## Benchmarks

<div class="fig-row">
  <div style="flex:1.24 1 180px"><img src="{{ site.baseurl }}/images/papers/zomcsgd-cs-amp.png" alt="One-stage common-source amplifier schematic"></div>
  <div style="flex:2.36 1 300px"><img src="{{ site.baseurl }}/images/papers/zomcsgd-cs-miller.png" alt="Two-stage Miller-compensated amplifier schematic"></div>
</div>
<p class="fig-caption">The base topology of each family: a common-source stage (left) and a two-stage Miller-compensated amplifier (right). The five benchmarks add stages on top of these — one, three and five CS stages, two and three Miller stages — giving design dimensions of 6 to 30 and process dimensions of 10 to 42. Every circuit is simulated in ngspice with Pelgrom-scaled Gaussian device mismatch, and a sample passes only when gain, unity-gain bandwidth and static power all meet their limits at once.</p>
