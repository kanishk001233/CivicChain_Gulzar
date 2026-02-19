import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Download, FileText, Calendar, TrendingUp, BarChart3, Loader2 } from "lucide-react";
// import { categories } from "../data/dummyData";
import { 
  generateDailySummaryPDF, 
  generateMonthlyAnalyticsPDF, 
  generateCategoryReportPDF,
  generateWeeklyPerformancePDF 
} from "../utils/pdfGenerator";
import { toast } from "sonner";

const CATEGORY_META: Record<string, { name: string; icon: string }> = {
  roads: { name: "Roads & Potholes", icon: "🛣️" },
  waste: { name: "Waste / Garbage", icon: "🗑️" },
  streetlights: { name: "Streetlights", icon: "💡" },
  water: { name: "Water Supply", icon: "💧" },
  sewage: { name: "Sewage", icon: "🚰" },
  others: { name: "Others", icon: "📋" },
};

interface Complaint {
  id: number;
  category: string;
  title: string;
  description: string;
  location: string;
  votes: number;
  submittedDate: string;
  status: 'pending' | 'verified' | 'resolved';
  photo: string;
  resolutionImage?: string;
  resolvedDate?: string;
}

interface ReportsPageProps {
  complaints: Complaint[];
  loading?: boolean;
  municipalName?: string;
}

