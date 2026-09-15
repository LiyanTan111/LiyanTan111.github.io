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
    - src: /images/papers/grzo-efficiency.png
      kind: result
      alt: "Per-step time, peak GPU memory, and accuracy for MeZO, S-MeZO, LOZO and GRZO"
      caption: "Efficiency and accuracy on Llama3-8B (RTE). GRZO reaches 81.6% accuracy against MeZO's 74.4% while holding peak memory at the inference floor; the cost is a 23% per-step time premium, which it repays by converging fastest in wall-clock time."
    - src: /images/papers/grzo-memory.png
      kind: result
      alt: "Peak GPU memory versus model size from 1.3B to 30B parameters"
      caption: "Peak GPU memory vs. model size on OPT (1.3B–30B). GRZO tracks the forward-only inference footprint at every scale — 6–8× below full fine-tuning — so the extra gradient directions cost essentially no memory."
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
  bibtex: |
    @inproceedings{tan2026grzo,
      title     = {GRZO: Group-Relative Zeroth-Order Optimization for Large Language Model Fine-Tuning},
      author    = {Tan, Liyan and Zhao, Yequan and Yang, Yifan and Zhang, Ruijie and Yu, Xinling and Zhang, Zheng},
      booktitle = {Findings of the Association for Computational Linguistics: EMNLP 2026},
      year      = {2026}
    }
---

Zeroth-order (ZO) optimization is a memory-efficient alternative to backpropagation for fine-tuning large language models, but its deployment is limited by the high variance of gradient estimation. We propose GRZO, a Group-Relative Zeroth-Order optimizer that draws one pseudo-independent perturbation per mini-batch example and aggregates the per-example losses through group-relative normalization, raising the effective gradient-direction count from one to the batch size at no additional forward cost while preserving inference-level memory. We prove that GRZO is directionally unbiased with variance shrinking proportionally to the batch size, yielding a tighter nonconvex convergence bound than MeZO. Across RoBERTa-large, Llama3-8B, and OPT-13B over multiple tasks, GRZO improves average accuracy on Llama3-8B by +3.0 over MeZO while staying within 0.5% of the forward-only inference memory floor; as a drop-in replacement for the MeZO core, it lifts sparse, low-rank, and quantized ZO variants by +4.9 on average.
