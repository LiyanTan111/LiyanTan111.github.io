---
layout: paper
permalink: /papers/grzo/
title: "GRZO: Group-Relative Zeroth-Order Optimization for Large Language Model Fine-Tuning"
author_profile: false
paper:
  short: GRZO
  authors:
    - Liyan Tan
    - Yequan Zhao
    - Yifan Yang
    - Ruijie Zhang
    - Xinling Yu
    - Zheng Zhang
  venue: "Findings of EMNLP 2026"
  year: 2026
  date: "2026-06-01"
  arxiv: "2606.02857"
  doi: "10.48550/arXiv.2606.02857"
  tldr: "One perturbation per example instead of one per batch. GRZO raises the number of zeroth-order gradient directions from one to the batch size at no extra forward cost, beating MeZO by +3.0 average accuracy while staying within 0.5% of the forward-only inference memory floor."
  problem: "Zeroth-order fine-tuning removes backpropagation's memory cost, but one perturbation shared across the mini-batch makes the gradient estimate too noisy to match first-order training. That variance is what keeps ZO methods from closing the accuracy gap."
  method: "GRZO gives every example its own pseudo-independent perturbation and combines the per-example losses by group-relative normalization — B gradient directions per step instead of one, at the same forward cost and with peak memory still at the inference floor."
  result: "Highest accuracy among ZO methods at inference-level memory: 81.6% against MeZO's 74.4% on RTE (Llama3-8B), +3.0 on average, at 17.82 GB peak memory — 0.5% above the forward-only floor. The cost is a 23% per-step time premium, which it repays by converging fastest in wall-clock time. Dropped into sparse, low-rank, and quantized ZO variants it lifts them by +4.9 on average."
  figures:
    - src: /images/papers/grzo-pipeline.png
      kind: method
      alt: "Side-by-side pipeline comparison of MeZO and GRZO"
      caption: "MeZO (left) shares one perturbation across the mini-batch, giving a single gradient direction per step. GRZO (right) builds pseudo-independent per-example perturbations and applies group-relative normalization, yielding B effective directions and much lower variance at the same forward budget."
  faq:
    - q: "What problem does GRZO solve?"
      a: "It reduces the variance of zeroth-order gradient estimation when fine-tuning large language models, which is the main reason ZO fine-tuning underperforms backpropagation."
    - q: "How is GRZO different from MeZO?"
      a: "MeZO uses one random perturbation shared by the whole mini-batch, so each step yields a single gradient direction. GRZO assigns a pseudo-independent perturbation to every example in the batch and combines the per-example losses with group-relative normalization, so one step yields as many directions as there are examples — without any extra forward passes."
    - q: "Does GRZO cost more compute or memory than MeZO?"
      a: "Memory, no: the number of forward passes is unchanged and peak memory stays at the inference floor (17.82 GB on Llama3-8B, 0.5% above the forward-only floor, essentially level with MeZO). Time, slightly: GRZO carries a 23% per-step time premium, but it converges fastest in wall-clock time, so it reaches a given loss sooner."
    - q: "How much better is it in practice?"
      a: "Average accuracy on Llama3-8B improves by +3.0 over MeZO, and on RTE it reaches 81.6% against MeZO's 74.4%. Used as a drop-in replacement for the MeZO core inside sparse, low-rank, and quantized ZO methods, it improves them by +4.9 on average. Evaluated on RoBERTa-large, Llama3-8B, and OPT-13B."
    - q: "Is there a theoretical guarantee?"
      a: "Yes. GRZO is shown to be directionally unbiased, its variance shrinks proportionally to the batch size, and it admits a tighter nonconvex convergence bound than MeZO."
    - q: "When should I use GRZO instead of backpropagation?"
      a: "When memory is the binding constraint — fine-tuning a model that does not fit in memory with activations stored, or on hardware without enough capacity for a backward pass. GRZO keeps ZO's inference-level memory while closing part of the accuracy gap."
  abstract: >-
    Zeroth-order (ZO) optimization is a memory-efficient alternative to backpropagation for fine-tuning large language models, but its deployment is limited by the high variance of gradient estimation. We propose GRZO, a Group-Relative Zeroth-Order optimizer that draws one pseudo-independent perturbation per mini-batch example and aggregates the per-example losses through group-relative normalization, raising the effective gradient-direction count from one to the batch size at no additional forward cost while preserving inference-level memory. We prove that GRZO is directionally unbiased with variance shrinking proportionally to the batch size, yielding a tighter nonconvex convergence bound than MeZO. Across RoBERTa-large, Llama3-8B, and OPT-13B over multiple tasks, GRZO improves average accuracy on Llama3-8B by +3.0 over MeZO while staying within 0.5% of the forward-only inference memory floor; as a drop-in replacement for the MeZO core, it lifts sparse, low-rank, and quantized ZO variants by +4.9 on average.
  bibtex: |
    @inproceedings{tan2026grzo,
      title     = {GRZO: Group-Relative Zeroth-Order Optimization for Large Language Model Fine-Tuning},
      author    = {Tan, Liyan and Zhao, Yequan and Yang, Yifan and Zhang, Ruijie and Yu, Xinling and Zhang, Zheng},
      booktitle = {Findings of the Association for Computational Linguistics: EMNLP 2026},
      year      = {2026}
    }
