import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/auth-context";
import { convertSpotifyToYouTube } from "@/services/conversion";
import { Progress } from "@/components/ui/progress";

interface ConversionDialogProps {
  playlistId: string;
  playlistName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ConversionDialog({
  playlistId,
  playlistName,
  isOpen,
  onClose,
}: Readonly<ConversionDialogProps>) {
  const { user } = useAuth();
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTrack, setCurrentTrack] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleConversion = async () => {
    if (!user) return;

    setConverting(true);
    setError(null);

    try {
      await convertSpotifyToYouTube(
        user.id,
        playlistId,
        ({ processed, total, currentTrack }) => {
          setProgress((processed / total) * 100);
          setCurrentTrack(currentTrack);
        },
      );

      // Success - wait a moment before closing
      setTimeout(() => {
        onClose();
        setConverting(false);
        setProgress(0);
        setCurrentTrack("");
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conversion failed");
      setConverting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Convert Playlist</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-muted-foreground mb-4">
            Convert &#34;{playlistName}&#34; to a YouTube playlist?
          </p>

          {converting && (
            <div className="space-y-4">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                Converting: {currentTrack}
              </p>
            </div>
          )}

          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted"
            disabled={converting}
          >
            Cancel
          </button>
          <button
            onClick={handleConversion}
            disabled={converting}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-opacity-90 disabled:opacity-50"
          >
            {converting ? "Converting..." : "Convert"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
