import { useMemo, useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  HelpCircle,
  Search,
  Wrench,
  Shield,
  MessageCircle,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Phone,
  Mail,
} from "lucide-react";

interface FAQ {
  question: string;
  answer: string;
  tags: string[];
}

const faqs: FAQ[] = [
  {
    question: "How do I move a complaint from Pending to Resolved?",
    answer:
      "Go to Departments, open the relevant category, click Resolve on the complaint, and upload resolution proof. After submission, it will appear under Resolved or Verified depending on your workflow.",
    tags: ["departments", "resolve", "complaints"],
  },
  {
    question: "Why is a complaint missing in my department view?",
    answer:
      "Check filters first (Pending/Resolved/Verified). Then verify the complaint category matches your selected department. If still missing, refresh data from the dashboard and check linked complaint routing.",
    tags: ["filters", "department", "missing"],
  },
  {
    question: "What does the performance score represent?",
    answer:
      "Performance score combines resolution rate and resolution time. Higher scores indicate better closure quality and speed. Use the leaderboard and detailed table together for accurate interpretation.",
    tags: ["performance", "score", "analytics"],
  },
  {
    question: "How often does dashboard data update?",
    answer:
      "The app updates using realtime subscriptions where available, with periodic fallback refresh in the background. You should not need manual browser refresh in normal operation.",
    tags: ["realtime", "sync", "refresh"],
  },
  {
    question: "How do I export reports correctly?",
    answer:
      "Use Reports page actions (Daily, Weekly, Monthly, Category). Current exports are PDF. If a report appears incorrect, verify current filters and complaint statuses before re-exporting.",
    tags: ["reports", "export", "pdf"],
  },
  {
    question: "When should municipal teams contact state support?",
    answer:
      "Escalate when complaint aging crosses SLA, cross-department dependency blocks closure, or repeated incidents indicate systemic issues requiring state-level intervention.",
    tags: ["escalation", "sla", "state"],
  },
];

const playbooks = [
  {
    title: "Complaint Review",
    icon: Wrench,
    steps: [
      "Validate complaint details (location, category, and photo evidence).",
      "Move valid complaints through verification and resolution workflow quickly.",
      "If another department is required, create a linked complaint immediately with referral notes.",
    ],
    accent: "border-blue-200 bg-blue-50",
  },
  {
    title: "SLA Risk Prevention",
    icon: AlertTriangle,
    steps: [
      "Review high-age pending complaints at start and end of day.",
      "Escalate blockers with notes and ETA, not just status updates.",
      "Use performance page to identify slow categories and rebalance workload.",
    ],
    accent: "border-amber-200 bg-amber-50",
  },
  {
    title: "Resolution Quality Control",
    icon: CheckCircle2,
    steps: [
      "Attach clear after-resolution photos with location context.",
      "Confirm status transitions are accurate (Resolved/Verified).",
      "Capture recurring patterns for preventive action in weekly review.",
    ],
    accent: "border-emerald-200 bg-emerald-50",
  },
];

