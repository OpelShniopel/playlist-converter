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
  selectedTracks?: string[];
  isOpen: boolean;
  onClose: () => void;
}

export function ConversionDialog({
  playlistId,
  playlistName,
  selectedTracks = [],
  isOpen,
  onClose,
}: Readonly<ConversionDialogProps>) {
  const { user } = useAuth();
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTrack, setCurrentTrack] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [customName, setCustomName] = useState(playlistName);

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
        selectedTracks.length > 0 ? selectedTracks : undefined,
        customName, // Pass the custom name to the conversion function
      );

      // Success - wait a moment before closing
      setTimeout(() => {
        onClose();
        setConverting(false);
        setProgress(0);
        setCurrentTrack("");
        setCustomName(playlistName); // Reset the custom name
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
          <div className="space-y-4">
            <div>
              <label
                htmlFor="playlistName"
                className="block text-sm font-medium text-foreground mb-1"
              >
                YouTube Playlist Name
              </label>
              <input
                type="text"
                id="playlistName"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                placeholder="Enter playlist name"
                disabled={converting}
              />
            </div>

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
            disabled={converting || !customName.trim()}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-opacity-90 disabled:opacity-50"
          >
            {converting ? "Converting..." : "Convert"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
