import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  Dimensions,
  ScrollView,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import {
  Upload,
  Video as VideoIcon,
  X,
  Play,
  Pause,
  Trash2,
  Check,
  AlertCircle,
  Info,
  Youtube,
  Link,
  Camera,
  FolderOpen,
  Clock,
  FileVideo,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
} from "lucide-react-native";

// Types
export interface VideoData {
  uri: string;
  thumbnail?: string;
  duration?: number;
  size?: number;
  name?: string;
  type?: string;
  uploaded?: boolean;
  progress?: number;
  error?: string;
}

interface VideoUploaderProps {
  value?: VideoData;
  onChange: (data: VideoData) => void;
  onUpload?: (file: any) => Promise<void>;
  maxDuration?: number; // seconds
  maxSize?: number; // bytes
  acceptVideoTypes?: string[];
  placeholder?: string;
  showPreview?: boolean;
  showProgress?: boolean;
  showControls?: boolean;
  allowThumbnailCapture?: boolean;
  allowTrim?: boolean;
  loading?: boolean;
  error?: string;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  helperText?: string;
}

// Constants
const { width: screenWidth } = Dimensions.get("window");
const MAX_DURATION = 300; // 5 minutes
const MAX_SIZE = 100 * 1024 * 1024; // 100MB
const ACCEPTED_TYPES = ["video/mp4", "video/quicktime", "video/x-msvideo"];

// Mock video thumbnail generation (in real app, use expo-video-thumbnails)
const generateThumbnail = async (videoUri: string): Promise<string> => {
  // In real app, use expo-video-thumbnails library
  // For now, return a placeholder
  return "https://via.placeholder.com/640x360/4F46E5/FFFFFF?text=Video+Thumbnail";
};

