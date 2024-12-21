import { useCallback, useEffect, useState } from 'react';
import { ArrowPathIcon, TrashIcon } from '@heroicons/react/24/outline';

import { deleteConversion, getConversionHistory } from '@/services/conversion';
import { useAuth } from '@/context/auth-context';

interface Conversion {
  id: string;
  sourcePlaylistId: string;
  sourceType: 'spotify' | 'youtube';
  targetPlaylistId?: string;
  targetType: 'spotify' | 'youtube';
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export function ConversionHistory() {
  const { user } = useAuth();
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const loadConversions = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const history = await getConversionHistory(user.id);
      setConversions(history);
    } catch (err) {
      console.error('Error loading conversion history:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to load conversions'
      );
    } finally {
      setLoading(false);
    }
  }, [user]); // user is the only dependency for this function

  useEffect(() => {
    loadConversions();
  }, [loadConversions]);

  async function handleDelete(conversionId: string) {
    if (!user || deletingIds.has(conversionId)) return;

    try {
      setDeletingIds((prev) => new Set(prev).add(conversionId));
      await deleteConversion(conversionId);
      setConversions((prev) => prev.filter((conv) => conv.id !== conversionId));
    } catch (err) {
      console.error('Error deleting conversion:', err);
      // Show an error message to user
    } finally {
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(conversionId);
        return newSet;
      });
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        <p>Error loading conversion history: {error}</p>
      </div>
    );
  }

  if (conversions.length === 0) {
    return (
      <div className="py-12 text-center">
        <ArrowPathIcon className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium text-foreground">
          No conversions yet
        </h3>
        <p className="mt-2 text-muted-foreground">
          Convert a playlist to see your conversion history here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {conversions.map((conversion) => (
        <div
          key={conversion.id}
          className="rounded-lg border border-border bg-background p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">
                  {conversion.sourceType.toUpperCase()} to{' '}
                  {conversion.targetType.toUpperCase()}
                </span>
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    conversion.status === 'completed'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : conversion.status === 'processing'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}
                >
                  {conversion.status.charAt(0).toUpperCase() +
                    conversion.status.slice(1)}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {new Date(conversion.createdAt).toLocaleDateString()} at{' '}
                {new Date(conversion.createdAt).toLocaleTimeString()}
              </p>
            </div>
            <div className="flex items-center">
              {conversion.status === 'failed' && conversion.error && (
                <div className="mr-4 text-sm text-red-500">
                  {conversion.error}
                </div>
              )}
              <button
                onClick={() => handleDelete(conversion.id)}
                disabled={deletingIds.has(conversion.id)}
                className={`rounded-full p-2 text-muted-foreground transition-colors hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30 ${
                  deletingIds.has(conversion.id)
                    ? 'cursor-not-allowed opacity-50'
                    : ''
                }`}
                title="Delete conversion"
              >
                {deletingIds.has(conversion.id) ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-t-2 border-current"></div>
                ) : (
                  <TrashIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          {conversion.status === 'processing' && (
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${conversion.progress}%` }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
