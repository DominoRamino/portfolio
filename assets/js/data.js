/* Single source of truth for both views. Edit here, never in the renderers. */
window.RAMY = {
  profile: {
    name: "Ramy AlRammahi",
    handle: "Platform Engineer",
    title: "Platform Engineer",
    tagline: "Kubernetes, GitOps, and Azure platform engineering. I build the infrastructure other engineers ship on, and the tools that make it observable.",
    location: "Ann Arbor, MI",
    summary:
      "Platform engineer specializing in Kubernetes, GitOps, and Terraform automation across multi-tenant environments. Promoted to Platform Engineer II after helping operate and modernize a multi-region Azure platform supporting 100+ applications. I like being the technical interface for the teams who consume the platform: onboarding, documentation, training, and the hard debugging sessions.",
    updated: "2026-09-01",
    resumePdf: "assets/Ramy_AlRammahi_Resume.pdf",
    links: {
      email: "alrammahiramy@gmail.com",
      linkedin: "https://www.linkedin.com/in/ramy-a-971478168/",
      github: "https://github.com/DominoRamino",
      site: "https://ramymahi.dev"
    }
  },

  namespaces: [
    { name: "cloud-eng",   label: "Platform Engineer II, Cloud Engineering", period: "Feb 2026 - present", status: "Active", desc: "Current role at Domino's. Architecture ownership, upstream contributions, platform modernization." },
    { name: "infra-aks",   label: "Platform Engineer I, Cloud Engineering",  period: "Jun 2025 - Jan 2026", status: "Active", desc: "First full-time role after the rotation program. AKS platform operations on a four-person team." },
    { name: "rotation",    label: "Technology Rotation Program",             period: "Jun 2023 - Jun 2025", status: "Active", desc: "Two-year rotation across DevSecOps, LLM software engineering, AKS infrastructure, and BI data engineering." },
    { name: "open-source", label: "Open source",                             period: "2025 - present",      status: "Active", desc: "Public work: PodScope and an upstream Terraform provider contribution." },
    { name: "sandbox",     label: "Side projects and lab",                   period: "ongoing",             status: "Active", desc: "Things built for fun, for learning, or because a tool did not exist yet." },
    { name: "education",   label: "Education and certification",             period: "2019 - 2024",         status: "Active", desc: "Oakland University and Microsoft certification." }
  ],

  workloads: [
    /* ---------------- cloud-eng ---------------- */
    {
      name: "uk-connectivity-proxy", ns: "cloud-eng", kind: "Deployment", ready: "2/2", status: "Running", restarts: 0,
      started: "2026-02-01", ended: null, tags: ["featured", "experience"],
      title: "International store connectivity modernization",
      tagline: "Replaced retiring on-prem network and proxy infrastructure with an isolated, multi-region Azure Container Apps architecture.",
      role: "Lead infrastructure engineer",
      bullets: [
        "Led the redesign and migration of connectivity services for Domino's International store estate, replacing retiring on-premises network and proxy infrastructure with an isolated, multi-region Azure architecture.",
        "Prototyped the proposed managed API-gateway design, surfaced per-route certificate constraints through testing, and drove an architecture review toward Azure Container Apps.",
        "Built active-active Apache reverse proxies with region-aware split DNS, path-based routing, and connectivity across overlapping network address spaces.",
        "Owned architecture, Terraform, proxy configuration, deployment automation, testing, and production cutover. Delivered in roughly a month with no reported production issues and no proxy VMs left to maintain."
      ],
      describe: {
        situation: "Corporate services reached International stores through two paths that were both going away: partner-managed network hardware slated for shutdown, and on-prem proxy VMs. A first attempt to lift the proxies into Azure VMs failed because the partner networks used overlapping IP ranges.",
        task: "Design and deliver a replacement that runs in an isolated Azure network, reaches partner infrastructure despite overlapping address space, honors per-route certificate requirements, preserves complex API path routing, and resolves traffic per region, before the shutdown deadline.",
        action: "Built and tested the proposed managed API-gateway design first. The required tier could not do per-route certificates, so I brought that evidence to architecture review and proposed Azure Container Apps among other options. Implemented an Apache reverse proxy on Container Apps, active-active across two regions, each pinned to the matching partner region, with split-horizon DNS steering traffic. Wrote the Terraform, Apache config, and deployment pipeline. Used AI-assisted development heavily to move fast, and personally validated networking, security, and cutover behavior.",
        result: "Live in production with no reported issues. Retired both legacy paths, removed the proxy-VM maintenance burden that isolated networks make painful, and beat the shutdown deadline."
      },
      tech: ["Azure Container Apps", "Apache httpd", "Terraform", "Azure DNS", "VNet", "Private endpoints", "TLS", "GitHub Actions"],
      links: [],
      logs: [
        { t: "2026-01", m: "proxy VMs migrated to Azure; routing fails on overlapping CIDRs" },
        { t: "2026-01", m: "scope expands: partner network hardware also retiring" },
        { t: "2026-02", m: "managed gateway prototype built; per-route certs unsupported on required tier" },
        { t: "2026-02", m: "architecture review: Container Apps proposed and selected" },
        { t: "2026-02", m: "apache proxy on Container Apps deployed, two regions, active-active" },
        { t: "2026-03", m: "split-horizon DNS cutover complete; legacy paths retired" },
        { t: "2026-03", m: "status: Running, 0 incidents" }
      ]
    },
    {
      name: "platform-modernization", ns: "cloud-eng", kind: "Deployment", ready: "1/1", status: "Running", restarts: 0,
      started: "2026-02-01", ended: null, tags: ["experience"],
      title: "Platform modernization",
      tagline: "Kubernetes upgrades, component audits, reusable Terraform modules, and security-focused DevOps improvements.",
      role: "Platform Engineer II",
      bullets: [
        "Drove platform modernization through automation: Kubernetes upgrades and lifecycle maintenance, third-party component audits, and security-focused DevOps improvements across the platform.",
        "Built reusable Terraform modules to improve usability and enforce consistency across cloud infrastructure.",
        "Delivered Kubernetes enablement training to developers covering workload reliability and building applications for Kubernetes."
      ],
      describe: {
        situation: "A multi-tenant AKS platform serving 100+ applications accumulates drift: aging cluster versions, third-party components nobody audited, and Terraform that each team copies slightly differently.",
        task: "Keep the platform current and consistent without slowing the teams that depend on it.",
        action: "Automated upgrade and lifecycle work, audited third-party components, packaged repeated infrastructure into Terraform modules, and taught developers how to build workloads that survive on Kubernetes.",
        result: "Fewer one-off snowflakes, upgrades that are routine instead of events, and application teams that understand the platform they deploy to."
      },
      tech: ["AKS", "Terraform", "Helm", "FluxCD", "GitHub Actions", "Kyverno"],
      links: [],
      logs: [
        { t: "2026-02", m: "promoted to Platform Engineer II" },
        { t: "2026-04", m: "terraform modules published for shared infrastructure patterns" },
        { t: "2026-06", m: "kubernetes enablement training delivered to app teams" }
      ]
    },

    /* ---------------- infra-aks ---------------- */
    {
      name: "aks-platform-ops", ns: "infra-aks", kind: "Deployment", ready: "4/4", status: "Running", restarts: 0,
      started: "2025-06-01", ended: null, tags: ["experience"],
      title: "Multi-tenant AKS platform operations",
      tagline: "Four-person team responsible for lifecycle, reliability, security, and support across multi-tenant AKS clusters and 100+ applications.",
      role: "Platform Engineer I",
      bullets: [
        "Served on a four-person platform engineering team responsible for lifecycle, reliability, security, and support across multi-tenant AKS clusters, 100+ applications, and hundreds of code repositories.",
        "Participated in production on-call rotations, led root-cause investigations, and implemented mitigations.",
        "Led 5+ application and platform production releases through risk assessment, rollback planning, and change-advisory review; mentored three rotation associates; maintained 50+ GitOps repositories.",
        "Automated bastion VM lifecycle management with Ansible."
      ],
      describe: {
        situation: "Enterprise Kubernetes platform: multiple AKS clusters across several regions, replicated production and nonproduction environments, and a broader migration from on-prem infrastructure to Azure.",
        task: "Keep it healthy, keep it upgraded, keep the application teams unblocked, and help retire the legacy hybrid clusters as workloads moved to Azure.",
        action: "Cluster upgrades, troubleshooting across storage, networking, ingress, TLS, private endpoints, and policy failures. On-call. Release ownership in front of the change advisory board. Code review across the GitOps repos. Mentoring the rotation associates who came through the team.",
        result: "Platform stayed reliable through the migration; hybrid on-prem clusters were decommissioned; earned the promotion to Engineer II."
      },
      tech: ["AKS", "Helm", "FluxCD", "Terraform", "Ansible", "Azure Monitor", "Kyverno"],
      links: [],
      logs: [
        { t: "2025-06", m: "accepted return offer: Infrastructure Engineer, AKS" },
        { t: "2025-08", m: "first production release through change advisory board" },
        { t: "2025-10", m: "hybrid on-prem clusters decommissioned" },
        { t: "2025-11", m: "bastion VM lifecycle automated with ansible" },
        { t: "2026-01", m: "third rotation associate mentored" }
      ]
    },
    {
      name: "rbac-automation", ns: "infra-aks", kind: "Deployment", ready: "1/1", status: "Running", restarts: 0,
      started: "2024-08-01", ended: null, tags: ["experience"],
      title: "Self-service namespace access with RBAC automation",
      tagline: "Entra ID groups, Terraform, Flux, and Helm turn access requests into a pull request.",
      role: "Designer and implementer",
      bullets: [
        "Architected and automated RBAC provisioning for cloud infrastructure using Entra ID groups, Terraform, Flux, and Helm, enforcing least privilege while making namespace access self-service for engineering teams."
      ],
      describe: {
        situation: "Application engineers wanted to see their own deployments in the cluster. Access was manual, inconsistent, and slow.",
        task: "Give teams least-privilege, namespace-scoped access without a ticket queue.",
        action: "Modeled access as Entra ID groups mapped to Kubernetes RoleBindings, provisioned by Terraform and reconciled by Flux through a Helm chart. Adding a team became a reviewed pull request.",
        result: "Engineers could watch their workloads in real time, which improved how they built for Kubernetes. Access changes are auditable in git."
      },
      tech: ["Kubernetes RBAC", "Microsoft Entra ID", "Terraform", "FluxCD", "Helm"],
      links: [],
      logs: [
        { t: "2024-08", m: "first version shipped during AKS rotation" },
        { t: "2025-09", m: "extended to platform-wide provisioning" }
      ]
    },
    {
      name: "observability-stack", ns: "infra-aks", kind: "Deployment", ready: "1/1", status: "Running", restarts: 0,
      started: "2025-07-01", ended: null, tags: ["experience"],
      title: "Platform and application observability",
      tagline: "Grafana, Alertmanager, Prometheus, Azure Monitor, and OpenTelemetry for 10+ teams.",
      role: "Builder and consultant",
      bullets: [
        "Built Grafana dashboards and Alertmanager alerts for platform and application health across 10+ teams using Prometheus and Azure Monitor; helped engineers tune queries and dashboards.",
        "Supported Kubernetes OpenTelemetry collectors, log pipelines, Java logging configuration, and Splunk dashboards and automations."
      ],
      describe: {
        situation: "Teams had metrics but not answers. Dashboards were inconsistent and alerts were noisy or missing.",
        task: "Make platform and application health visible and actionable.",
        action: "Built shared Grafana dashboards and Alertmanager rules, sat with engineers to tune PromQL, and kept the OpenTelemetry collectors and log pipelines healthy.",
        result: "Consistent dashboards across teams and alerts people trust."
      },
      tech: ["Grafana", "Prometheus", "Alertmanager", "Azure Monitor", "OpenTelemetry", "Splunk"],
      links: [],
      logs: [
        { t: "2025-07", m: "platform health dashboards published" },
        { t: "2025-09", m: "alertmanager rules rolled out to app teams" }
      ]
    },
    {
      name: "latency-investigation", ns: "infra-aks", kind: "Job", ready: "1/1", status: "Completed", restarts: 0,
      started: "2025-10-01", ended: "2025-11-15", tags: ["featured", "warstory"],
      title: "The latency that only appeared under load",
      tagline: "Packet captures, thread dumps, and a second load generator proved it was the app, not the network.",
      role: "Investigation lead, with a senior engineer",
      bullets: [
        "Drove investigation of customer-facing latency that surfaced only beyond a high-load threshold, using Python load tooling, Kubernetes debug containers, JVM thread inspection, packet captures, and JMeter metrics to rule out infrastructure and network causes.",
        "Traced the issue to Reactor Netty thread-pool behavior and supported the application team in validating a stable configuration."
      ],
      describe: {
        situation: "A customer-facing service talking to an external vendor got slow, but only under very high concurrent load. It looked like the network or the vendor.",
        task: "Find out whether the bottleneck was Kubernetes, the network path, the vendor, or the application runtime.",
        action: "Reproduced it with existing JMeter tests. Captured packets with Wireshark and PodScope. Pulled JVM thread dumps from debug containers. Then wrote independent Python load tests that bypassed the Java app and hit the same path: the network and vendor held up fine. Correlated concurrent connections, thread-pool size, and connections per thread until the pattern pointed at Reactor Netty's pooling behavior.",
        result: "The application team tuned the configuration; subsequent load tests no longer showed the sharp latency knee past the old concurrency threshold. Lesson: design tests that separate layers before blaming one."
      },
      tech: ["Wireshark", "PodScope", "JMeter", "Python", "JVM thread dumps", "Reactor Netty"],
      links: [],
      logs: [
        { t: "2025-10", m: "latency reported; reproducible only above load threshold" },
        { t: "2025-10", m: "packet captures collected across replicas" },
        { t: "2025-10", m: "python load tests bypassing the app: path is clean" },
        { t: "2025-11", m: "thread dumps point at reactor netty pool behavior" },
        { t: "2025-11", m: "app team tunes config; load test stable. Job completed" }
      ]
    },

    /* ---------------- rotation ---------------- */
    {
      name: "vault-on-aks", ns: "rotation", kind: "Deployment", ready: "3/3", status: "Running", restarts: 0,
      started: "2024-06-01", ended: null, tags: ["experience"],
      title: "Highly available HashiCorp Vault on AKS",
      tagline: "Helm, Raft storage, Kubernetes auth, automated backups, cross-cluster recovery.",
      role: "Infrastructure rotation, Jun - Dec 2024",
      bullets: [
        "Designed and implemented a highly available HashiCorp Vault architecture on AKS with Helm, Raft storage, Azure Key Vault integration, Kubernetes authentication, CronJob-based backups, and cross-cluster snapshot recovery.",
        "Developed Kyverno policies for registry access and image-pull security; resolved storage, private-endpoint, TLS, and pod-startup failures."
      ],
      describe: {
        situation: "Workloads needed a secrets platform that lived inside the cluster and could survive a cluster loss.",
        task: "Stand up Vault in a way the team could operate.",
        action: "Helm-deployed Vault with integrated Raft storage, auto-unseal via Azure Key Vault, Kubernetes auth for workloads, scheduled snapshots, and a tested restore into a second cluster.",
        result: "Secrets management with a real recovery story. Still running."
      },
      tech: ["HashiCorp Vault", "Helm", "Raft", "Azure Key Vault", "Kubernetes CronJobs", "Kyverno"],
      links: [],
      logs: [
        { t: "2024-06", m: "rotation: infrastructure engineering, AKS" },
        { t: "2024-09", m: "vault raft cluster live with auto-unseal" },
        { t: "2024-11", m: "cross-cluster snapshot restore validated" }
      ]
    },
    {
      name: "llm-ordering-prototype", ns: "rotation", kind: "Job", ready: "1/1", status: "Completed", restarts: 0,
      started: "2024-01-01", ended: "2024-06-30", tags: ["experience", "ai"],
      title: "Early LLM ordering assistant, before agents were a thing",
      tagline: "Built with Microsoft engineers in the GPT-4 / Claude 3 era. Python, PromptFlow, Azure OpenAI, and a lot of evaluation.",
      role: "Software engineering rotation, Jan - Jun 2024",
      bullets: [
        "Built an early LLM ordering-assistant prototype with Microsoft engineers using Python, the PromptFlow SDK, and Azure OpenAI, and consulted regularly with director-level leadership on direction.",
        "Built the automated evaluation framework for the assistant using PromptFlow and Azure OpenAI, and contributed to the Java Spring REST layer connecting existing ordering channels to LLM calls."
      ],
      describe: {
        situation: "2024. GPT-4 and Claude 3 were new, agent frameworks did not exist, and nobody had a playbook for a conversational ordering experience.",
        task: "Prototype it, and prove whether it worked well enough to trust.",
        action: "Orchestrated prompts and tools by hand in Python and PromptFlow, wired it to real ordering APIs through Spring, and built an evaluation harness so quality was measured instead of guessed. Regular reviews with director-level leadership.",
        result: "A working prototype and, more valuable in hindsight, a feel for what LLM systems need that carried straight into today's agentic work."
      },
      tech: ["Python", "PromptFlow", "Azure OpenAI", "Java Spring", "DevContainers", "Kubernetes"],
      links: [],
      logs: [
        { t: "2024-01", m: "rotation: software engineering, LLM orchestration" },
        { t: "2024-03", m: "evaluation framework running nightly" },
        { t: "2024-06", m: "prototype demoed to leadership. Job completed" }
      ]
    },
    {
      name: "bi-dashboards", ns: "rotation", kind: "Job", ready: "1/1", status: "Completed", restarts: 0,
      started: "2025-01-01", ended: "2025-06-30", tags: ["experience"],
      title: "Store operations analytics",
      tagline: "Power BI, DAX, clustering, and automated SQL pipelines.",
      role: "Data engineering rotation, Jan - Jun 2025",
      bullets: [
        "Developed Power BI dashboards for customer acquisition, retention, and store operations, and applied k-means clustering to surface patterns in order trends.",
        "Automated SQL ETL and Power BI refresh workflows with Control-M and Jenkins; tuned complex SQL queries."
      ],
      describe: {
        situation: "Store operators needed answers, not exports.",
        task: "Build the dashboards and keep the data flowing on schedule.",
        action: "Dimensional modeling, fiscal time intelligence, advanced DAX, clustering analysis, and scheduled pipelines.",
        result: "Operators making decisions from dashboards that refresh themselves."
      },
      tech: ["Power BI", "DAX", "SQL Server", "Control-M", "Jenkins", "Python"],
      links: [],
      logs: [
        { t: "2025-01", m: "rotation: data engineering, business intelligence" },
        { t: "2025-06", m: "rotation program complete; return offer accepted" }
      ]
    },
    {
      name: "devsecops", ns: "rotation", kind: "Job", ready: "1/1", status: "Completed", restarts: 0,
      started: "2023-06-01", ended: "2023-12-31", tags: ["experience"],
      title: "Information security and DevSecOps",
      tagline: "OSINT, application-security pipelines, PCI training for 200+ developers, Splunk automation.",
      role: "Information security rotation, Jun - Dec 2023",
      bullets: [
        "Led OSINT investigations supporting global security operations and designed CI/CD security architecture with a DevSecOps-first approach.",
        "Delivered an interactive security training session to 200+ developers supporting PCI compliance; automated risk-management ingestion and reporting in Splunk."
      ],
      describe: {
        situation: "First rotation, straight out of an information-security degree.",
        task: "Be useful to a global security team quickly.",
        action: "OSINT investigations, an application-security pipeline, PCI-aligned training, and Splunk dashboards and automations.",
        result: "The security habits that still shape how I build platforms."
      },
      tech: ["Splunk", "OSINT", "CI/CD security", "PCI DSS", "Kali Linux"],
      links: [],
      logs: [
        { t: "2023-06", m: "joined technology rotation program" },
        { t: "2023-10", m: "security training delivered to 200+ developers" }
      ]
    },

    /* ---------------- open-source ---------------- */
    {
      name: "podscope", ns: "open-source", kind: "Deployment", ready: "1/1", status: "Running", restarts: 0,
      started: "2025-09-01", ended: null, tags: ["featured", "oss"],
      title: "PodScope: ephemeral packet capture for Kubernetes",
      tagline: "Capture and decode traffic across many pods at once with no node access and nothing left behind.",
      role: "Author",
      bullets: [
        "Created a publicly available Kubernetes diagnostics tool that injects ephemeral debug containers into selected pods and streams captures to a temporary hub, with no privileged node access and no persistent agents.",
        "Live browser-based packet decoding, BPF filtering, and consolidated PCAP export. Used against production replicas to investigate latency, packet loss, connection resets, DNS, and TLS behavior."
      ],
      describe: {
        situation: "Diagnosing intermittent latency meant capturing packets across several replicas at once. Every existing tool wanted node-level access, which company policy prohibited.",
        task: "Get Wireshark-grade visibility into pod traffic within the security rules, then clean up completely.",
        action: "Designed a three-part system: a CLI that selects pods by label, namespace, or name and injects ephemeral capture containers; a hub deployment in a temporary namespace that aggregates the streams; and a React UI over WebSocket that decodes packets live with BPF filtering and PCAP download. Capture agents use gopacket with TCP stream reassembly. Built with AI-assisted development in Go and TypeScript, with me owning the architecture, testing, and every production run.",
        result: "Deep observability on demand. Tear down the session and the cluster is exactly as it was."
      },
      tech: ["Go", "gopacket", "TypeScript", "React", "WebSocket", "Protobuf", "Kubernetes ephemeral containers", "BPF", "PCAP"],
      links: [{ label: "github.com/DominoRamino/PodScope", url: "https://github.com/DominoRamino/PodScope" }],
      usage: "podscope tap -n default -l app=frontend\n# open http://localhost:8899",
      architecture: [
        { part: "CLI", does: "Starts a session, picks pods by label, namespace, or name, injects capture agents as ephemeral containers." },
        { part: "Hub", does: "Temporary deployment that receives capture streams over HTTP, merges them, and serves the UI over WebSocket." },
        { part: "Agents", does: "Ephemeral containers running gopacket capture with TCP reassembly, HTTP/1.1 and TLS metadata decoding." }
      ],
      logs: [
        { t: "2025-09", m: "no node access allowed; existing tools ruled out" },
        { t: "2025-09", m: "ephemeral-container capture agent prototype" },
        { t: "2025-10", m: "hub aggregation and live decode UI" },
        { t: "2025-10", m: "first production run across a dozen replicas" },
        { t: "2025-11", m: "used in latency investigation; MIT license; public" }
      ]
    },
    {
      name: "terraform-provider-azurerm", ns: "open-source", kind: "Job", ready: "1/1", status: "Completed", restarts: 1,
      started: "2026-03-01", ended: "2026-04-09", tags: ["featured", "oss"],
      title: "Upstream contribution: HashiCorp Terraform AzureRM provider",
      tagline: "Merged PR #32080 updating azurerm_kubernetes_flux_configuration to a newer API and adding GitHub as a native git provider. Shipped in v4.69.0.",
      role: "Contributor",
      bullets: [
        "Authored and merged an upstream contribution to the HashiCorp Terraform AzureRM provider, updating the Flux configuration resource to the 2025-04-01 API and adding native GitHub git-repository provider support, with acceptance tests and docs.",
        "Unblocked a months-long gap where the Flux-managed AKS extension needed a configuration the GitOps Terraform module could not express."
      ],
      describe: {
        situation: "Our Flux-managed AKS extension needed a git repository configuration that the Terraform provider simply could not set. Working around it meant manual steps in a GitOps pipeline.",
        task: "Fix it at the source instead of papering over it.",
        action: "First attempt (PR #31731) added the option by hand-editing the vendored SDK; maintainers reasonably wanted it done properly. Restart. Second attempt bumped the resource to the 2025-04-01 kubernetesconfiguration API, pulled in the regenerated SDK, added the provider option natively, wrote acceptance tests, and updated the docs. Worked with the HashiCorp maintainers through review and merge conflicts.",
        result: "Merged April 2026, released in provider v4.69.0. One restart, which is how it should show up on a pod."
      },
      tech: ["Go", "Terraform provider SDK", "Azure SDK", "Flux", "AKS extensions"],
      links: [
        { label: "PR #32080 (merged)", url: "https://github.com/hashicorp/terraform-provider-azurerm/pull/32080" },
        { label: "PR #31731 (first attempt, closed)", url: "https://github.com/hashicorp/terraform-provider-azurerm/pull/31731" }
      ],
      logs: [
        { t: "2026-03", m: "PR #31731 opened: manual SDK edit for github provider" },
        { t: "2026-03", m: "closed after review; needs proper API version bump. restart=1" },
        { t: "2026-03", m: "PR #32080 opened: fluxconfiguration 2025-04-01 sdk" },
        { t: "2026-04", m: "merged by maintainer; shipped in v4.69.0. Job completed" }
      ]
    },

    /* ---------------- sandbox ---------------- */
    {
      name: "smart-shell", ns: "sandbox", kind: "Deployment", ready: "1/1", status: "Running", restarts: 0,
      started: "2025-05-01", ended: null, tags: ["side"],
      title: "Smart shell",
      tagline: "Type what you mean in plain language; it becomes the command.",
      role: "Author",
      bullets: ["A shell wrapper that turns natural-language input into real commands, born from a habit of automating and optimizing everything in my terminal."],
      describe: {
        situation: "I customize my shell constantly and kept wishing I could just say what I wanted.",
        task: "Make the terminal accept intent, not only syntax.",
        action: "Built a shell layer that routes natural language through a model and proposes the command before running it.",
        result: "Repository going public soon. Link lands here when it does."
      },
      tech: ["Bash", "Python", "LLM APIs"],
      links: [],
      logs: [{ t: "2025-05", m: "first working prototype" }, { t: "2026-09", m: "preparing public release" }]
    },
    {
      name: "learning-day-platform", ns: "sandbox", kind: "Deployment", ready: "1/1", status: "Running", restarts: 0,
      started: "2026-05-01", ended: null, tags: ["side"],
      title: "Learning Day event platform",
      tagline: "Schedule, talks, and a gamified attendance experience for an internal learning event.",
      role: "Committee member and builder",
      bullets: ["Building the platform for our internal Learning Day committee: browse the schedule, explore talks, and earn points for showing up and participating."],
      describe: {
        situation: "I'm on the committee that runs our internal learning day. Spreadsheets and email were not cutting it.",
        task: "Give attendees one place to plan their day and a reason to engage.",
        action: "A small web platform with the schedule, talk details, and gamification.",
        result: "In progress."
      },
      tech: ["Web", "Python"],
      links: [],
      logs: [{ t: "2026-05", m: "committee kicks off platform build" }]
    },
    {
      name: "discord-context-bot", ns: "sandbox", kind: "Job", ready: "1/1", status: "Completed", restarts: 0,
      started: "2023-09-01", ended: "2024-02-01", tags: ["side", "ai"],
      title: "Discord bot that reads the room",
      tagline: "An LLM-powered bot that followed the group chat and chimed in with context-aware comments.",
      role: "Author",
      bullets: ["Early LLM-in-the-loop experiment: a Discord bot that read the conversation and replied in context instead of waiting for a command."],
      describe: {
        situation: "Wanted to understand what an LLM could do with an ongoing conversation instead of one-shot prompts.",
        task: "Build a bot that participates rather than responds.",
        action: "Streamed channel messages into a rolling context and let the model decide when a comment was worth making.",
        result: "Funnier than expected. Taught me a lot about context windows and restraint."
      },
      tech: ["Python", "discord.py", "LLM APIs"],
      links: [],
      logs: [{ t: "2023-09", m: "bot joins the server" }, { t: "2024-02", m: "retired; lessons kept" }]
    },
    {
      name: "browser-game-emulator", ns: "sandbox", kind: "Pod", ready: "0/1", status: "Failed", restarts: 0,
      started: "2022-06-01", ended: "2022-12-01", tags: ["side"],
      title: "Browser game emulator with your phone as the controller",
      tagline: "Emulated games in the browser, with a phone paired as a gamepad. The code is lost. Reason: SourceLost.",
      role: "Author",
      bullets: ["A web app that emulated games in the browser and let a phone act as the controller over the network. No backups. Consider it my personal lesson in why every repo gets pushed on day one."],
      describe: {
        situation: "Wanted to play old games on any screen with whatever was in my pocket.",
        task: "Browser emulator plus a phone-as-gamepad bridge.",
        action: "Built it, played it, did not push it anywhere.",
        result: "Pod status: Failed. Reason: SourceLost. Message: local disk did not survive. Every project since has a remote."
      },
      tech: ["JavaScript", "WebSockets"],
      links: [],
      logs: [{ t: "2022-06", m: "emulator running in browser" }, { t: "2022-08", m: "phone gamepad bridge working" }, { t: "2022-12", m: "Warning  SourceLost  source code not recoverable" }]
    },
    {
      name: "minikube-lab", ns: "sandbox", kind: "Deployment", ready: "1/1", status: "Running", restarts: 0,
      started: "2024-06-01", ended: null, tags: ["side"],
      title: "The lab is minikube",
      tagline: "No rack, no fans. A local cluster where diagnostic tools and my own builds get tried first.",
      role: "Operator of one node",
      bullets: ["My home lab is a minikube cluster that I rebuild constantly: trying diagnostic tools, running PodScope builds, breaking networking on purpose, and testing local inference and agent setups."],
      describe: {
        situation: "Ideas need a cluster that is safe to break.",
        task: "Keep one always within reach.",
        action: "minikube, a folder of manifests, and a habit of deleting and recreating it.",
        result: "Everything on this site got tried here first."
      },
      tech: ["minikube", "kubectl", "k9s", "Helm"],
      links: [],
      logs: [{ t: "2026-09", m: "cluster recreated. again." }]
    },

    /* ---------------- education ---------------- */
    {
      name: "oakland-university", ns: "education", kind: "Job", ready: "1/1", status: "Completed", restarts: 0,
      started: "2019-09-01", ended: "2023-05-01", tags: ["education"],
      title: "B.S. Management Information Systems, Information Security specialization",
      tagline: "Oakland University, School of Business Administration Honors. May 2023.",
      role: "Student",
      bullets: ["Oakland University. B.S., Management Information Systems with Information Security specialization. School of Business Administration Honors. Graduated May 2023."],
      describe: { situation: "", task: "", action: "", result: "Graduated May 2023 with School of Business Administration Honors." },
      tech: [], links: [],
      logs: [{ t: "2023-05", m: "graduated. Job completed" }]
    },
    {
      name: "az-900", ns: "education", kind: "Job", ready: "1/1", status: "Completed", restarts: 0,
      started: "2024-12-01", ended: "2024-12-31", tags: ["education"],
      title: "Microsoft Certified: Azure Fundamentals (AZ-900)",
      tagline: "December 2024.",
      role: "Certified",
      bullets: ["Microsoft Certified: Azure Fundamentals (AZ-900), December 2024."],
      describe: { situation: "", task: "", action: "", result: "Certified December 2024." },
      tech: [], links: [],
      logs: [{ t: "2024-12", m: "AZ-900 passed" }]
    }
  ],

  skills: [
    { key: "platform",      values: ["Azure", "AKS", "Kubernetes", "Azure Container Apps", "Azure App Gateway", "Azure API Management", "Terraform", "Helm", "FluxCD", "GitOps", "Azure AI Foundry"] },
    { key: "observability", values: ["Azure Monitor", "Grafana", "Prometheus", "Alertmanager", "OpenTelemetry", "Splunk", "JMeter", "Wireshark", "BPF/PCAP"] },
    { key: "devops",        values: ["GitHub Actions", "Jenkins", "Git", "Python", "Bash", "SQL", "Ansible", "HashiCorp Vault", "Azure Key Vault", "Entra ID", "Kyverno", "PCI DSS"] },
    { key: "networking",    values: ["TCP/IP", "DNS", "TLS", "Apache httpd", "Palo Alto", "Linux"] },
    { key: "ai-assisted",   values: ["Claude Code", "Codex", "PromptFlow", "Azure OpenAI", "local inference", "agentic systems"] },
    { key: "familiar",      values: ["Go", "TypeScript", "Java Spring"] }
  ],

  tools: [
    { key: "terminal",  values: ["k9s (obviously)", "kubectl + krew plugins", "heavily customized bash", "tmux", "fzf"] },
    { key: "cluster",   values: ["minikube for everything local", "Helm", "FluxCD", "kustomize"] },
    { key: "debugging", values: ["PodScope", "Wireshark", "ephemeral debug containers", "JVM thread dumps", "Python scripts for load and probes"] },
    { key: "ai",        values: ["Claude Code", "Codex", "local models for experiments"] },
    { key: "habit",     values: ["if I do it twice, it becomes a script", "every repo gets a remote on day one"] }
  ],

  contact: {
    email: "alrammahiramy@gmail.com",
    linkedin: "https://www.linkedin.com/in/ramy-a-971478168/",
    github: "https://github.com/DominoRamino",
    location: "Ann Arbor, MI"
  },

  events: [
    { t: "2023-06", type: "Normal",  reason: "Scheduled",  obj: "rotation/devsecops",                 m: "Joined Domino's Technology Rotation Program" },
    { t: "2023-10", type: "Normal",  reason: "Delivered",  obj: "rotation/devsecops",                 m: "Security training for 200+ developers" },
    { t: "2024-01", type: "Normal",  reason: "Scheduled",  obj: "rotation/llm-ordering-prototype",    m: "Rotation: LLM orchestration with Microsoft engineers" },
    { t: "2024-06", type: "Normal",  reason: "Scheduled",  obj: "rotation/vault-on-aks",              m: "Rotation: AKS infrastructure. Vault, RBAC automation, Kyverno" },
    { t: "2024-12", type: "Normal",  reason: "Certified",  obj: "education/az-900",                   m: "Microsoft Certified: Azure Fundamentals" },
    { t: "2025-01", type: "Normal",  reason: "Scheduled",  obj: "rotation/bi-dashboards",             m: "Rotation: BI data engineering" },
    { t: "2025-06", type: "Normal",  reason: "Created",    obj: "infra-aks/aks-platform-ops",         m: "Return offer accepted: Infrastructure Engineer, AKS" },
    { t: "2025-10", type: "Normal",  reason: "Created",    obj: "open-source/podscope",               m: "PodScope first production capture" },
    { t: "2025-11", type: "Normal",  reason: "Completed",  obj: "infra-aks/latency-investigation",    m: "Reactor Netty latency isolated and fixed" },
    { t: "2026-02", type: "Normal",  reason: "Promoted",   obj: "cloud-eng/platform-modernization",   m: "Promoted to Platform Engineer II" },
    { t: "2026-03", type: "Normal",  reason: "Created",    obj: "cloud-eng/intl-connectivity-proxy",    m: "International connectivity platform live" },
    { t: "2026-04", type: "Normal",  reason: "Merged",     obj: "open-source/terraform-provider-azurerm", m: "Upstream PR #32080 merged into terraform-provider-azurerm" },
    { t: "2026-09", type: "Normal",  reason: "Updated",    obj: "sandbox/now",                        m: "Experimenting with local inference and agentic systems" }
  ],

  decisions: [
    {
      name: "container-apps-over-managed-gateway", date: "2026-02",
      context: "Store connectivity replacement needed per-route certificates, complex path routing, and isolation from overlapping partner address space.",
      options: ["Managed API gateway (proposed)", "Proxy VMs in isolated network", "Apache on Azure Container Apps"],
      decision: "Apache reverse proxy on Azure Container Apps, active-active across two regions.",
      why: "The gateway tier we were required to use could not do per-route certificates, proven by building it. VMs in an isolated network are painful to patch and image. Container Apps gave us a managed runtime with full control of the proxy config.",
      consequence: "Split-horizon DNS and path rewrite rules became our problem to own. Worth it: no VM fleet, and in production with no incidents."
    },
    {
      name: "ephemeral-containers-over-node-agents", date: "2025-09",
      context: "PodScope needed packet visibility across many pods. Standard tools use privileged DaemonSets or node shells, which policy prohibited.",
      options: ["Privileged DaemonSet", "Sidecar injection with redeploy", "Ephemeral debug containers per pod"],
      decision: "Ephemeral debug containers sharing the pod network namespace, plus a temporary hub.",
      why: "No node access, no redeploys, and everything disappears when the session ends.",
      consequence: "Requires a cluster that supports ephemeral containers and the right RBAC on pods/ephemeralcontainers. Acceptable everywhere I run."
    },
    {
      name: "patch-the-provider-not-the-pipeline", date: "2026-03",
      context: "The Terraform AzureRM provider could not express a Flux configuration option our GitOps module needed.",
      options: ["Manual step outside Terraform", "local-exec with the Azure CLI", "Contribute the fix upstream"],
      decision: "Contribute upstream, even though it took two PRs.",
      why: "Workarounds in a GitOps pipeline are permanent. A merged fix is permanent for everyone.",
      consequence: "A month of review cycles and one closed PR. Shipped in v4.69.0."
    }
  ],

  talks: [
    { when: "2023 - 2026, every six months", where: "CTO and technology leadership", what: "Project and rotation outcome presentations: what I built, what I learned, what the platform needs next." },
    { when: "2024", where: "Director-level leadership", what: "Ongoing consultation while building the early LLM ordering prototype." },
    { when: "2026", where: "Application development teams", what: "Kubernetes enablement training: workload reliability, building applications for Kubernetes." },
    { when: "2023", where: "200+ developers", what: "Interactive security training supporting PCI compliance." },
    { when: "ongoing", where: "Learning Day committee", what: "Organizing internal technical education and building the event platform." }
  ],

  now: {
    updated: "2026-09-01",
    items: [
      "Running local inference and building small agentic systems, applying whatever shipped this month to see what actually holds up.",
      "Building the Learning Day event platform with the committee.",
      "Getting the smart shell ready for a public repo.",
      "Reading upstream Kubernetes networking changes: Gateway API and service mesh options for the platform.",
      "Rebuilding minikube. Again."
    ]
  },

  about: {
    photo: "assets/img/ramy.jpg",
    bio: [
      "I build things. At work that means Kubernetes platforms on Azure and the automation around them. Outside work it means whatever tool I wished existed that week: a packet-capture system for pods, a shell that takes plain English, a Discord bot that reads the room, and one browser game emulator that I lost to a dead disk.",
      "My lab is a minikube cluster I delete and recreate more often than I should. My terminal is heavily customized, and if I do something twice it becomes a script.",
      "I came to Domino's through a two-year technology rotation and stayed in cloud engineering because platform work sits exactly where I like to be: between the infrastructure and the people who need it to work. I mentor rotation associates and help run our internal Learning Day."
    ]
  }
};
