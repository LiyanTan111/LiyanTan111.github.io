---
permalink: /
title: ""
excerpt: ""
author_profile: true
redirect_from: 
  - /about/
  - /about.html
---

<span class='anchor' id='about-me'></span>

I am a Ph.D. student in Computer Engineering at the **University of California, Santa Barbara**, proudly advised by **Prof. Zheng Zhang**, where I also received my M.S. in Computer Engineering. Before that, I received my B.S. in Electronic Information Engineering from **Huazhong University of Science & Technology**.

My research is on **zeroth-order and memory-efficient optimization** — what remains possible when gradients are expensive, unreliable, or simply unavailable. On the machine learning side, I design gradient-free training algorithms that fine-tune large language models at inference-level memory, and work more broadly on optimizers and parameter-efficient methods for large-scale training. On the hardware side, I bring the same machinery to **analog/RF circuit design**, where the simulator is a black box and every evaluation is expensive; I am currently extending this toward uncertainty-aware design under process variations.

I am also broadly interested in **agentic LLMs** — in particular how tool-using agents can be brought into EDA workflows — as well as the **pre- and post-training** of large language models and **hardware/software co-design**.

You can find more details on <a href='https://scholar.google.com/citations?user=xBvnXWsAAAAJ&hl=en'>Google Scholar</a> and my <a href='{{ site.baseurl }}/cv/'>CV</a>.

# 📖 Education
- *2025.04 - 2028 (expected)*, **Ph.D. in Computer Engineering**, UC Santa Barbara
- *2023.09 - 2025.03*, **M.S. in Computer Engineering**, UC Santa Barbara
- *2019.09 - 2023.06*, **B.S. in Electronic Information Engineering**, Huazhong University of Science & Technology

# 🔥 News
- *2026.08*: &nbsp;🎉 *GRZO: Group-Relative Zeroth-Order Optimization for Large Language Model Fine-Tuning* accepted to Findings of the Association for Computational Linguistics: **EMNLP 2026**.

# 💻 Experience
- *2025.06 - 2025.09*, **Software Architect Intern**, [Cadence Design Systems](https://www.cadence.com/), Austin, TX
  - LLM copilot agent for Voltus, Cadence's power-integrity signoff solver: natural-language design intent into verified tool commands, GUI actions, and automated root-cause analysis.
  - On-premise deployment under enterprise data constraints, via retrieval over EDA documentation, parameter-efficient fine-tuning, and teacher-to-student distillation.

# 📝 Publications 

## Circuit Design Optimization
{: .pub-group}

<div class='paper-box'><div class='paper-box-image'><div><div class="badge">Under review</div><img src='{{ site.baseurl }}/images/zoaf.png' alt="ZOAF" width="100%"></div></div>
<div class='paper-box-text' markdown="1">

[ZOAF: Towards Efficient Zeroth-Order Optimization for Analog/RF Circuit Design]({{ site.baseurl }}/papers/zoaf/)

**Liyan Tan**, Yequan Zhao, Jinming Lu, Ben F. Jamroz, Ari Feldman, Zheng Zhang

<span class="paper-keywords">Analog/RF circuit sizing · Simulation-Efficient Optimization</span>

<a class="project-link" href="{{ site.baseurl }}/papers/zoaf/">Project page →</a>
</div>
</div>

## Machine Learning Optimization
{: .pub-group}

<div class='paper-box'><div class='paper-box-image'><div><div class="badge">EMNLP 2026 Findings</div><img src='{{ site.baseurl }}/images/grzo.png' alt="GRZO" width="100%"></div></div>
<div class='paper-box-text' markdown="1">

[GRZO: Group-Relative Zeroth-Order Optimization for Large Language Model Fine-Tuning]({{ site.baseurl }}/papers/grzo/)

**Liyan Tan**, Yequan Zhao, Yifan Yang, Ruijie Zhang, Xinling Yu, Zheng Zhang

<span class="paper-keywords">LLM fine-tuning · Zeroth-order optimization · Variance reduction</span>

<a class="project-link" href="{{ site.baseurl }}/papers/grzo/">Project page →</a>
</div>
</div>

<div class='paper-box'><div class='paper-box-image'><div><div class="badge">arXiv 2026</div><img src='{{ site.baseurl }}/images/iapo.png' alt="IAPO" width="100%"></div></div>
<div class='paper-box-text' markdown="1">

[IAPO: Input Attribution-Aware Policy Optimization for Tool Use in Small Multimodal Agents](https://arxiv.org/abs/2606.11652)

Yifan Yang, Zhen Zhang, Jiayi Tian, **Liyan Tan**, Zheng Zhang

<span class="paper-keywords">Multimodal Tool Use · Input Attribution · Policy Optimization</span>
</div>
</div>

<div class='paper-box'><div class='paper-box-image'><div><div class="badge">arXiv 2026</div><img src='{{ site.baseurl }}/images/fura.png' alt="FuRA" width="100%"></div></div>
<div class='paper-box-text' markdown="1">

[FuRA: Full-Rank Parameter-Efficient Fine-Tuning with Spectral Preconditioning](https://arxiv.org/abs/2605.22869)

Yequan Zhao, Ruijie Zhang, **Liyan Tan**, Niall Moran, Tong Qin, Zheng Zhang

<span class="paper-keywords">PEFT · Full-rank adaptation · Spectral preconditioning</span>
</div>
</div>

<div class='paper-box'><div class='paper-box-image'><div><div class="badge">arXiv 2026</div><img src='{{ site.baseurl }}/images/muon.png' alt="MUON+" width="100%"></div></div>
<div class='paper-box-text' markdown="1">

[MUON+: Towards More Effective Muon via One Additional Normalization Step for LLM Pre-training](https://arxiv.org/abs/2602.21545)

Ruijie Zhang, Yequan Zhao, Ziyue Liu, Zhengyang Wang, Yupeng Su, **Liyan Tan**, Zheng Zhang

<span class="paper-keywords">LLM pre-training · Muon · Normalization</span>
</div>
</div>
