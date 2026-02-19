import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ComplaintCard } from "./ComplaintCard";
// import { ComplaintDetailsDialog } from "./ComplaintDetailsDialog";
import { ArrowLeft, Loader2, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Button } from "./ui/button";
import * as api from "../utils/api";

interface Complaint {
  id: number;
  category: string;
  title: string;
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  votes: number;
  submittedDate: string;
  status: 'pending' | 'resolved' | 'verified';
  photo: string;
  resolutionImage?: string;
  resolutionImages?: string[];
  resolvedDate?: string;
  verificationCount?: number;
  daysPending?: number;
  resolvedByOfficer?: string;
  parentComplaintId?: number;
  departmentReferral?: string;
}

interface DepartmentsPageProps {
  complaints: Complaint[];
  onResolve: (id: number, imageUrl: string) => void;
  loading?: boolean;
  categories?: api.Category[];
  categoriesLoading?: boolean;
  selectedComplaintId?: number | null;
  selectedCategoryId?: string | null;
  onCategoryLinkHandled?: () => void;
  onLinkComplaint?: (complaint: Complaint) => void;
}

export function DepartmentsPage({
  complaints,
  onResolve,
  loading,
  categories: externalCategories,
  categoriesLoading: externalCategoriesLoading,
  selectedComplaintId,
  selectedCategoryId,
  onCategoryLinkHandled,
  onLinkComplaint,
}: DepartmentsPageProps) {
  const [categories, setCategories] = useState<api.Category[]>(externalCategories || []);
  const [loadingCategories, setLoadingCategories] = useState(
    externalCategories ? false : true,
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  useEffect(() => {
    if (externalCategories) {
      setCategories(externalCategories);
      setLoadingCategories(false);
    }
  }, [externalCategories]);

  useEffect(() => {
    if (externalCategories !== undefined) return;
    loadCategories();
  }, [externalCategories]);

  // Auto-select complaint and category when selectedComplaintId changes
  useEffect(() => {
    if (selectedComplaintId && complaints.length > 0) {
      const complaint = complaints.find(c => c.id === selectedComplaintId);
      if (complaint) {
        setSelectedCategory(complaint.category);
        setSelectedComplaint(complaint);
      }
    }
  }, [selectedComplaintId, complaints]);

  // Open a specific department when navigated from overview category cards
  useEffect(() => {
    if (selectedCategoryId) {
      setSelectedCategory(selectedCategoryId);
      setSelectedComplaint(null);
      onCategoryLinkHandled?.();
    }
  }, [selectedCategoryId, onCategoryLinkHandled]);

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const getCategoryComplaints = (categoryId: string, status?: string) => {
    return complaints.filter(c => {
      const matchesCategory = c.category === categoryId;
      if (status === 'pending') {
        return matchesCategory && c.status === 'pending';
      }
      if (status === 'resolved') {
        return matchesCategory && c.status === 'resolved';
      }
      if (status === 'verified') {
        return matchesCategory && c.status === 'verified';
      }
      return matchesCategory;
    });
  };

  const getCategoryStats = (categoryId: string) => {
    const total = getCategoryComplaints(categoryId).length;
    const pending = getCategoryComplaints(categoryId).filter(c => c.status === 'pending').length;
    const resolved = getCategoryComplaints(categoryId).filter(c => c.status === 'resolved').length;
    const verified = getCategoryComplaints(categoryId).filter(c => c.status === 'verified').length;
    return { total, pending, resolved, verified };
  };

  const overallStats = complaints.reduce(
    (acc, complaint) => {
      acc.total += 1;
      if (complaint.status === "pending") acc.pending += 1;
      if (complaint.status === "resolved") acc.resolved += 1;
      if (complaint.status === "verified") acc.verified += 1;
      return acc;
    },
    { total: 0, pending: 0, resolved: 0, verified: 0 },
  );

  if (selectedCategory) {
    const category = categories.find(c => c.id === selectedCategory);
    const pendingComplaints = getCategoryComplaints(selectedCategory, 'pending');
    const resolvedComplaints = getCategoryComplaints(selectedCategory, 'resolved');
    const verifiedComplaints = getCategoryComplaints(selectedCategory, 'verified');
    const stats = getCategoryStats(selectedCategory);

    return (
      <>
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_15%_10%,#f5fbff_0%,#ebf4ff_42%,#edf0ff_100%)] p-8">
          <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-cyan-300/35 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 right-0 h-96 w-96 rounded-full bg-indigo-300/30 blur-3xl" />
          <div className="relative">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => setSelectedCategory(null)}
              className="mb-4 border border-white/60 bg-white/60 hover:bg-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Categories
            </Button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{category?.name}</h1>
                <p className="mt-1 text-slate-600">View and manage complaints by status</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-blue-700">{stats.total}</div>
                <p className="text-sm text-slate-600">Total Complaints</p>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Pending</p>
                  <p className="text-3xl font-bold text-amber-600 mt-2">{pendingComplaints.length}</p>
                </div>
                <Clock className="w-10 h-10 text-amber-400 opacity-30" />
              </div>
            </Card>
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Resolved</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{resolvedComplaints.length}</p>
                </div>
                <AlertCircle className="w-10 h-10 text-blue-400 opacity-30" />
              </div>
            </Card>
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Verified</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{verifiedComplaints.length}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-400 opacity-30" />
              </div>
            </Card>
          </div>

          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-3 rounded-xl border border-slate-200 bg-slate-100 p-1">
              <TabsTrigger value="pending" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Clock className="w-4 h-4 mr-2" />
                Pending
                <Badge className="ml-2 bg-amber-100 text-amber-800 border-0">
                  {pendingComplaints.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="resolved" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <AlertCircle className="w-4 h-4 mr-2" />
                Resolved
                <Badge className="ml-2 bg-blue-100 text-blue-800 border-0">
                  {resolvedComplaints.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="verified" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <CheckCircle className="w-4 h-4 mr-2" />
                Verified
                <Badge className="ml-2 bg-green-100 text-green-800 border-0">
                  {verifiedComplaints.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-6">
              <div className="space-y-4">
                {pendingComplaints.length > 0 ? (
                  pendingComplaints.map((complaint) => (
                    <ComplaintCard
                      key={complaint.id}
                      complaint={complaint}
                      onResolve={onResolve}
                      onClick={setSelectedComplaint}
                      onLinkClick={onLinkComplaint}
                    />
                  ))
                ) : (
                  <Card className="border-slate-200 bg-slate-50 p-12 text-center">
                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No pending complaints</p>
                    <p className="text-gray-400 text-sm mt-1">All complaints in this category are being processed</p>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="resolved" className="mt-6">
              <div className="space-y-4">
                {resolvedComplaints.length > 0 ? (
                  resolvedComplaints.map((complaint) => (
                    <ComplaintCard
                      key={complaint.id}
                      complaint={complaint}
                      onResolve={onResolve}
                      onClick={setSelectedComplaint}
                      onLinkClick={onLinkComplaint}
                    />
                  ))
                ) : (
                  <Card className="border-slate-200 bg-slate-50 p-12 text-center">
                    <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No resolved complaints</p>
                    <p className="text-gray-400 text-sm mt-1">Resolved complaints will appear here</p>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="verified" className="mt-6">
              <div className="space-y-4">
                {verifiedComplaints.length > 0 ? (
                  verifiedComplaints.map((complaint) => (
                    <ComplaintCard
                      key={complaint.id}
                      complaint={complaint}
                      onResolve={onResolve}
                      onClick={setSelectedComplaint}
                      onLinkClick={onLinkComplaint}
                    />
                  ))
                ) : (
                  <Card className="border-slate-200 bg-slate-50 p-12 text-center">
                    <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No verified complaints</p>
                    <p className="text-gray-400 text-sm mt-1">Verified complaints will appear here</p>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
          </div>
        </div>
        
        {/* <ComplaintDetailsDialog
          complaint={selectedComplaint}
          open={!!selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
        /> */}
      </>
    );
  }

  const isCategoriesLoading =
    externalCategories !== undefined
      ? !!externalCategoriesLoading && categories.length === 0
      : loadingCategories;

  if (isCategoriesLoading || loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading departments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_15%_10%,#f5fbff_0%,#ebf4ff_42%,#edf0ff_100%)] p-8">
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-cyan-300/35 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 right-0 h-96 w-96 rounded-full bg-indigo-300/30 blur-3xl" />
      <div className="relative mb-8">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">Departments</h1>
        <p className="text-slate-600">Select a department to view and manage complaints by category</p>
      </div>

      <div className="relative mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-4 shadow-sm">
          <p className="text-xs text-slate-600">Total</p>
          <p className="text-2xl font-semibold text-slate-900">{overallStats.total}</p>
        </Card>
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 p-4 shadow-sm">
          <p className="text-xs text-slate-600">Pending</p>
          <p className="text-2xl font-semibold text-amber-600">{overallStats.pending}</p>
        </Card>
        <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 shadow-sm">
          <p className="text-xs text-slate-600">Resolved</p>
          <p className="text-2xl font-semibold text-blue-600">{overallStats.resolved}</p>
        </Card>
        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 shadow-sm">
          <p className="text-xs text-slate-600">Verified</p>
          <p className="text-2xl font-semibold text-green-600">{overallStats.verified}</p>
        </Card>
      </div>

      <div className="relative grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const stats = getCategoryStats(category.id);
          const resolutionRate = stats.total > 0 ? Math.round(((stats.resolved + stats.verified) / stats.total) * 100) : 0;
          
          return (
            <Card
              key={category.id}
              className="cursor-pointer border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              onClick={() => setSelectedCategory(category.id)}
            >
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-slate-900">{category.name}</h3>
                  <Badge variant="secondary" className="border border-white/70 bg-white/70 px-3 py-1 text-base font-semibold text-slate-800">
                    {stats.total}
                  </Badge>
                </div>
              </div>

              {/* Resolution Progress */}
              <div className="mb-4 rounded-xl border border-blue-100/80 bg-blue-50/65 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-700">Resolution Rate</span>
                  <span className="text-sm font-bold text-blue-600">{resolutionRate}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200/80">
                  <div 
                    className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-700 transition-all"
                    style={{ width: `${resolutionRate}%` }}
                  ></div>
                </div>
              </div>

              {/* Status Grid */}
              <div className="grid grid-cols-3 gap-3 border-t border-white/70 pt-4">
                <div className="text-center">
                  <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100/80">
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="font-bold text-amber-600">{stats.pending}</div>
                  <div className="mt-1 text-xs text-slate-500">Pending</div>
                </div>
                <div className="text-center">
                  <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100/80">
                    <AlertCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="font-bold text-blue-600">{stats.resolved}</div>
                  <div className="mt-1 text-xs text-slate-500">Resolved</div>
                </div>
                <div className="text-center">
                  <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-green-100/80">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="font-bold text-green-600">{stats.verified}</div>
                  <div className="mt-1 text-xs text-slate-500">Verified</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Complaint Details Dialog */}
      {/* {selectedComplaint && (
        <ComplaintDetailsDialog
          isOpen={!!selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          complaint={selectedComplaint}
        />
      )} */}
    </div>
  );
}
