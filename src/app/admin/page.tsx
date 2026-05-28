'use client';

import { useState, useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Edit2, Trash2, Tv, RefreshCw, ArrowLeft } from 'lucide-react';
import channelData from '@/lib/channels.json';
import { useRouter } from 'next/navigation';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function AdminPanel() {
  const router = useRouter();
  const db = useFirestore();

  const channelsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'channels'), orderBy('category'));
  }, [db]);

  const { data: channels, loading } = useCollection(channelsQuery);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    category: 'Bengali News',
    stream_url: '',
    youtube_id: '',
  });

  const categories = ['Bengali News', 'Hindi News', 'English News'];

  const handleSeedData = () => {
    if (!db) return;
    const channelsRef = collection(db, 'channels');
    channelData.channels.forEach((channel) => {
      addDoc(channelsRef, channel).catch(async (e) => {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: channelsRef.path,
            operation: 'create',
            requestResourceData: channel,
          })
        );
      });
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    const channelsRef = collection(db, 'channels');

    if (editingId) {
      const docRef = doc(db, 'channels', editingId);
      updateDoc(docRef, formData).catch(async (e) => {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: docRef.path,
            operation: 'update',
            requestResourceData: formData,
          })
        );
      });
      setEditingId(null);
    } else {
      const newChannel = {
        ...formData,
        id: formData.name.toLowerCase().replace(/\s+/g, '-'),
      };
      addDoc(channelsRef, newChannel).catch(async (e) => {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: channelsRef.path,
            operation: 'create',
            requestResourceData: newChannel,
          })
        );
      });
    }
    setFormData({
      name: '',
      logo: '',
      category: 'Bengali News',
      stream_url: '',
      youtube_id: '',
    });
  };

  const handleEdit = (channel: any) => {
    setEditingId(channel.__id);
    setFormData({
      name: channel.name || '',
      logo: channel.logo || '',
      category: channel.category || 'Bengali News',
      stream_url: channel.stream_url || '',
      youtube_id: channel.youtube_id || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (!db) return;
    if (confirm('Delete this channel?')) {
      const docRef = doc(db, 'channels', id);
      deleteDoc(docRef).catch(async (e) => {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: docRef.path,
            operation: 'delete',
          })
        );
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-body">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/')}
              className="md:hidden"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div className="flex items-center gap-2">
              <Tv className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">Admin Panel</h1>
            </div>
          </div>
          <div className="flex gap-2">
            {channels?.length === 0 && !loading && (
              <Button
                variant="outline"
                onClick={handleSeedData}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Seed Initial Data
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="hidden md:flex gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> View App
            </Button>
          </div>
        </div>

        <Card className="shadow-lg border-primary/20">
          <CardHeader className="bg-primary/5">
            <CardTitle>{editingId ? 'Edit Channel' : 'Add New Channel'}</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="space-y-2">
                <Label>Channel Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g. Republic Bangla"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData({ ...formData, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Logo URL</Label>
                <Input
                  value={formData.logo}
                  onChange={(e) =>
                    setFormData({ ...formData, logo: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label>HLS Stream URL (.m3u8)</Label>
                <Input
                  value={formData.stream_url}
                  onChange={(e) =>
                    setFormData({ ...formData, stream_url: e.target.value })
                  }
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <Label>YouTube Video ID</Label>
                <Input
                  value={formData.youtube_id}
                  onChange={(e) =>
                    setFormData({ ...formData, youtube_id: e.target.value })
                  }
                  placeholder="Optional (e.g. PKwLsAu-z10)"
                />
              </div>
              <div className="md:col-span-2 pt-2 flex gap-2">
                <Button type="submit" className="flex-1 gap-2">
                  {editingId ? (
                    <Edit2 className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  {editingId ? 'Update Channel' : 'Add Channel'}
                </Button>
                {editingId && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setEditingId(null);
                      setFormData({
                        name: '',
                        logo: '',
                        category: 'Bengali News',
                        stream_url: '',
                        youtube_id: '',
                      });
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {channels?.map((channel) => (
            <Card key={channel.__id} className="relative overflow-hidden group">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded border overflow-hidden shrink-0 flex items-center justify-center">
                  {channel.logo ? (
                    <img
                      src={channel.logo}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Tv className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold truncate">{channel.name}</h3>
                  <p className="text-[10px] text-muted-foreground">
                    {channel.category}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => handleEdit(channel)}
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive"
                    onClick={() => handleDelete(channel.__id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center p-12">
            <RefreshCw className="w-8 h-8 animate-spin text-primary/20" />
          </div>
        )}
      </div>
    </div>
  );
}
