'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileText, Upload, Trash2, Eye, CheckCircle, AlertCircle, Clock, File, FileJson, FileSpreadsheet } from 'lucide-react';
import { useAuth } from '@/lib/auth-provider';
import { supabase } from '@/lib/supabase/client';
import type { KnowledgeBaseDocument, Business } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

const statusColors = {
  processing: 'bg-yellow-500/10 text-yellow-500',
  ready: 'bg-green-500/10 text-green-500',
  error: 'bg-red-500/10 text-red-500',
};

const statusIcons = {
  processing: Clock,
  ready: CheckCircle,
  error: AlertCircle,
};

const fileTypeIcons: Record<string, typeof File> = {
  'application/pdf': FileText,
  'application/json': FileJson,
  'text/csv': FileSpreadsheet,
  'default': File,
};

export default function KnowledgeBasePage() {
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [documents, setDocuments] = useState<KnowledgeBaseDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeBaseDocument | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const { data: businessData } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (businessData) {
        setBusiness(businessData);

        const { data: docsData } = await supabase
          .from('knowledge_base_documents')
          .select('*')
          .eq('business_id', businessData.id)
          .order('created_at', { ascending: false });

        setDocuments(docsData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !business) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + 10;
        });
      }, 100);

      // For demo, we'll just create a record without actual file upload
      // In production, you'd upload to Supabase Storage first
      const { error } = await supabase.from('knowledge_base_documents').insert({
        business_id: business.id,
        user_id: user!.id,
        name: file.name,
        file_type: file.type,
        file_size: file.size,
        status: 'processing',
        file_url: null,
        content_text: null,
      });

      clearInterval(interval);
      setUploadProgress(100);

      if (error) throw error;

      // Simulate processing completion after 2 seconds
      setTimeout(async () => {
        const newDocs = await supabase
          .from('knowledge_base_documents')
          .select('*')
          .eq('business_id', business.id)
          .order('created_at', { ascending: false });

        if (newDocs.data) {
          // Update the processing doc to ready
          const processingDocs = newDocs.data.filter(d => d.status === 'processing');
          for (const doc of processingDocs) {
            await supabase
              .from('knowledge_base_documents')
              .update({ status: 'ready' })
              .eq('id', doc.id);
          }
          fetchData();
        }
      }, 2000);

      toast.success('Document uploaded and processing');
      fetchData();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const deleteDocument = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const { error } = await supabase
        .from('knowledge_base_documents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Document deleted');
      fetchData();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '-';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Knowledge Base</h1>
          <p className="text-muted-foreground">Upload documents to train your AI employee</p>
        </div>
      </div>

      {/* Upload Card */}
      <Card className="border-2 border-dashed">
        <CardContent className="py-8">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Upload Documents</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload PDFs, price sheets, FAQs, and more. Your AI will use this information to answer customer questions.
            </p>

            {uploading ? (
              <div className="max-w-xs mx-auto">
                <Progress value={uploadProgress} className="mb-2" />
                <p className="text-sm text-muted-foreground">Uploading... {uploadProgress}%</p>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.csv,.json"
                  onChange={handleFileUpload}
                />
                <Button asChild>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    Select File
                  </label>
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Supported: PDF, Word, Text, CSV, JSON (max 10MB)
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold">{documents.length}</p>
            <p className="text-sm text-muted-foreground">Total Documents</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold text-green-500">
              {documents.filter((d) => d.status === 'ready').length}
            </p>
            <p className="text-sm text-muted-foreground">Ready</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold text-yellow-500">
              {documents.filter((d) => d.status === 'processing').length}
            </p>
            <p className="text-sm text-muted-foreground">Processing</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold text-red-500">
              {documents.filter((d) => d.status === 'error').length}
            </p>
            <p className="text-sm text-muted-foreground">Errors</p>
          </CardContent>
        </Card>
      </div>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>Manage your uploaded knowledge base documents</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    No documents uploaded yet
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((doc) => {
                  const StatusIcon = statusIcons[doc.status];
                  const FileIcon = fileTypeIcons[doc.file_type || ''] || fileTypeIcons['default'];

                  return (
                    <TableRow key={doc.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                            <FileIcon className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <span className="font-medium">{doc.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {doc.file_type?.split('/')[1]?.toUpperCase() || 'Unknown'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatFileSize(doc.file_size)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[doc.status]}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {doc.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(doc.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedDoc(doc);
                              setDetailsOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => deleteDocument(doc.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Document Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Document Details</DialogTitle>
          </DialogHeader>
          {selectedDoc && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-4 p-4 bg-secondary rounded-lg">
                <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center">
                  {(fileTypeIcons[selectedDoc.file_type || ''] || fileTypeIcons['default'])({ className: 'w-6 h-6' })}
                </div>
                <div>
                  <p className="font-medium">{selectedDoc.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(selectedDoc.file_size)} • {selectedDoc.file_type?.split('/')[1]?.toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant="outline" className={statusColors[selectedDoc.status]}>
                    {selectedDoc.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Uploaded</p>
                  <p className="font-medium">{format(new Date(selectedDoc.created_at), 'PPp')}</p>
                </div>
              </div>

              {selectedDoc.content_text && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Extracted Content Preview</p>
                  <div className="p-4 bg-secondary rounded-lg max-h-48 overflow-y-auto">
                    <p className="text-sm whitespace-pre-wrap">
                      {selectedDoc.content_text.slice(0, 500)}...
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