export function HelpPage() {
  const [query, setQuery] = useState("");

  const filteredFaqs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqs;
    return faqs.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q) ||
        f.tags.some((tag) => tag.toLowerCase().includes(q)),
    );
  }, [query]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_15%_10%,#f5fbff_0%,#ebf4ff_42%,#edf0ff_100%)] p-8">
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-cyan-300/35 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 right-0 h-96 w-96 rounded-full bg-indigo-300/30 blur-3xl" />

      <div className="relative mb-8">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
            <HelpCircle className="h-6 w-6 text-blue-700" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Help & Support Center</h1>
            <p className="text-slate-600">Operational guidance for faster resolution and fewer escalations.</p>
          </div>
        </div>
      </div>

      <div className="relative mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-4 shadow-sm">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs text-slate-600">Core Workflow</span>
            <Wrench className="h-4 w-4 text-blue-700" />
          </div>
          <p className="text-sm font-semibold text-slate-900">Submitted {"->"} Verify {"->"} Resolve</p>
        </Card>
        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 shadow-sm">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs text-slate-600">Response Target</span>
            <Clock className="h-4 w-4 text-emerald-700" />
          </div>
          <p className="text-sm font-semibold text-slate-900">First update within 24h</p>
        </Card>
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 p-4 shadow-sm">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs text-slate-600">Escalation Rule</span>
            <Shield className="h-4 w-4 text-amber-700" />
          </div>
          <p className="text-sm font-semibold text-slate-900">SLA risk or dependency block</p>
        </Card>
        <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 shadow-sm">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs text-slate-600">Reporting</span>
            <FileText className="h-4 w-4 text-indigo-700" />
          </div>
          <p className="text-sm font-semibold text-slate-900">Daily/Weekly/Monthly PDFs</p>
        </Card>
      </div>

      <div className="relative mb-8">
        <Card className="border-slate-200 bg-white p-4 shadow-md">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by keyword (SLA, reports, performance, escalation...)"
              className="h-11 w-full rounded-md border border-slate-300 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </Card>
      </div>

      <div className="relative mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {playbooks.map((playbook) => {
          const Icon = playbook.icon;
          return (
            <Card key={playbook.title} className={`p-5 shadow-sm ${playbook.accent}`}>
              <div className="mb-3 flex items-center gap-2">
                <Icon className="h-5 w-5 text-slate-700" />
                <h3 className="font-semibold text-slate-900">{playbook.title}</h3>
              </div>
              <div className="space-y-2">
                {playbook.steps.map((step) => (
                  <div key={step} className="rounded-md bg-white/70 p-2 text-sm text-slate-700">
                    {step}
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="relative mb-8">
        <div className="mb-4 flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-700" />
          <h2 className="text-xl font-semibold text-slate-900">Frequently Asked Questions</h2>
          <Badge variant="outline">{filteredFaqs.length} items</Badge>
        </div>

        <div className="space-y-3">
          {filteredFaqs.map((faq) => (
            <Card key={faq.question} className="border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-2 font-semibold text-slate-900">{faq.question}</h3>
              <p className="mb-3 text-sm leading-relaxed text-slate-700">{faq.answer}</p>
              <div className="flex flex-wrap gap-2">
                {faq.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </Card>
          ))}

          {filteredFaqs.length === 0 && (
            <Card className="border-slate-200 bg-white p-10 text-center shadow-sm">
              <Search className="mx-auto mb-3 h-8 w-8 text-slate-400" />
              <p className="font-semibold text-slate-700">No matching help articles</p>
              <p className="text-sm text-slate-500">Try broader terms like complaint, resolve, report, or SLA.</p>
            </Card>
          )}
        </div>
      </div>

      <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-slate-200 bg-white p-6 shadow-md">
          <div className="mb-3 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-700" />
            <h3 className="font-semibold text-slate-900">Escalation Checklist</h3>
          </div>
          <div className="space-y-2 text-sm text-slate-700">
            <p>1. Add concise blocker summary and current status.</p>
            <p>2. Mention actions already attempted by municipal team.</p>
            <p>3. Include expected support required from state level.</p>
            <p>4. Provide realistic timeline and accountability owner.</p>
          </div>
        </Card>

        <Card className="border-slate-200 bg-white p-6 shadow-md">
          <div className="mb-3 flex items-center gap-2">
            <Phone className="h-5 w-5 text-blue-700" />
            <h3 className="font-semibold text-slate-900">Contact Support</h3>
          </div>
          <div className="space-y-3 text-sm text-slate-700">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-slate-500" />
              <span>support@civicchain.gov</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-slate-500" />
              <span>1800-123-8899 (24x7)</span>
            </div>
            <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900">
              For urgent production issues, include: municipal ID, affected module, error text, and timestamp.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
