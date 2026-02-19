import { useState, useEffect, useCallback } from 'react';
import { LoginPage } from './components/LoginPage';
import { DashboardLayout } from './components/DashboardLayout';
import { OverviewPageEnhanced } from './components/OverviewPageEnhanced';
import { DepartmentsPage } from './components/DepartmentsPage';
import { StatsPageEnhanced } from './components/StatsPageEnhanced';
import { PerformancePage } from './components/PerformancePage';
import { ReportsPage } from './components/ReportsPage';
import { HelpPage } from './components/HelpPage';
import { MunicipalCommunicationChat } from './components/MunicipalCommunicationChat';
import { StateOverviewPageEnhanced } from './components/StateOverviewPageEnhanced';
import { StateCommunicationChat } from './components/StateCommunicationChat';
import { Toaster } from './components/ui/sonner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { toast } from 'sonner';
import * as api from './utils/api';
import { createClient } from './utils/supabase/client';

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
  createdBy?: string;
  parentComplaintId?: number;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<'municipal' | 'state' | null>(null);
  const [currentPage, setCurrentPage] = useState('overview');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [municipalId, setMunicipalId] = useState<string>('');
  const [municipalName, setMunicipalName] = useState<string>('');
  const [stateId, setStateId] = useState<string>('');
  const [stateName, setStateName] = useState<string>('');
  const [selectedComplaintId, setSelectedComplaintId] = useState<number | null>(null);
  const [selectedDepartmentCategory, setSelectedDepartmentCategory] = useState<string | null>(null);
  
  // Linking state - lifted to App level for reliable rendering
  const [linkingComplaint, setLinkingComplaint] = useState<Complaint | null>(null);
  const [categories, setCategories] = useState<api.Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [prefetchedPerformance, setPrefetchedPerformance] = useState<api.DepartmentPerformance[] | null>(null);
  const [linkTargetCategory, setLinkTargetCategory] = useState<string>('');
  const [linkNotes, setLinkNotes] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    const savedMunicipalId = localStorage.getItem('municipalId');
    const savedMunicipalName = localStorage.getItem('municipalName');
    const savedStateId = localStorage.getItem('stateId');
    const savedStateName = localStorage.getItem('stateName');
    const savedCurrentPage = localStorage.getItem('currentPage');
    const savedUserType = localStorage.getItem('userType') as 'municipal' | 'state' | null;

    // Restore state dashboard session
    if (savedUserType === 'state' && savedStateId && savedStateName) {
      setUserType('state');
      setIsLoggedIn(true);
      setStateId(savedStateId);
      setStateName(savedStateName);
      setCurrentPage(savedCurrentPage || 'state-overview');
      return;
    }

    // Restore municipal dashboard session (also fallback for older localStorage without userType)
    if ((savedUserType === 'municipal' || !savedUserType) && savedMunicipalId && savedMunicipalName) {
      setUserType('municipal');
      setIsLoggedIn(true);
      setMunicipalId(savedMunicipalId);
      setMunicipalName(savedMunicipalName);
      if (savedStateId && savedStateName) {
        setStateId(savedStateId);
        setStateName(savedStateName);
      }
      if (savedCurrentPage) {
        setCurrentPage(savedCurrentPage);
      }
    }
  }, []);

  // Save current page to localStorage whenever it changes
  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem('currentPage', currentPage);
    }
  }, [currentPage, isLoggedIn]);

  const loadComplaints = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getComplaintsByMunicipal(municipalId);
      // API now returns properly mapped data with createdBy and parentComplaintId
      setComplaints(data as Complaint[]);
    } catch (error) {
      console.error('Error loading complaints:', error);
      toast.error('Failed to load complaints', {
        description: 'Please try refreshing the page',
      });
    } finally {
      setLoading(false);
    }
  }, [municipalId]);

  // Load complaints when logged in
  useEffect(() => {
    if (isLoggedIn && userType === 'municipal' && municipalId) {
      loadComplaints();
    }
  }, [isLoggedIn, municipalId, userType, loadComplaints]);

  const handleMunicipalLogin = (municipalId: string, municipalName: string, selectedStateId: string, selectedStateName: string) => {
    setIsLoggedIn(true);
    setUserType('municipal');
    setMunicipalId(municipalId);
    setMunicipalName(municipalName);
    setStateId(selectedStateId);
    setStateName(selectedStateName);
    setCurrentPage('overview');

    localStorage.setItem('userType', 'municipal');
    localStorage.setItem('municipalId', municipalId);
    localStorage.setItem('municipalName', municipalName);
    localStorage.setItem('stateId', selectedStateId);
    localStorage.setItem('stateName', selectedStateName);
    localStorage.setItem('currentPage', 'overview');

    toast.success(`Successfully logged in to ${municipalName}`);
  };

  const handleStateLogin = (stateId: string, stateName: string) => {
    setIsLoggedIn(true);
    setUserType('state');
    setStateId(stateId);
    setStateName(stateName);
    setCurrentPage('state-overview');

    localStorage.setItem('userType', 'state');
    localStorage.setItem('stateId', stateId);
    localStorage.setItem('stateName', stateName);
    localStorage.setItem('currentPage', 'state-overview');

    toast.success(`Welcome to ${stateName} state dashboard`);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserType(null);
    setCurrentPage('overview');
    setMunicipalId('');
    setMunicipalName('');
    setStateId('');
    setStateName('');
    setComplaints([]);

    localStorage.removeItem('userType');
    localStorage.removeItem('municipalId');
    localStorage.removeItem('municipalName');
    localStorage.removeItem('stateId');
    localStorage.removeItem('stateName');
    localStorage.removeItem('currentPage');

    toast.info('Logged out successfully');
  };

  const handleViewComplaint = (complaintId: number) => {
    setSelectedComplaintId(complaintId);
    setSelectedDepartmentCategory(null);
    setCurrentPage('departments');
    localStorage.setItem('currentPage', 'departments');
  };

  const handleOpenDepartmentFromOverview = (categoryId: string) => {
    setSelectedComplaintId(null);
    setSelectedDepartmentCategory(categoryId);
    setCurrentPage('departments');
    localStorage.setItem('currentPage', 'departments');
  };

  const handleCategoryLinkHandled = () => {
    setSelectedDepartmentCategory(null);
  };

  // Load categories for linking
  const loadCategories = useCallback(async (silent: boolean = false) => {
    const shouldShowLoading = !silent && categories.length === 0;
    try {
      if (shouldShowLoading) {
        setCategoriesLoading(true);
      }
      const data = await api.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      if (shouldShowLoading) {
        setCategoriesLoading(false);
      }
    }
  }, [categories.length]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Prefetch department performance so Performance page can render instantly.
  useEffect(() => {
    if (!isLoggedIn || userType !== 'municipal' || !municipalId) {
      setPrefetchedPerformance(null);
      return;
    }

    let cancelled = false;
    api.getDepartmentPerformance(municipalId)
      .then((data) => {
        if (!cancelled) {
          setPrefetchedPerformance(data);
        }
      })
      .catch((error) => {
        console.error('Error prefetching performance data:', error);
      });

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, userType, municipalId]);

  // Live updates for municipal complaints/categories. Falls back to interval refresh.
  useEffect(() => {
    if (!isLoggedIn || userType !== 'municipal' || !municipalId) return;

    const supabase: any = createClient();
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;

    const scheduleComplaintsRefresh = () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => {
        loadComplaints();
      }, 300);
    };

    if (typeof supabase.channel !== 'function' || typeof supabase.removeChannel !== 'function') {
      const fallbackOnlyInterval = setInterval(() => {
        loadComplaints();
        loadCategories(true);
      }, 20000);

      return () => {
        if (refreshTimer) clearTimeout(refreshTimer);
        clearInterval(fallbackOnlyInterval);
      };
    }

    const complaintsChannel = supabase
      .channel(`complaints-live-${municipalId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'complaints',
          filter: `municipal_id=eq.${municipalId}`,
        },
        () => {
          scheduleComplaintsRefresh();
        },
      )
      .subscribe();

    const categoriesChannel = supabase
      .channel('categories-live')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'categories',
        },
        () => {
          loadCategories(true);
        },
      )
      .subscribe();

    const fallbackInterval = setInterval(() => {
      loadComplaints();
      loadCategories(true);
    }, 20000);

    return () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      clearInterval(fallbackInterval);
      supabase.removeChannel(complaintsChannel);
      supabase.removeChannel(categoriesChannel);
    };
  }, [isLoggedIn, userType, municipalId, loadComplaints, loadCategories]);

  const handleLinkComplaint = (complaint: Complaint) => {
    setLinkingComplaint(complaint);
    setLinkTargetCategory('');
    setLinkNotes('');
  };

  const handleSubmitLink = async () => {
    if (!linkingComplaint || !linkTargetCategory || !linkNotes.trim()) return;
    setLinkLoading(true);
    try {
      const currentCatName = categories.find(c => c.id === linkingComplaint.category)?.name || linkingComplaint.category;
      const newComplaint = await api.createLinkedComplaint(
        linkingComplaint.id,
        linkTargetCategory,
        linkNotes,
        currentCatName,
        municipalId
      );
      // Map returned fields (snake_case from Supabase) into local shape and prepend so it shows immediately
      const mappedComplaint: Complaint = {
        id: newComplaint.id,
        category: newComplaint.category_id || linkTargetCategory,
        title: newComplaint.title || `${linkingComplaint.title} - ${currentCatName} Review`,
        description: newComplaint.description || linkNotes,
        location: newComplaint.location || linkingComplaint.location,
        latitude: newComplaint.latitude ?? linkingComplaint.latitude,
        longitude: newComplaint.longitude ?? linkingComplaint.longitude,
        votes: newComplaint.votes ?? 0,
        submittedDate: newComplaint.submitted_date || new Date().toISOString(),
        status: (newComplaint.status as Complaint['status']) || 'pending',
        photo: newComplaint.photo_url || linkingComplaint.photo,
        resolutionImage: newComplaint.resolution_image,
        resolutionImages: newComplaint.resolution_images,
        resolvedDate: newComplaint.resolved_date,
        verificationCount: newComplaint.verification_count,
        daysPending: newComplaint.days_pending,
        resolvedByOfficer: newComplaint.resolved_by_officer,
        parentComplaintId: newComplaint.parent_complaint_id ?? linkingComplaint.id,
        departmentReferral: undefined,
        createdBy: newComplaint.created_by || 'department',
      };

      setComplaints(prev => {
        const withoutDup = prev.filter(c => c.id !== mappedComplaint.id);
        return [mappedComplaint, ...withoutDup];
      });

      toast.success('Complaint linked successfully!');
      setLinkingComplaint(null);
    } catch (error) {
      console.error('Error linking complaint:', error);
      toast.error('Failed to link complaint');
    } finally {
      setLinkLoading(false);
    }
  };

  const closeLinkPage = () => {
    setLinkingComplaint(null);
    setLinkTargetCategory('');
    setLinkNotes('');
  };

  const handleResolve = async (id: number, imageUrl: string) => {
    try {
      await api.resolveComplaint(id, imageUrl);
      const now = new Date().toISOString();
      setComplaints(prev => 
        prev.map(complaint => 
          complaint.id === id 
            ? { 
                ...complaint, 
                status: 'resolved' as const,
                resolutionImage: imageUrl,
                resolutionImages: [imageUrl],
                resolvedDate: now,
              }
            : complaint
        )
      );
      toast.success('Complaint resolved successfully', {
        description: 'The complaint has been marked as resolved with verification photo.',
      });
      
      // Reload complaints to get fresh data from database
      setTimeout(() => {
        loadComplaints();
      }, 1000);
    } catch (error) {
      console.error('Error resolving complaint:', error);
      toast.error('Failed to resolve complaint', {
        description: 'Please try again',
      });
    }
  };

  if (!isLoggedIn) {
    return <LoginPage onMunicipalLogin={handleMunicipalLogin} onStateLogin={handleStateLogin} />;
  }

  const renderMunicipalPage = () => {
    // Show all pages for municipal login
    switch (currentPage) {
      case 'overview':
        return (
          <OverviewPageEnhanced
            complaints={complaints}
            loading={loading}
            onOpenCategory={handleOpenDepartmentFromOverview}
          />
        );
      case 'departments':
        return (
          <DepartmentsPage
            complaints={complaints}
            onResolve={handleResolve}
            loading={loading}
            categories={categories}
            categoriesLoading={categoriesLoading}
            selectedComplaintId={selectedComplaintId}
            selectedCategoryId={selectedDepartmentCategory}
            onCategoryLinkHandled={handleCategoryLinkHandled}
            onLinkComplaint={handleLinkComplaint}
          />
        );
      case 'stats':
        return <StatsPageEnhanced municipalId={municipalId} />;
      case 'performance':
        return (
          <PerformancePage
            municipalId={municipalId}
            initialData={prefetchedPerformance}
          />
        );
      case 'reports':
        return <ReportsPage complaints={complaints} loading={loading} municipalName={municipalName} />;
      case 'help':
        return <HelpPage />;
      default:
        return (
          <OverviewPageEnhanced
            complaints={complaints}
            loading={loading}
            onOpenCategory={handleOpenDepartmentFromOverview}
          />
        );
    }
  };

  if (userType === 'state') {
    return (
      <>
        <div className="min-h-screen bg-gray-50">
          <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200">
            <div>
              <p className="text-sm text-gray-500">State Dashboard</p>
              <h2 className="text-2xl text-gray-900">{stateName}</h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm border border-blue-100">{stateId}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 transition"
              >
                Logout
              </button>
            </div>
          </header>

          <ErrorBoundary
            fallbackTitle="State Overview Failed"
            fallbackMessage="The state overview crashed. Retry this section without leaving the dashboard."
          >
            <StateOverviewPageEnhanced stateId={stateId} stateName={stateName} />
          </ErrorBoundary>
        </div>

        <ErrorBoundary
          fallbackTitle="State Chat Failed"
          fallbackMessage="State communication panel crashed. Retry to restore chat."
        >
          <StateCommunicationChat stateId={stateId} stateName={stateName} />
        </ErrorBoundary>

        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <>
      <DashboardLayout
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onLogout={handleLogout}
        municipalName={municipalName}
      >
        <ErrorBoundary
          fallbackTitle="Page Failed"
          fallbackMessage="The current municipal page crashed. Retry this page while keeping your session active."
        >
          {renderMunicipalPage()}
        </ErrorBoundary>
      </DashboardLayout>
      
      {/* Municipal Communication Chat */}
      {municipalId && stateId && (
        <ErrorBoundary
          fallbackTitle="Municipal Chat Failed"
          fallbackMessage="Municipal communication panel crashed. Retry to restore chat."
        >
          <MunicipalCommunicationChat
            stateId={stateId}
            stateName={stateName}
            municipalId={municipalId}
            municipalName={municipalName}
            onViewComplaint={handleViewComplaint}
          />
        </ErrorBoundary>
      )}
      
      {/* Link Complaint Dialog - rendered at App level */}
      {linkingComplaint && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={closeLinkPage}
        >
          <div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b bg-white/80 backdrop-blur">
              <div>
                <p className="text-sm text-gray-500">Inter-Department Task Linking</p>
                <h2 className="text-2xl font-semibold text-gray-900">Create Sub-Complaint in Another Department</h2>
              </div>
              <button
                onClick={closeLinkPage}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100"
              >
                Close
              </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-2 px-6 pb-6 pt-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Original Complaint</p>
                <h3 className="font-semibold text-gray-900">{linkingComplaint.title}</h3>
                <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{linkingComplaint.description}</p>
                <span className="inline-block mt-2 px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded">
                  {categories.find(c => c.id === linkingComplaint.category)?.name || linkingComplaint.category}
                </span>
              </div>

              <div className="p-4 bg-white border border-gray-200 rounded-lg">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Refer to Department</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={linkTargetCategory}
                      onChange={(e) => setLinkTargetCategory(e.target.value)}
                    >
                      <option value="">Select department</option>
                      {categories
                        .filter(cat => cat.id !== linkingComplaint.category)
                        .map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Referral Notes</label>
                    <textarea
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={6}
                      placeholder="Describe what the other department needs to do..."
                      value={linkNotes}
                      onChange={(e) => setLinkNotes(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={closeLinkPage}
                      className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitLink}
                      disabled={!linkTargetCategory || !linkNotes.trim() || linkLoading}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {linkLoading ? 'Creating...' : 'Create Sub-Complaint'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Toaster position="top-right" />
    </>
  );
}
