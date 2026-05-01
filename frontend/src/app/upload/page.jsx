"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { API_BASE_URL } from "@/lib/constants";
import styles from "./page.module.css";

export default function UploadPage() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState("visual");
  const [selectedTags, setSelectedTags] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const suggestedTags = useMemo(() => ["#neon", "#cityscape", "#loop", "#ambient"], []);

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleBrowse = () => {
    inputRef.current?.click();
  };

  const handleFileSelect = (nextFile) => {
    setError("");
    setSuccess("");
    if (!nextFile) return;

    const allowedTypes = ["video/mp4", "video/quicktime"];
    const maxSize = 100 * 1024 * 1024;

    if (!allowedTypes.includes(nextFile.type)) {
      setError("Only MP4 or MOV files are allowed.");
      return;
    }

    if (nextFile.size > maxSize) {
      setError("Video must be smaller than 100MB.");
      return;
    }

    setFile(nextFile);
  };

  const handleInputChange = (event) => {
    const nextFile = event.target.files?.[0];
    handleFileSelect(nextFile);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const nextFile = event.dataTransfer.files?.[0];
    handleFileSelect(nextFile);
  };

  const toggleTag = (tag) => {
    setSelectedTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]
    );
  };

  const validateForm = () => {
    if (!file) {
      return "Please add a video file.";
    }
    if (!title.trim()) {
      return "Please enter a reel title.";
    }
    if (caption.trim().length > 300) {
      return "Caption should be 300 characters or less.";
    }
    return "";
  };

  const uploadReel = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setSuccess("");
    setProgress(0);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("video", file);
    formData.append("caption", caption.trim());
    formData.append("title", title.trim());
    formData.append("category", category);
    formData.append("tags", selectedTags.join(","));

    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

    await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API_BASE_URL}/api/videos`);

      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      }

      xhr.upload.addEventListener("progress", (event) => {
        if (!event.lengthComputable) return;
        const percent = Math.round((event.loaded / event.total) * 100);
        setProgress(percent);
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
          return;
        }

        let message = "Upload failed";
        try {
          const payload = JSON.parse(xhr.responseText || "{}");
          message = payload.message || message;
        } catch (parseError) {
          // keep fallback message
        }
        reject(new Error(message));
      });

      xhr.addEventListener("error", () => reject(new Error("Upload failed")));
      xhr.send(formData);
    });

    setIsUploading(false);
    setSuccess("Reel uploaded. Processing and publishing soon.");
    setProgress(100);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await uploadReel();
    } catch (err) {
      setError(err.message || "Upload failed.");
      setIsUploading(false);
    }
  };

  const dropzoneClassName = `${styles.dropzone} ${isDragging ? styles.dropzoneActive : ""}`.trim();

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.titleBlock}>
            <p className={styles.kicker}>Studio</p>
            <h1 className={styles.title}>Upload your reel</h1>
            <p className={styles.subtitle}>
              Drop your clip, tune the vibe, and publish a loop-ready reel in minutes. Keep it crisp, bold, and under 60 seconds for
              maximum impact.
            </p>
          </div>
          <div className={styles.stats}>
            <span>Drafts: 3</span>
            <span>Scheduled: 1</span>
            <span>Last upload: 2 days ago</span>
          </div>
        </header>

        <section className={styles.card}>
          <div className={styles.grid}>
            <div
              className={dropzoneClassName}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <div className={styles.dropContent}>
                {previewUrl ? (
                  <div className={styles.preview}>
                    <video className={styles.previewVideo} controls src={previewUrl} />
                    <div className={styles.previewMeta}>
                      <span>{file?.name}</span>
                      <span>{file ? `${Math.round(file.size / (1024 * 1024))} MB` : ""}</span>
                    </div>
                    <button type="button" className={styles.browseButton} onClick={handleBrowse}>
                      Replace file
                    </button>
                  </div>
                ) : (
                  <div className={styles.dropContent}>
                    <h2 className={styles.dropTitle}>Drag & drop your MP4 or MOV</h2>
                    <p className={styles.dropHint}>Up to 60 seconds, 1080x1920 recommended. We'll auto-trim and optimize playback.</p>
                    <button type="button" className={styles.browseButton} onClick={handleBrowse}>
                      Browse files
                    </button>
                  </div>
                )}
              </div>
              <input
                ref={inputRef}
                className={styles.hiddenInput}
                type="file"
                accept="video/mp4,video/quicktime"
                onChange={handleInputChange}
              />
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="title">
                  Reel title
                </label>
                <input
                  className={styles.input}
                  id="title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="City Lights Motion Reel"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="caption">
                  Caption
                </label>
                <textarea
                  className={styles.textarea}
                  id="caption"
                  value={caption}
                  onChange={(event) => setCaption(event.target.value)}
                  placeholder="Describe the mood, the story, or the drop."
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="category">
                  Category
                </label>
                <select
                  className={styles.select}
                  id="category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  <option value="visual">Visual</option>
                  <option value="music">Music</option>
                  <option value="motion">Motion Design</option>
                  <option value="culture">Culture</option>
                </select>
              </div>

              <div className={styles.field}>
                <span className={styles.label}>Suggested tags</span>
                <div className={styles.tags}>
                  {suggestedTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className={`${styles.tag} ${selectedTags.includes(tag) ? styles.tagActive : ""}`.trim()}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {error ? <p className={styles.errorText}>{error}</p> : null}
              {success ? <p className={styles.successText}>{success}</p> : null}

              {isUploading || progress > 0 ? (
                <div className={styles.progress}>
                  <div className={styles.progressTrack}>
                    <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                  </div>
                  <span className={styles.note}>{isUploading ? `Uploading... ${progress}%` : "Upload ready"}</span>
                </div>
              ) : null}

              <div className={styles.actions}>
                <button type="submit" className={styles.primaryButton} disabled={isUploading}>
                  Publish reel
                </button>
                <button type="button" className={styles.secondaryButton} disabled={isUploading}>
                  Save as draft
                </button>
              </div>
              <p className={styles.note}>Uploading means you agree to our content guidelines and licensing terms.</p>
            </form>
          </div>

          <aside className={styles.sidebar}>
            <div className={styles.panel}>
              <h3 className={styles.panelTitle}>Launch checklist</h3>
              <div className={styles.list}>
                <span>Trim to 9:16 portrait</span>
                <span>Keep sound under -6 dB</span>
                <span>Add a cover frame</span>
              </div>
            </div>

            <div className={styles.panel}>
              <h3 className={styles.panelTitle}>Release timing</h3>
              <div className={styles.list}>
                <span>Best window: 7-9 PM</span>
                <span>Audience peak: Wed / Fri</span>
                <span>Auto-publish ready</span>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