---

## Results

<div class="fig-row">
  <div style="flex: 1.33 1 340px;"><img src="{{ site.baseurl }}/images/papers/grzo-efficiency.png" alt="Per-step time, peak memory and accuracy for MeZO, S-MeZO, LOZO and GRZO"></div>
  <div style="flex: 1 1 260px;"><img src="{{ site.baseurl }}/images/papers/grzo-rte-convergence.png" alt="Training loss against training steps and wall-clock runtime on RTE"></div>
</div>
<p class="fig-caption"><strong>GRZO at a glance on RTE (Llama3-8B).</strong> Left: the highest accuracy (81.6%) at inference-level peak memory (17.82 GB, 0.5% over the forward-only floor), for a 23% per-step time premium over MeZO. Right: the fastest convergence in both training steps and wall-clock time.</p>

<figure class="paper-fig">
  <img src="{{ site.baseurl }}/images/papers/grzo-alltasks.png" alt="Training loss curves on four tasks against steps and wall-clock time">
  <figcaption>Training-loss curves on Llama3-8B (RTE, MultiRC) and OPT-13B (SQuAD, DROP), plotted against both training steps and wall-clock time. The per-step premium is repaid: GRZO reaches any given loss level sooner on the clock.</figcaption>
</figure>

<div class="paper-table" markdown="0">
<table>
  <thead>
    <tr><th rowspan="2">Method</th><th colspan="7">SuperGLUE (classification)</th><th colspan="2">QA (F1)</th></tr>
    <tr><th>SST-2</th><th>RTE</th><th>CB</th><th>BoolQ</th><th>WiC</th><th>MultiRC</th><th>COPA</th><th>SQuAD</th><th>DROP</th></tr>
  </thead>
  <tbody>
    <tr class="grp"><td colspan="10">Llama3-8B</td></tr>
    <tr class="fo"><td>Adam (FO)</td><td>96.0</td><td>92.0</td><td>92.0</td><td>86.6</td><td>72.6</td><td>84.7</td><td>89.0</td><td>90.4</td><td>59.4</td></tr>
    <tr class="fo"><td>LoRA (FO)</td><td>95.0</td><td>80.9</td><td>73.2</td><td>86.4</td><td>70.7</td><td>82.4</td><td>89.0</td><td>89.4</td><td>58.2</td></tr>
    <tr><td>MeZO</td><td>92.2</td><td>74.4</td><td>69.6</td><td>76.7</td><td>57.8</td><td>77.6</td><td>88.0</td><td><strong>86.7</strong></td><td>57.1</td></tr>
    <tr><td>FZOO</td><td>93.0</td><td>76.6</td><td>68.6</td><td>81.2</td><td>59.4</td><td>77.6</td><td><strong>89.0</strong></td><td>86.0</td><td>57.4</td></tr>
    <tr class="ours"><td>GRZO (ours)</td><td><strong>93.4</strong></td><td><strong>81.6</strong></td><td><strong>72.0</strong></td><td><strong>81.4</strong></td><td><strong>59.8</strong></td><td><strong>78.6</strong></td><td><strong>89.0</strong></td><td>86.2</td><td><strong>65.0</strong></td></tr>
    <tr class="grp"><td colspan="10">OPT-13B</td></tr>
    <tr class="fo"><td>Adam (FO)</td><td>95.3</td><td>80.9</td><td>94.6</td><td>83.5</td><td>66.3</td><td>76.2</td><td>88.0</td><td>89.5</td><td>31.3</td></tr>
    <tr class="fo"><td>LoRA (FO)</td><td>94.8</td><td>78.3</td><td>69.6</td><td>80.2</td><td>64.3</td><td>69.4</td><td>89.0</td><td>88.0</td><td>30.9</td></tr>
    <tr><td>MeZO</td><td>91.4</td><td>66.1</td><td>66.0</td><td>67.6</td><td><strong>59.4</strong></td><td>57.3</td><td><strong>88.0</strong></td><td>84.7</td><td>30.9</td></tr>
    <tr><td>FZOO</td><td><strong>93.8</strong></td><td>76.8</td><td>69.6</td><td><strong>72.2</strong></td><td><strong>59.4</strong></td><td>57.6</td><td>87.0</td><td>84.8</td><td>28.7</td></tr>
    <tr class="ours"><td>GRZO (ours)</td><td>93.4</td><td><strong>78.0</strong></td><td><strong>70.2</strong></td><td>70.4</td><td>58.6</td><td><strong>57.8</strong></td><td><strong>88.0</strong></td><td><strong>85.2</strong></td><td><strong>32.8</strong></td></tr>
  </tbody>
