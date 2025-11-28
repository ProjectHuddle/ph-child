import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Search, CheckCircle2, XCircle, Globe, FileText, Archive, AlertCircle, CheckCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast, Toaster } from '@/components/ui/toast';
import { __, sprintf } from '@wordpress/i18n';
import { apiGateway } from '../api/gateway.js';
import SyncedMonitor from "../../../../assets/images/settings/sync_saved_locally.svg";
import SyncedMonitorOff from "../../../../assets/images/settings/sync_saved_locally_off.svg";

const WidgetControl = () => {
  const [pages, setPages] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showEnableAllDialog, setShowEnableAllDialog] = useState(false);
  const [showDisableAllDialog, setShowDisableAllDialog] = useState(false);
  const itemsPerPage = 4;

  // Load pages and settings
  const loadPagesSettings = async () => {
    try {
      setLoading(true);
      const response = await apiGateway.get('page-settings');

      if (response.success) {
        setPages(response.pages || []);
        setSettings(response.settings || {});
      }
    } catch (error) {
      toast.error(__('Failed to load page settings', 'surefeedback'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPagesSettings();
  }, []);

  // Handle toggle change
  const handleToggleChange = (pageId, enabled) => {
    setSettings((prev) => ({
      ...prev,
      [pageId]: enabled,
    }));
    setHasUnsavedChanges(true);
  };

  // Save settings
  const saveSettings = async () => {
    try {
      setSaving(true);
      const response = await apiGateway.post('page-settings', {
        settings: settings,
      });

      if (response.success) {
        toast.success(__('Page settings saved successfully', 'surefeedback'));
        setHasUnsavedChanges(false);
        // Reload to get updated data
        await loadPagesSettings();
      }
    } catch (error) {
      toast.error(__('Failed to save settings', 'surefeedback'));
    } finally {
      setSaving(false);
    }
  };

  // Enable all pages
  const handleEnableAllClick = () => {
    setShowEnableAllDialog(true);
  };

  const confirmEnableAll = async () => {
    try {
      setSaving(true);
      const response = await apiGateway.post('page-settings/enable-all');

      if (response.success) {
        toast.success(__('Widget enabled for all pages', 'surefeedback'));
        setHasUnsavedChanges(false);
        await loadPagesSettings();
      }
    } catch (error) {
      toast.error(__('Failed to enable widget for all pages', 'surefeedback'));
    } finally {
      setSaving(false);
      setShowEnableAllDialog(false);
    }
  };

  // Disable all pages
  const handleDisableAllClick = () => {
    setShowDisableAllDialog(true);
  };

  const confirmDisableAll = async () => {
    try {
      setSaving(true);
      const response = await apiGateway.post('page-settings/disable-all');

      if (response.success) {
        toast.success(__('Widget disabled for all pages', 'surefeedback'));
        setHasUnsavedChanges(false);
        await loadPagesSettings();
      }
    } catch (error) {
      console.error('Error disabling all pages:', error);
      toast.error(__('Failed to disable widget for all pages', 'surefeedback'));
    } finally {
      setSaving(false);
      setShowDisableAllDialog(false);
    }
  };

  // Get page icon based on type
  const getPageIcon = (type) => {
    switch (type) {
      case 'home':
      case 'blog':
        return <Globe className="h-4 w-4" />;
      case 'page':
      case 'post':
        return <FileText className="h-4 w-4" />;
      case 'archive':
      case 'search':
      case '404':
        return <Archive className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Get page type badge color
  const getPageTypeBadge = (type, typeLabel) => {
    return (
      <Badge className="bg-[#F9FAFB] text-[#374151] border-[0.5px] border-[#E5E7EB] rounded-full shadow-none px-2.5 py-0.5 text-xs font-medium">
        {typeLabel || type}
      </Badge>
    );
  };

  // Check if page is enabled (default to true if no setting exists)
  const isPageEnabled = (pageId) => {
    // If no settings exist at all, widget is enabled for all pages
    if (Object.keys(settings).length === 0) {
      return true;
    }
    // If page has explicit setting, use it; otherwise default to true
    return settings[pageId] !== false;
  };

  // Filter pages
  const filteredPages = pages.filter((page) => {
    const matchesSearch = page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.type.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterType === 'all') return matchesSearch;
    if (filterType === 'enabled') return matchesSearch && isPageEnabled(page.id);
    if (filterType === 'disabled') return matchesSearch && !isPageEnabled(page.id);

    return matchesSearch && page.type === filterType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPages = searchTerm ? filteredPages : filteredPages.slice(startIndex, endIndex);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType]);

  // Count enabled/disabled pages
  const enabledCount = pages.filter((p) => isPageEnabled(p.id)).length;
  const disabledCount = pages.length - enabledCount;

  if (loading) {
    return (
      <div className="flex justify-center items-start bg-background p-4 pt-8">
        <Card className="shadow-sm w-full rounded-lg border border-border max-w-4xl">
          <CardContent className="flex flex-col space-y-6 py-8 w-full">
            <div className="space-y-4 sm:space-y-6">
              {/* Header Skeleton */}
              <div>
                <Skeleton className="h-7 w-40 mb-2" />
                <Skeleton className="h-4 w-80" />
              </div>

              {/* Stats Cards Skeleton */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="overflow-hidden rounded-lg bg-[#F9FAFBF9] shadow-none">
                    <CardContent className="p-3 sm:p-4 flex items-center gap-4 h-full">
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-8 w-12" />
                      </div>
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Page List Card Skeleton */}
              <Card className="w-full rounded-lg border border-border shadow-none">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-6 !pb-0">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <Skeleton className="h-9 w-32" />
                </CardHeader>
                <CardContent className="px-6 !pt-4">
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-32" />
                  </div>

                  {/* Pages List Skeleton */}
                  <div className="space-y-2 mb-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 sm:p-4 border-[0.5px] border-[#E5E7EB] rounded-lg h-auto sm:h-[72px]">
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 space-y-2">
                          <div className="flex-1 min-w-0 space-y-2">
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-4 w-full" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                          <Skeleton className="h-5 w-20 rounded-full" />
                          <Skeleton className="h-6 w-11 rounded-full" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Save Actions Bar Skeleton */}
                  <div className="border-t pt-3 sm:pt-4 mt-4 bg-gray-50 -mx-4 sm:-mx-6 px-4 sm:px-6 -mb-4 sm:-mb-6 pb-4 sm:pb-6 rounded-b-lg">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <Skeleton className="h-6 w-32" />
                      <div className="flex gap-2 sm:gap-3">
                        <Skeleton className="h-9 w-24" />
                        <Skeleton className="h-9 w-32" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-start bg-background p-4 pt-8">
      <Card className="shadow-sm w-full rounded-lg border border-border max-w-4xl">
        <CardContent className="flex flex-col space-y-6 py-8 w-full">
          <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div>
              <h2 className="text-xl font-semibold text-foreground">{__('Widget Control', 'surefeedback')}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {__('Control which pages display the SureFeedback widget', 'surefeedback')}
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
              <Card className="overflow-hidden rounded-lg bg-[#F9FAFBF9] shadow-none">
                <CardContent className="p-3 sm:p-4 flex items-center gap-4 h-full">
                  <div className="flex-1">
                    <CardTitle className="text-xs sm:text-sm text-[#475569] font-normal mb-2">{__('Total Pages', 'surefeedback')}</CardTitle>
                    <div className="text-xl sm:text-2xl font-semibold">{pages.length}</div>
                  </div>
                  <div className="flex items-center justify-center flex-shrink-0">
                    <Globe className="h-8 w-8 text-[#9CA3AF]" />
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden rounded-lg bg-[#F9FAFBF9] shadow-none">
                <CardContent className="p-3 sm:p-4 flex items-center gap-4 h-full">
                  <div className="flex-1">
                    <CardTitle className="text-xs sm:text-sm text-[#475569] font-normal mb-2">{__('Enabled Pages', 'surefeedback')}</CardTitle>
                    <div className="text-xl sm:text-2xl font-semibold">{enabledCount}</div>
                  </div>
                  <div className="flex items-center justify-center flex-shrink-0">
                    <img src={SyncedMonitor} alt={__('synced', 'surefeedback')} className="w-8 h-8" />
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden rounded-lg bg-[#F9FAFBF9] shadow-none">
                <CardContent className="p-3 sm:p-4 flex items-center gap-4 h-full">
                  <div className="flex-1">
                    <CardTitle className="text-xs sm:text-sm text-[#475569] font-normal mb-2">{__('Disabled Pages', 'surefeedback')}</CardTitle>
                    <div className="text-xl sm:text-2xl font-semibold">{disabledCount}</div>
                  </div>
                  <div className="flex items-center justify-center flex-shrink-0">
                    <img src={SyncedMonitorOff} alt={__('off - synced', 'surefeedback')} className="w-8 h-8" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bulk Actions */}
            <Card className="w-full rounded-lg border border-border shadow-none">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-6 !pb-0">
                <div className="flex-1">
                  <CardTitle className="text-base sm:text-lg">{__('Page List', 'surefeedback')}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm mt-1">{__('Toggle widget visibility for individual pages', 'surefeedback')}</CardDescription>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  {enabledCount === pages.length ? (
                    <Button
                      onClick={handleDisableAllClick}
                      disabled={saving}
                      variant="outline"
                      size="sm"
                      className="flex-1 sm:flex-initial text-xs sm:text-sm"
                    >
                      {saving ? (
                        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                      ) : (
                        <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                      )}
                      <span className="hidden sm:inline">{__('Disable All Pages', 'surefeedback')}</span>
                      <span className="sm:hidden">{__('Disable All', 'surefeedback')}</span>
                    </Button>
                  ) : (
                    <Button
                      onClick={handleEnableAllClick}
                      disabled={saving}
                      size="sm"
                      className="flex-1 sm:flex-initial text-xs sm:text-sm"
                    >
                      {saving ? (
                        <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
                      ) : (
                        <CheckCheck className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      )}
                      <span className="hidden sm:inline">{__('Enable All Pages', 'surefeedback')}</span>
                      <span className="sm:hidden">{__('Enable All', 'surefeedback')}</span>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="px-6 !pt-4">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    <Input
                      placeholder={__('Search pages...', 'surefeedback')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 sm:pl-10 text-sm h-9 sm:h-10"
                    />
                  </div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 text-sm border rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary h-10"
                  >
                    <option value="all">{__('All Types', 'surefeedback')}</option>
                    <option value="enabled">{__('Enabled Only', 'surefeedback')}</option>
                    <option value="disabled">{__('Disabled Only', 'surefeedback')}</option>
                    <option value="home">{__('Homepage', 'surefeedback')}</option>
                    <option value="page">{__('Pages', 'surefeedback')}</option>
                    <option value="post">{__('Posts', 'surefeedback')}</option>
                    <option value="archive">{__('Archives', 'surefeedback')}</option>
                  </select>
                </div>

                {/* Pages List */}
                <div className="space-y-2 mb-4">
                  {paginatedPages.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2" />
                      <p className="text-sm">{__('No pages found', 'surefeedback')}</p>
                    </div>
                  ) : (
                    paginatedPages.map((page) => (
                      <div
                        key={page.id}
                        className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 sm:p-4 border-[0.5px] border-[#E5E7EB] rounded-lg transition-colors duration-150 h-auto sm:h-[72px]"
                      >
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate text-sm sm:text-base">{page.title}</div>
                            {page.url && (
                              <div className="text-xs sm:text-sm text-[#6B7280] truncate mt-0.5">
                                {page.url}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                          <div className="flex-shrink-0">
                            {getPageTypeBadge(page.type, page.type_label)}
                          </div>
                          <div className="flex-shrink-0">
                            <Switch
                              checked={isPageEnabled(page.id)}
                              onCheckedChange={(checked) => handleToggleChange(page.id, checked)}
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Pagination - only show when not searching */}
                {!searchTerm && totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t pt-4 mb-4">
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      {sprintf(__('Showing %1$d-%2$d of %3$d pages', 'surefeedback'), startIndex + 1, Math.min(endIndex, filteredPages.length), filteredPages.length)}
                    </div>
                    <div className="flex gap-1 sm:gap-2 w-full sm:w-auto justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9"
                      >
                        <span className="hidden sm:inline">{__('Previous', 'surefeedback')}</span>
                        <ChevronLeft className="h-4 w-4 sm:hidden" />
                      </Button>
                      <div className="hidden sm:flex items-center gap-1">
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className="w-8 h-8 sm:w-9 sm:h-9 text-xs sm:text-sm"
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      <div className="flex sm:hidden items-center gap-1 text-xs">
                        <span className="px-2">{currentPage} / {totalPages}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9"
                      >
                        <span className="hidden sm:inline">{__('Next', 'surefeedback')}</span>
                        <ChevronRight className="h-4 w-4 sm:hidden" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Save Actions Bar - Integrated */}
                <div className="border-t pt-3 sm:pt-4 mt-4 bg-gray-50 -mx-4 sm:-mx-6 px-4 sm:px-6 -mb-4 sm:-mb-6 pb-4 sm:pb-6 rounded-b-lg">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {hasUnsavedChanges && (
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-orange-600 bg-orange-50 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md border border-orange-200">
                          <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="font-medium">{__('Unsaved changes', 'surefeedback')}</span>
                        </div>
                      )}
                      {!hasUnsavedChanges && (
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                          <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
                          <span>{__('All changes saved', 'surefeedback')}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 sm:gap-3">
                      <Button
                        variant="outline"
                        onClick={loadPagesSettings}
                        disabled={saving || !hasUnsavedChanges}
                        className="flex-1 sm:flex-initial sm:min-w-[100px] text-xs sm:text-sm h-9"
                      >
                        {__('Cancel', 'surefeedback')}
                      </Button>
                      <Button
                        onClick={saveSettings}
                        disabled={saving || !hasUnsavedChanges}
                        className="flex-1 sm:flex-initial sm:min-w-[140px] text-xs sm:text-sm h-9"
                      >
                        {saving ? (
                          <>
                            <Loader2 className=" h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                            <span className="hidden sm:inline">{__('Saving...', 'surefeedback')}</span>
                            <span className="sm:hidden">{__('Saving...', 'surefeedback')}</span>
                          </>
                        ) : (
                          <>
                            <span className="hidden sm:inline">{__('Save Changes', 'surefeedback')}</span>
                            <span className="sm:hidden">{__('Save', 'surefeedback')}</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Toast Notifications */}
            <Toaster
              position="bottom-right"
              toastOptions={{
                className: 'surefeedback-toast',
                duration: 3000,
              }}
            />

            {/* Enable All Confirmation Dialog */}
            <AlertDialog open={showEnableAllDialog} onOpenChange={setShowEnableAllDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{__('Enable Widget for All Pages?', 'surefeedback')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {__('This will enable the SureFeedback widget on all pages of your website. This action can be undone.', 'surefeedback')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={saving}>{__('Cancel', 'surefeedback')}</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmEnableAll} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {__('Enabling...', 'surefeedback')}
                      </>
                    ) : (
                      __('Enable All', 'surefeedback')
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Disable All Confirmation Dialog */}
            <AlertDialog open={showDisableAllDialog} onOpenChange={setShowDisableAllDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{__('Disable Widget for All Pages?', 'surefeedback')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {__('This will disable the SureFeedback widget on all pages of your website. Users will not be able to leave feedback. This action can be undone.', 'surefeedback')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={saving}>{__('Cancel', 'surefeedback')}</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmDisableAll} disabled={saving} className="bg-red-600 hover:bg-red-700">
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {__('Disabling...', 'surefeedback')}
                      </>
                    ) : (
                      __('Disable All', 'surefeedback')
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WidgetControl;