export function ReportsPage({ complaints, loading, municipalName = 'Municipal Corporation' }: ReportsPageProps) {
  const handleDownloadReport = (reportId: string) => {
    try {
      switch (reportId) {
        case 'daily':
          generateDailySummaryPDF(complaints, municipalName);
          toast.success('Daily Summary Report downloaded successfully!');
          break;
        case 'weekly':
          generateWeeklyPerformancePDF(complaints, municipalName);
          toast.success('Weekly Performance Report downloaded successfully!');
          break;
        case 'monthly':
          generateMonthlyAnalyticsPDF(complaints, municipalName);
          toast.success('Monthly Analytics Report downloaded successfully!');
          break;
        case 'category':
          generateDailySummaryPDF(complaints, municipalName);
          toast.success('Category-wise Report downloaded successfully!');
          break;
        default:
          toast.error('Unknown report type');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate report. Please try again.');
    }
  };

  const handleDownloadCategoryReport = (categoryId: string, categoryName: string) => {
    try {
      const categoryComplaints = complaints.filter(c => c.category === categoryId);
      generateCategoryReportPDF(categoryComplaints, categoryName, municipalName);
      toast.success(`${categoryName} report downloaded successfully!`);
    } catch (error) {
      console.error('Error generating category PDF:', error);
      toast.error('Failed to generate category report. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading reports data...</p>
        </div>
      </div>
    );
  }

  const pendingCount = complaints.filter(c => c.status === 'pending').length;
  const verifiedCount = complaints.filter(c => c.status === 'verified').length;
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length;
  const totalCount = complaints.length;
  const resolutionRate = totalCount > 0 ? Math.round(((resolvedCount + verifiedCount) / totalCount) * 100) : 0;

  const reportTypes = [
    {
      id: 'daily',
      title: 'Daily Summary Report',
      description: 'Complete overview of today\'s complaint activities',
      icon: Calendar,
      color: 'blue',
      format: 'PDF',
    },
    {
      id: 'weekly',
      title: 'Weekly Performance Report',
      description: 'Department-wise performance metrics for the week',
      icon: TrendingUp,
      color: 'green',
      format: 'PDF',
    },
    {
      id: 'monthly',
      title: 'Monthly Analytics Report',
      description: 'Comprehensive monthly trends and insights',
      icon: BarChart3,
      color: 'purple',
      format: 'PDF',
    },
    {
      id: 'category',
      title: 'Category-wise Report',
      description: 'Detailed breakdown by complaint categories',
      icon: FileText,
      color: 'amber',
      format: 'PDF',
    },
  ];

  const categoryBreakdown = Object.entries(
    complaints.reduce<Record<string, { total: number; pending: number; resolved: number }>>((acc, complaint) => {
      if (!acc[complaint.category]) {
        acc[complaint.category] = { total: 0, pending: 0, resolved: 0 };
      }
      acc[complaint.category].total += 1;
      if (complaint.status === "pending") acc[complaint.category].pending += 1;
      if (complaint.status === "resolved" || complaint.status === "verified") acc[complaint.category].resolved += 1;
      return acc;
    }, {}),
  )
    .map(([categoryId, stats]) => ({
      categoryId,
      ...stats,
      name: CATEGORY_META[categoryId]?.name || categoryId,
      icon: CATEGORY_META[categoryId]?.icon || "📌",
      resolutionRate: stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_15%_10%,#f5fbff_0%,#ebf4ff_42%,#edf0ff_100%)] p-8">
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-cyan-300/35 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 right-0 h-96 w-96 rounded-full bg-indigo-300/30 blur-3xl" />
      <div className="relative mb-8">
        <h1 className="mb-2 text-3xl font-semibold text-slate-900">Reports & Export</h1>
        <p className="text-slate-600">Generate downloadable operational and analytics reports</p>
      </div>

      {/* Summary Stats */}
      <div className="relative mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6 text-center shadow-sm">
          <div className="mb-2 text-3xl text-slate-900">{totalCount}</div>
          <p className="text-sm text-slate-600">Total Complaints</p>
        </Card>
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 p-6 text-center shadow-sm">
          <div className="mb-2 text-3xl text-amber-600">{pendingCount}</div>
          <p className="text-sm text-slate-600">Pending</p>
        </Card>
        <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 text-center shadow-sm">
          <div className="mb-2 text-3xl text-blue-600">{verifiedCount}</div>
          <p className="text-sm text-slate-600">In Progress</p>
        </Card>
        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 text-center shadow-sm">
          <div className="mb-2 text-3xl text-green-600">{resolvedCount}</div>
          <p className="text-sm text-slate-600">Resolved</p>
          <p className="mt-1 text-xs text-slate-500">{resolutionRate}% success rate</p>
        </Card>
      </div>

      {/* Report Templates */}
      <div className="mb-8">
        <h2 className="mb-6 text-xl font-semibold text-slate-900">Available Reports</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            const colorClasses = {
              blue: { bg: 'bg-blue-100', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-800' },
              green: { bg: 'bg-green-100', text: 'text-green-600', badge: 'bg-green-100 text-green-800' },
              purple: { bg: 'bg-purple-100', text: 'text-purple-600', badge: 'bg-purple-100 text-purple-800' },
              amber: { bg: 'bg-amber-100', text: 'text-amber-600', badge: 'bg-amber-100 text-amber-800' },
            };
            const colors = colorClasses[report.color as keyof typeof colorClasses];

            return (
              <Card
                key={report.id}
                className="border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-7 h-7 ${colors.text}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-slate-900">{report.title}</h3>
                      <Badge className={colors.badge}>{report.format}</Badge>
                    </div>
                    <p className="mb-4 text-sm text-slate-600">{report.description}</p>
                    <Button
                      size="sm"
                      onClick={() => handleDownloadReport(report.id)}
                      className="gap-2 !bg-[#0a3f86] !text-white hover:!bg-[#08366f]"
                    >
                      <Download className="w-4 h-4" />
                      Download {report.format}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Category Breakdown */}
      <Card className="relative border-slate-200 bg-white p-6 shadow-md">
        <h2 className="mb-6 text-xl font-semibold text-slate-900">Category-wise Breakdown</h2>
        <div className="space-y-4">
          {categoryBreakdown.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
              No complaint data available yet.
            </div>
          )}

          {categoryBreakdown.map((category) => (
            <div key={category.categoryId} className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{category.icon}</span>
                  <h3 className="font-semibold text-slate-900">{category.name}</h3>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-slate-600">Total: <span className="font-semibold">{category.total}</span></span>
                  <span className="text-amber-600">Pending: <span className="font-semibold">{category.pending}</span></span>
                  <span className="text-green-600">Resolved: <span className="font-semibold">{category.resolved}</span></span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-2 flex-1 rounded-full bg-slate-200">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-700 transition-all"
                    style={{ width: `${category.resolutionRate}%` }}
                  />
                </div>
                <span className="w-14 text-right text-sm text-slate-600">{category.resolutionRate}%</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownloadCategoryReport(category.categoryId, category.name)}
                  className="border-slate-300 bg-white hover:bg-slate-100"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