export default function VideoUploader({
  value,
  onChange,
  onUpload,
  maxDuration = MAX_DURATION,
  maxSize = MAX_SIZE,
  acceptVideoTypes = ACCEPTED_TYPES,
  placeholder = "Upload your pitch video",
  showPreview = true,
  showProgress = true,
  showControls = true,
  allowThumbnailCapture = true,
  allowTrim = false,
  loading = false,
  error,
  disabled = false,
  label = "Pitch Video",
  required = false,
  helperText = "Upload a video pitch to attract more investors (Max 5 minutes)",
}: VideoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [showTrimModal, setShowTrimModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const videoRef = useRef<Video>(null);
  const fileInputRef = useRef<any>(null);

  // Check if video is valid
  const isValidVideo = value?.uri && !value?.error;

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Format duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Pick video from gallery
  const pickVideo = useCallback(async () => {
    if (disabled) return;

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Please grant permission to access your media library to upload videos."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
        videoMaxDuration: maxDuration,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const videoData: VideoData = {
          uri: asset.uri,
          name: asset.fileName || "video.mp4",
          size: asset.fileSize || 0,
          type: asset.type || "video/mp4",
          duration: asset.duration || 0,
          progress: 0,
          uploaded: false,
        };

        // Validate size
        if (videoData.size && videoData.size > maxSize) {
          Alert.alert(
            "File Too Large",
            `Video size (${formatFileSize(videoData.size)}) exceeds the maximum allowed size (${formatFileSize(maxSize)})`
          );
          return;
        }

        // Validate duration
        if (videoData.duration && videoData.duration > maxDuration) {
          Alert.alert(
            "Video Too Long",
            `Video duration (${formatDuration(videoData.duration)}) exceeds the maximum allowed duration (${formatDuration(maxDuration)})`
          );
          return;
        }

        // Generate thumbnail
        const thumb = await generateThumbnail(asset.uri);
        setThumbnailUri(thumb);
        videoData.thumbnail = thumb;

        onChange(videoData);

        // Auto-upload if callback provided
        if (onUpload) {
          await handleUpload(videoData);
        }
      }
    } catch (err) {
      setErrorMessage("Failed to pick video. Please try again.");
      console.error("Error picking video:", err);
    }
  }, [disabled, maxDuration, maxSize, onChange, onUpload]);

  // Record video with camera
  const recordVideo = useCallback(async () => {
    if (disabled) return;

    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Please grant permission to access your camera to record videos."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
        videoMaxDuration: maxDuration,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const videoData: VideoData = {
          uri: asset.uri,
          name: asset.fileName || "video.mp4",
          size: asset.fileSize || 0,
          type: asset.type || "video/mp4",
          duration: asset.duration || 0,
          progress: 0,
          uploaded: false,
        };

        // Validate size
        if (videoData.size && videoData.size > maxSize) {
          Alert.alert(
            "File Too Large",
            `Video size (${formatFileSize(videoData.size)}) exceeds the maximum allowed size (${formatFileSize(maxSize)})`
          );
          return;
        }

        // Generate thumbnail
        const thumb = await generateThumbnail(asset.uri);
        setThumbnailUri(thumb);
        videoData.thumbnail = thumb;

        onChange(videoData);

        if (onUpload) {
          await handleUpload(videoData);
        }
      }
    } catch (err) {
      setErrorMessage("Failed to record video. Please try again.");
      console.error("Error recording video:", err);
    }
  }, [disabled, maxDuration, maxSize, onChange, onUpload]);

  // Handle upload
  const handleUpload = useCallback(async (videoData: VideoData) => {
    if (!onUpload) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + 5;
        });
      }, 200);

      await onUpload(videoData);

      clearInterval(interval);
      setUploadProgress(100);

      onChange({
        ...videoData,
        uploaded: true,
        progress: 100,
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Upload failed. Please try again.");
      onChange({
        ...videoData,
        error: err.message || "Upload failed",
        uploaded: false,
      });
    } finally {
      setIsUploading(false);
    }
  }, [onUpload, onChange]);

  // Remove video
  const removeVideo = useCallback(() => {
    onChange({
      uri: "",
      uploaded: false,
      progress: 0,
    });
    setThumbnailUri(null);
    setErrorMessage(null);
    setUploadProgress(0);
  }, [onChange]);

  // Video controls
  const togglePlay = useCallback(async () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const toggleMute = useCallback(async () => {
    if (!videoRef.current) return;
    await videoRef.current.setIsMutedAsync(!isMuted);
    setIsMuted(!isMuted);
  }, [isMuted]);

  const toggleFullscreen = useCallback(async () => {
    if (!videoRef.current) return;
    // In real app, use Video fullscreen API
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  const handlePlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setDuration(status.durationMillis || 0);
      setPosition(status.positionMillis || 0);
      setIsPlaying(status.isPlaying);
    }
  }, []);

  // Render upload button
  const renderUploadButton = () => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => {
        Alert.alert(
          "Add Video",
          "Choose how you want to add a video",
          [
            { text: "Choose from Gallery", onPress: pickVideo },
            { text: "Record with Camera", onPress: recordVideo },
            { text: "Cancel", style: "cancel" },
          ],
          { cancelable: true }
        );
      }}
      style={[styles.uploadButton, disabled && styles.uploadButtonDisabled]}
      disabled={disabled}
    >
      <LinearGradient
        colors={["#EEF2FF", "#E0E7FF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.uploadGradient}
      >
        <View style={styles.uploadIconContainer}>
          <VideoIcon size={32} color="#4F46E5" strokeWidth={1.5} />
        </View>
        <Text style={styles.uploadTitle}>{placeholder}</Text>
        <Text style={styles.uploadSubtitle}>
          Tap to upload or record a video
        </Text>
        <View style={styles.uploadRequirements}>
          <View style={styles.requirementChip}>
            <Clock size={12} color="#6B7280" />
            <Text style={styles.requirementText}>
              Max {formatDuration(maxDuration)}
            </Text>
          </View>
          <View style={styles.requirementChip}>
            <FileVideo size={12} color="#6B7280" />
            <Text style={styles.requirementText}>
              Max {formatFileSize(maxSize)}
            </Text>
          </View>
          <View style={styles.requirementChip}>
            <Check size={12} color="#6B7280" />
            <Text style={styles.requirementText}>MP4, MOV, AVI</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  // Render video preview
  const renderVideoPreview = () => {
    if (!isValidVideo) return null;

    return (
      <View style={styles.previewContainer}>
        <View style={styles.videoWrapper}>
          <Video
            ref={videoRef}
            source={{ uri: value.uri }}
            style={styles.videoPlayer}
            resizeMode={ResizeMode.CONTAIN}
            isLooping={false}
            shouldPlay={false}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          />

          {/* Video Controls Overlay */}
          {showControls && (
            <View style={styles.controlsOverlay}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={togglePlay}
                style={styles.playButton}
              >
                {isPlaying ? (
                  <Pause size={40} color="#FFFFFF" />
                ) : (
                  <Play size={40} color="#FFFFFF" />
                )}
              </TouchableOpacity>

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${(position / duration) * 100}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.timeText}>
                  {formatDuration(position / 1000)} / {formatDuration(duration / 1000)}
                </Text>
              </View>

              {/* Control Buttons */}
              <View style={styles.controlButtons}>
                <TouchableOpacity onPress={toggleMute} style={styles.controlButton}>
                  {isMuted ? (
                    <VolumeX size={20} color="#FFFFFF" />
                  ) : (
                    <Volume2 size={20} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
                <TouchableOpacity onPress={toggleFullscreen} style={styles.controlButton}>
                  <Maximize2 size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Upload Progress */}
          {showProgress && isUploading && (
            <View style={styles.progressOverlay}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={styles.progressText}>
                Uploading... {Math.round(uploadProgress)}%
              </Text>
              <View style={styles.progressBarLarge}>
                <View
                  style={[
                    styles.progressFillLarge,
                    { width: `${uploadProgress}%` },
                  ]}
                />
              </View>
            </View>
          )}

          {/* Status Badge */}
          {value.uploaded && (
            <View style={styles.uploadedBadge}>
              <CheckCircle size={14} color="#FFFFFF" />
              <Text style={styles.uploadedBadgeText}>Uploaded</Text>
            </View>
          )}

          {value.error && (
            <View style={styles.errorBadge}>
              <AlertTriangle size={14} color="#FFFFFF" />
              <Text style={styles.errorBadgeText}>Upload Failed</Text>
            </View>
          )}
        </View>

        {/* Video Info */}
        <View style={styles.videoInfo}>
          <View style={styles.videoInfoLeft}>
            <Text style={styles.videoInfoName}>{value.name || "Video"}</Text>
            <View style={styles.videoInfoDetails}>
              <Text style={styles.videoInfoDetail}>
                {formatDuration(value.duration || 0)}
              </Text>
              {value.size && (
                <>
                  <Text style={styles.videoInfoDot}>•</Text>
                  <Text style={styles.videoInfoDetail}>
                    {formatFileSize(value.size)}
                  </Text>
                </>
              )}
            </View>
          </View>
          <View style={styles.videoInfoActions}>
            {allowThumbnailCapture && (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  // Capture thumbnail from current frame
                }}
                style={styles.videoInfoAction}
              >
                <Camera size={16} color="#4F46E5" />
                <Text style={styles.videoInfoActionText}>Thumbnail</Text>
              </TouchableOpacity>
            )}
            {allowTrim && (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setShowTrimModal(true)}
                style={styles.videoInfoAction}
              >
                <RotateCcw size={16} color="#4F46E5" />
                <Text style={styles.videoInfoActionText}>Trim</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setShowPreviewModal(true)}
              style={styles.videoInfoAction}
            >
              <Maximize2 size={16} color="#4F46E5" />
              <Text style={styles.videoInfoActionText}>Preview</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={removeVideo}
              style={[styles.videoInfoAction, styles.videoInfoActionDanger]}
            >
              <Trash2 size={16} color="#EF4444" />
              <Text style={styles.videoInfoActionDangerText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Error Message */}
        {errorMessage && (
          <View style={styles.errorContainer}>
            <AlertCircle size={16} color="#EF4444" />
            <Text style={styles.errorMessageText}>{errorMessage}</Text>
            <TouchableOpacity
              onPress={() => setErrorMessage(null)}
              style={styles.errorClose}
            >
              <X size={16} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // Render preview modal
  const renderPreviewModal = () => (
    <Modal
      visible={showPreviewModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowPreviewModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Video Preview</Text>
            <TouchableOpacity onPress={() => setShowPreviewModal(false)}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <View style={styles.modalVideoContainer}>
            <Video
              ref={videoRef}
              source={{ uri: value?.uri }}
              style={styles.modalVideo}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay={true}
              isLooping={true}
            />
          </View>
          <View style={styles.modalFooter}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setShowPreviewModal(false)}
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Render trim modal
  const renderTrimModal = () => (
    <Modal
      visible={showTrimModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowTrimModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Trim Video</Text>
            <TouchableOpacity onPress={() => setShowTrimModal(false)}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <View style={styles.trimContainer}>
            <Text style={styles.trimInfo}>
              Adjust the start and end points of your video
            </Text>
            <View style={styles.trimPlaceholder}>
              <VideoIcon size={48} color="#D1D5DB" />
              <Text style={styles.trimPlaceholderText}>
                Trim feature coming soon
              </Text>
            </View>
          </View>
          <View style={styles.modalFooter}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setShowTrimModal(false)}
              style={[styles.modalButton, styles.modalButtonSecondary]}
            >
              <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setShowTrimModal(false)}
              style={[styles.modalButton, styles.modalButtonPrimary]}
            >
              <Text style={styles.modalButtonPrimaryText}>Apply Trim</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Label */}
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
          {helperText && <Text style={styles.helperText}>{helperText}</Text>}
        </View>
      )}

      {/* Upload or Preview */}
      {!isValidVideo || !showPreview ? renderUploadButton() : renderVideoPreview()}

      {/* Error from props */}
      {error && !errorMessage && (
        <View style={styles.propErrorContainer}>
          <AlertCircle size={16} color="#EF4444" />
          <Text style={styles.propErrorText}>{error}</Text>
        </View>
      )}

      {/* Modals */}
      {renderPreviewModal()}
      {renderTrimModal()}
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 8,
  },
  labelContainer: {
    gap: 4,
  },
  label: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "600",
  },
  required: {
    color: "#EF4444",
  },
  helperText: {
    color: "#6B7280",
    fontSize: 12,
  },
  uploadButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadGradient: {
    padding: 32,
    alignItems: "center",
    gap: 8,
    borderWidth: 2,
    borderColor: "#C7D2FE",
    borderStyle: "dashed",
    borderRadius: 16,
  },
  uploadIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  uploadTitle: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 4,
  },
  uploadSubtitle: {
    color: "#6B7280",
    fontSize: 13,
  },
  uploadRequirements: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  requirementChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
  },
  requirementText: {
    color: "#6B7280",
    fontSize: 11,
    fontWeight: "500",
  },
  previewContainer: {
    gap: 12,
  },
  videoWrapper: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#111827",
    aspectRatio: 16 / 9,
    width: "100%",
  },
  videoPlayer: {
    width: "100%",
    height: "100%",
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  progressContainer: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    gap: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4F46E5",
    borderRadius: 2,
  },
  timeText: {
    color: "#FFFFFF",
    fontSize: 12,
    textAlign: "center",
  },
  controlButtons: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    gap: 12,
  },
  controlButton: {
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 8,
  },
  progressOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  progressText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  progressBarLarge: {
    width: "80%",
    height: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFillLarge: {
    height: "100%",
    backgroundColor: "#4F46E5",
    borderRadius: 3,
  },
  uploadedBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "rgba(16,185,129,0.9)",
    borderRadius: 999,
  },
  uploadedBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  errorBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "rgba(239,68,68,0.9)",
    borderRadius: 999,
  },
  errorBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  videoInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
  },
  videoInfoLeft: {
    gap: 2,
  },
  videoInfoName: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "600",
  },
  videoInfoDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  videoInfoDetail: {
    color: "#6B7280",
    fontSize: 12,
  },
  videoInfoDot: {
    color: "#6B7280",
    fontSize: 12,
  },
  videoInfoActions: {
    flexDirection: "row",
    gap: 8,
  },
  videoInfoAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
  },
  videoInfoActionText: {
    color: "#4F46E5",
    fontSize: 11,
    fontWeight: "500",
  },
  videoInfoActionDanger: {
    backgroundColor: "#FEF2F2",
  },
  videoInfoActionDangerText: {
    color: "#EF4444",
    fontSize: 11,
    fontWeight: "500",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
  },
  errorMessageText: {
    color: "#EF4444",
    fontSize: 13,
    flex: 1,
  },
  errorClose: {
    padding: 4,
  },
  propErrorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
  },
  propErrorText: {
    color: "#EF4444",
    fontSize: 13,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    maxWidth: 500,
    width: "100%",
    maxHeight: "90%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "700",
  },
  modalVideoContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#111827",
  },
  modalVideo: {
    width: "100%",
    height: "100%",
  },
  modalFooter: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  modalCloseButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    alignItems: "center",
  },
  modalCloseButtonText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "600",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  modalButtonPrimary: {
    backgroundColor: "#4F46E5",
  },
  modalButtonPrimaryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  modalButtonSecondary: {
    backgroundColor: "#F3F4F6",
  },
  modalButtonSecondaryText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "600",
  },
  trimContainer: {
    padding: 20,
    gap: 12,
    minHeight: 200,
  },
  trimInfo: {
    color: "#6B7280",
    fontSize: 14,
    textAlign: "center",
  },
  trimPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 40,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
  },
  trimPlaceholderText: {
    color: "#9CA3AF",
    fontSize: 14,
  },
});