</table>
</div>
<p class="fig-caption">Main results. Orange bullets mark first-order methods, which need full backpropagation memory. Among ZO methods, the best number per task is in bold.</p>

<div class="paper-table" markdown="0">
<table>
  <thead>
    <tr><th rowspan="2">Method</th><th colspan="3">SuperGLUE</th><th colspan="2">QA (F1)</th></tr>
    <tr><th>BoolQ</th><th>RTE</th><th>COPA</th><th>SQuAD</th><th>DROP</th></tr>
  </thead>
  <tbody>
    <tr class="ours"><td>Sparse-GRZO</td>
      <td><strong>85.1</strong> <span class="dpos">+4.6</span>/<span class="dpos">+3.7</span></td>
      <td>79.4 <span class="dpos">+6.0</span>/<span class="dneg">−2.2</span></td>
      <td>88.0 <span class="dpos">+5.0</span>/<span class="dneg">−1.0</span></td>
      <td><strong>89.0</strong> <span class="dpos">+1.5</span>/<span class="dpos">+2.8</span></td>
      <td>59.3 <span class="dpos">+10.9</span>/<span class="dneg">−5.7</span></td></tr>
    <tr class="ours"><td>LO-GRZO</td>
      <td>84.4 <span class="dpos">+5.0</span>/<span class="dpos">+3.0</span></td>
      <td>75.1 <span class="dpos">+3.0</span>/<span class="dneg">−6.5</span></td>
      <td>90.0 <span class="dpos">+6.0</span>/<span class="dpos">+1.0</span></td>
      <td>88.4 <span class="dneg">−0.6</span>/<span class="dpos">+2.2</span></td>
      <td><strong>65.5</strong> <span class="dpos">+0.1</span>/<span class="dpos">+0.5</span></td></tr>
    <tr class="ours"><td>Qu-GRZO (int8)</td>
      <td>79.3 <span class="dpos">+2.5</span>/<span class="dneg">−2.1</span></td>
      <td>80.5 <span class="dpos">+5.3</span>/<span class="dneg">−1.1</span></td>
      <td><strong>91.0</strong> <span class="dpos">+4.0</span>/<span class="dpos">+2.0</span></td>
      <td>88.6 <span class="dpos">+8.0</span>/<span class="dpos">+2.4</span></td>
      <td>63.9 <span class="dpos">+11.6</span>/<span class="dneg">−1.1</span></td></tr>
  </tbody>
</table>
</div>
<p class="fig-caption">GRZO as a drop-in replacement for the MeZO core inside orthogonal ZO variants, on Llama3-8B. The two numbers in each cell are the change against the paired baseline (Sparse-MeZO, LOZO, QuZO) and against vanilla GRZO (BoolQ 81.4, RTE 81.6, COPA 89.0, SQuAD 86.2, DROP 65.0). Swapping in GRZO improves every paired baseline on almost every task.</p>
