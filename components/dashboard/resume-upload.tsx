"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, File, FileText, Loader2, Check, AlertCircle, Trash2 } from "lucide-react"

interface UploadedFile {
  id: string
  name: string
  size: number
  type: "pdf" | "docx"
  progress: number
  status: "uploading" | "processing" | "completed" | "error"
  grades?: {
    overall: number
    skillMatch: number
    relevance: number
    quality: number
  }
}

export function ResumeUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    processFiles(e.dataTransfer.files)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files)
    }
  }

  const processFiles = (fileList: FileList) => {
    Array.from(fileList).forEach((file) => {
      if (file.type === "application/pdf" || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        const fileType = file.type === "application/pdf" ? "pdf" : "docx"
        const newFile: UploadedFile = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          type: fileType,
          progress: 0,
          status: "uploading",
        }

        setFiles((prev) => [...prev, newFile])

        // Simulate upload and processing
        simulateUpload(newFile.id)
      }
    })
  }

  const simulateUpload = (fileId: string) => {
    let progress = 0
    const uploadInterval = setInterval(() => {
      progress += Math.random() * 30
      if (progress >= 100) {
        progress = 100
        clearInterval(uploadInterval)
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? { ...f, progress: 100, status: "processing" }
              : f
          )
        )
        simulateProcessing(fileId)
      } else {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? { ...f, progress: Math.min(progress, 99) }
              : f
          )
        )
      }
    }, 300)
  }

  const simulateProcessing = (fileId: string) => {
    const processingInterval = setInterval(() => {
      const random = Math.random()
      clearInterval(processingInterval)
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                progress: 100,
                status: random > 0.1 ? "completed" : "error",
                grades:
                  random > 0.1
                    ? {
                        overall: Math.floor(Math.random() * 40 + 60),
                        skillMatch: Math.floor(Math.random() * 30 + 70),
                        relevance: Math.floor(Math.random() * 30 + 65),
                        quality: Math.floor(Math.random() * 30 + 70),
                      }
                    : undefined,
              }
            : f
        )
      )
    }, 2000)
  }

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const getFileIcon = (type: "pdf" | "docx") => {
    if (type === "pdf") {
      return <FileText className="h-5 w-5 text-destructive" />
    }
    return <File className="h-5 w-5 text-primary" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <Card className={`border-2 border-dashed transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
        <CardContent className="flex flex-col items-center justify-center p-12">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mb-1 text-lg font-semibold text-card-foreground">Upload Resumes</h3>
          <p className="mb-6 text-sm text-muted-foreground">Drag and drop PDF or DOCX files here, or click to browse</p>

          <div className="flex gap-3">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <label className="cursor-pointer">
                <span className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Select Files
                </span>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.docx"
                  onChange={handleFileInput}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className="hidden"
                />
              </label>
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              Learn about file requirements
            </Button>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">Supports PDF and DOCX files up to 10MB each</p>
        </CardContent>
      </Card>

      {/* Uploaded Files */}
      {files.length > 0 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base">Uploaded Files</CardTitle>
            <CardDescription>{files.length} file(s) selected for processing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {files.map((file) => (
              <div key={file.id} className="rounded-lg border border-border bg-secondary/30 p-4">
                {/* File Header */}
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex gap-3">
                    {getFileIcon(file.type)}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-card-foreground">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {file.status === "completed" && (
                      <Check className="h-5 w-5 text-accent" />
                    )}
                    {file.status === "error" && (
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    )}
                    {(file.status === "uploading" || file.status === "processing") && (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(file.id)}
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Progress Bar */}
                {(file.status === "uploading" || file.status === "processing") && (
                  <>
                    <Progress value={file.progress} className="h-1.5 mb-2" />
                    <p className="text-xs text-muted-foreground">
                      {file.status === "uploading" ? "Uploading..." : "Processing with AI..."}
                    </p>
                  </>
                )}

                {/* Results */}
                {file.status === "completed" && file.grades && (
                  <div className="grid grid-cols-4 gap-2">
                    <div className="rounded bg-primary/5 p-2 text-center">
                      <p className="text-lg font-bold text-primary">{file.grades.overall}</p>
                      <p className="text-[10px] text-muted-foreground">Overall</p>
                    </div>
                    <div className="rounded bg-accent/5 p-2 text-center">
                      <p className="text-lg font-bold text-accent">{file.grades.skillMatch}</p>
                      <p className="text-[10px] text-muted-foreground">Skill</p>
                    </div>
                    <div className="rounded bg-warning/5 p-2 text-center">
                      <p className="text-lg font-bold text-warning">{file.grades.relevance}</p>
                      <p className="text-[10px] text-muted-foreground">Rel.</p>
                    </div>
                    <div className="rounded bg-secondary p-2 text-center">
                      <p className="text-lg font-bold text-secondary-foreground">{file.grades.quality}</p>
                      <p className="text-[10px] text-muted-foreground">Quality</p>
                    </div>
                  </div>
                )}

                {file.status === "error" && (
                  <p className="text-xs text-destructive">Failed to process file. Please try again.</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Info Box */}
      {files.length === 0 && (
        <Card className="border-border bg-secondary/30">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-primary" />
              <div className="text-sm">
                <p className="font-medium text-card-foreground">Resume Processing</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Upload resumes to automatically grade them using our AI system. We analyze skill match, relevance, and resume quality metrics.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
