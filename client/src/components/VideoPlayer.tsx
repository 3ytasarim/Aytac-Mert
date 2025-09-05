import { useState, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface VideoPlayerProps {
  videoUrl: string;
  videoType: "embed" | "upload";
  title?: string;
}

function VideoEmbed({ url, title }: { url: string; title?: string }) {
  // Support for various video platforms
  if (!url || typeof url !== 'string') {
    return (
      <div className="w-full h-64 bg-gray-100 flex items-center justify-center rounded-lg">
        <p className="text-gray-500">Geçersiz video URL'si</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-0 pb-[56.25%] rounded-lg overflow-hidden">
      <iframe
        src={url}
        title={title || "Video"}
        className="absolute top-0 left-0 w-full h-full"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

function CustomVideoPlayer({ videoUrl, title }: { videoUrl: string; title?: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState([1]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (videoElement) {
      const updateTime = () => setCurrentTime(videoElement.currentTime);
      const updateDuration = () => setDuration(videoElement.duration);
      
      videoElement.addEventListener('timeupdate', updateTime);
      videoElement.addEventListener('loadedmetadata', updateDuration);
      
      return () => {
        videoElement.removeEventListener('timeupdate', updateTime);
        videoElement.removeEventListener('loadedmetadata', updateDuration);
      };
    }
  }, [videoElement]);

  const togglePlay = () => {
    if (videoElement) {
      if (isPlaying) {
        videoElement.pause();
      } else {
        videoElement.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoElement) {
      videoElement.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    const vol = newVolume[0];
    setVolume([vol]);
    if (videoElement) {
      videoElement.volume = vol;
      if (vol === 0 && !isMuted) {
        setIsMuted(true);
        videoElement.muted = true;
      } else if (vol > 0 && isMuted) {
        setIsMuted(false);
        videoElement.muted = false;
      }
    }
  };

  const handleProgressChange = (newTime: number[]) => {
    const time = newTime[0];
    setCurrentTime(time);
    if (videoElement) {
      videoElement.currentTime = time;
    }
  };

  const toggleFullscreen = () => {
    if (videoElement?.parentElement) {
      if (!isFullscreen) {
        videoElement.parentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const showControlsTemporarily = () => {
    setShowControls(true);
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    setControlsTimeout(setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000));
  };

  return (
    <div 
      className="relative w-full bg-black rounded-lg overflow-hidden group"
      onMouseMove={showControlsTemporarily}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={setVideoElement}
        src={videoUrl}
        className="w-full h-auto max-h-[500px]"
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      
      {/* Custom Controls */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
        {/* Progress Bar */}
        <div className="mb-4">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={handleProgressChange}
            className="w-full cursor-pointer"
          />
        </div>
        
        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlay}
              className="text-white hover:text-gray-300 hover:bg-white/20"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="text-white hover:text-gray-300 hover:bg-white/20"
              >
                {isMuted || volume[0] === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <div className="w-20">
                <Slider
                  value={volume}
                  max={1}
                  step={0.1}
                  onValueChange={handleVolumeChange}
                  className="cursor-pointer"
                />
              </div>
            </div>
            
            <span className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="text-white hover:text-gray-300 hover:bg-white/20"
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function VideoPlayer({ videoUrl, videoType, title }: VideoPlayerProps) {
  if (!videoUrl) {
    return (
      <div className="w-full h-64 bg-gray-100 flex items-center justify-center rounded-lg">
        <p className="text-gray-500">Video bulunamadı</p>
      </div>
    );
  }

  if (videoType === "embed") {
    return <VideoEmbed url={videoUrl} title={title} />;
  } else {
    return <CustomVideoPlayer videoUrl={videoUrl} title={title} />;
  }
}