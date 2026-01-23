'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  UploadCloud,
  File,
  X,
  Plus,
  XCircle,
  CheckCircle2,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface UploadedFile {
  id: string
  name: string
  size: string
  type: 'image' | 'document'
  status: 'uploading' | 'complete' | 'error'
  progress: number
}

export default function AdditionalComponents() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([
    { id: '1', name: 'card-front.png', size: '2.4 MB', type: 'image', status: 'complete', progress: 100 },
    { id: '2', name: 'card-back.png', size: '2.1 MB', type: 'image', status: 'complete', progress: 100 },
  ])
  const [uploadingFiles, setUploadingFiles] = useState<UploadedFile[]>([])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newFiles: UploadedFile[] = Array.from(files).map((file, index) => ({
      id: `new-${Date.now()}-${index}`,
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      type: file.type.startsWith('image/') ? 'image' : 'document',
      status: 'uploading',
      progress: 0,
    }))

    setUploadingFiles([...uploadingFiles, ...newFiles])

    // Simulate upload progress
    newFiles.forEach(file => {
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 15
        if (progress >= 100) {
          clearInterval(interval)
          setUploadingFiles(prev => prev.filter(f => f.id !== file.id))
          setUploadedFiles(prev => [...prev, { ...file, status: 'complete', progress: 100 }])
        } else {
          setUploadingFiles(prev =>
            prev.map(f =>
              f.id === file.id ? { ...f, progress } : f
            )
          )
        }
      }, 200)
    })
  }

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id))
  }

  const [activeTags, setActiveTags] = useState<string[]>(['trading', 'limited'])

  const toggleTag = (tag: string) => {
    setActiveTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const tags = [
    { id: 'trading', label: 'Trading', color: 'bg-emerald-500' },
    { id: 'limited', label: 'Limited', color: 'bg-amber-500' },
    { id: 'legendary', label: 'Legendary', color: 'bg-purple-500' },
    { id: 'exclusive', label: 'Exclusive', color: 'bg-pink-500' },
    { id: 'rare', label: 'Rare', color: 'bg-blue-500' },
    { id: 'new', label: 'New', color: 'bg-teal-500' },
  ]

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="h-12 w-1.5 bg-gradient-to-b from-primary to-secondary rounded-full shadow-lg animate-pulse-slow" />
          <div>
            <h2 className="text-3xl font-display font-bold text-foreground">Additional Components</h2>
            <p className="text-muted-foreground text-sm font-mono">File uploads, tags, and toasts</p>
          </div>
        </div>

        {/* File Upload Section */}
        <Card className="border-2 shadow-xl bg-gradient-to-br from-background to-primary/5 backdrop-blur-md overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-50" />
          <CardHeader className="relative z-10 pb-4">
            <CardTitle className="font-display font-bold text-2xl flex items-center gap-3">
              <UploadCloud className="h-6 w-6 text-primary" />
              File Upload
            </CardTitle>
            <p className="text-sm text-muted-foreground">Drag & drop or click to upload images</p>
          </CardHeader>
          <CardContent className="relative z-10 pt-6">
            {/* Upload Zone */}
            <div
              className="border-2 border-dashed border-primary/30 rounded-2xl p-12 text-center cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all duration-300 group"
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <UploadCloud className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-lg mb-1">
                    Drop files here
                  </p>
                  <p className="text-sm text-muted-foreground">
                    or click to browse
                  </p>
                </div>
              </div>
              <input
                id="file-input"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Upload Progress */}
            {uploadingFiles.length > 0 && (
              <div className="mt-6 space-y-3">
                <Label className="text-sm font-mono uppercase tracking-wider text-muted-foreground">
                  Uploading...
                </Label>
                {uploadingFiles.map(file => (
                  <div key={file.id} className="space-y-2">
                    <div className="flex items-center gap-3">
                      <File className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{file.name}</p>
                        <Progress value={file.progress} className="h-2 mt-1" />
                      </div>
                      <span className="text-xs font-mono text-muted-foreground">{file.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="mt-6">
                <Label className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-3">
                  Uploaded Files ({uploadedFiles.length})
                </Label>
                <div className="space-y-3">
                  {uploadedFiles.map(file => (
                    <div
                      key={file.id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-white/80 to-white/50 border border-border/20 hover:shadow-lg hover:scale-[1.01] transition-all duration-300 group"
                    >
                      <div className={cn(
                        'h-12 w-12 rounded-lg flex items-center justify-center',
                        file.type === 'image' ? 'bg-primary/10' : 'bg-secondary/10'
                      )}>
                        <File className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{file.size}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-emerald-500 text-white text-xs shadow-md">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Uploaded
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(file.id)}
                          className="h-8 w-8 hover:bg-red-10 hover:text-red-600 hover:scale-110 transition-all duration-300"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tags/Chips Section */}
      <div className="space-y-6">
        <Card className="border-2 shadow-xl bg-gradient-to-br from-background to-secondary/5 backdrop-blur-md overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-transparent to-primary/10 opacity-50" />
          <CardHeader className="relative z-10 pb-4">
            <CardTitle className="font-display font-bold text-2xl flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-secondary" />
              Tags & Chips
            </CardTitle>
            <p className="text-sm text-muted-foreground">Selectable category tags</p>
          </CardHeader>
          <CardContent className="relative z-10 pt-6">
            <Label className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-4">
              Selected Tags ({activeTags.length})
            </Label>
            <div className="flex flex-wrap gap-3">
              {tags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-full',
                    'transition-all duration-300',
                    'hover:scale-105 hover:shadow-lg',
                    'border-2 border-transparent',
                    activeTags.includes(tag.id)
                      ? `${tag.color} text-white border-white/30 shadow-xl`
                      : 'bg-white/50 hover:bg-white/80 border-border/30 text-foreground hover:border-primary/50'
                  )}
                >
                  <span className="text-sm font-medium">{tag.label}</span>
                  {activeTags.includes(tag.id) && (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                </button>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-border/30">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-sm font-mono uppercase tracking-wider text-muted-foreground">
                  Active Tags Preview
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTags([])}
                  className="shadow-md hover:scale-105 transition-all duration-300"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear All
                </Button>
              </div>
              <div className="p-6 rounded-2xl bg-gradient-to-br from-white/80 to-white/50 border border-border/20">
                <p className="text-sm text-muted-foreground mb-3">
                  Products with selected tags will appear in search results:
                </p>
                <div className="flex flex-wrap gap-2">
                  {activeTags.map(tagId => {
                    const tag = tags.find(t => t.id === tagId)!
                    return (
                      <Badge
                        key={tagId}
                        className={cn(
                          'text-sm font-semibold shadow-md',
                          tag.color,
                          'text-white'
                        )}
                      >
                        {tag.label}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleTag(tagId)
                          }}
                          className="ml-2 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )
                  })}
                  {activeTags.length === 0 && (
                    <span className="text-sm text-muted-foreground italic">
                      No tags selected
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toast Notifications Section */}
      <div className="space-y-6">
        <Card className="border-2 shadow-xl bg-gradient-to-br from-background to-accent/5 backdrop-blur-md overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-primary/10 opacity-50" />
          <CardHeader className="relative z-10 pb-4">
            <CardTitle className="font-display font-bold text-2xl flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-accent" />
              Toast Notifications
            </CardTitle>
            <p className="text-sm text-muted-foreground">Dismissible notification banners</p>
          </CardHeader>
          <CardContent className="relative z-10 pt-6 space-y-4">
            {/* Success Toast */}
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 shadow-lg">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg animate-bounce-slight">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-foreground mb-1">Order Confirmed!</p>
                    <p className="text-sm text-muted-foreground">
                      Your order #BR-2024-001 has been successfully placed.
                    </p>
                  </div>
                  <button className="shrink-0 p-2 rounded-xl hover:bg-white/20 transition-colors">
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </div>

            {/* Info Toast */}
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/30 shadow-lg">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg animate-bounce-slight">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-foreground mb-1">New Feature Available</p>
                    <p className="text-sm text-muted-foreground">
                      Check out our new custom theme system with 21+ color presets!
                    </p>
                  </div>
                  <button className="shrink-0 p-2 rounded-xl hover:bg-white/20 transition-colors">
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </div>

            {/* Warning Toast */}
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 shadow-lg">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg animate-bounce-slight">
                <UploadCloud className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-foreground mb-1">Upload In Progress</p>
                    <p className="text-sm text-muted-foreground">
                      Your files are being uploaded. Please wait...
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-amber-500 rounded-full animate-pulse" />
                    <button className="shrink-0 p-2 rounded-xl hover:bg-white/20 transition-colors">
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Toast */}
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent border border-red-500/30 shadow-lg">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg animate-bounce-slight">
                <XCircle className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-foreground mb-1">Upload Failed</p>
                    <p className="text-sm text-muted-foreground">
                      Something went wrong. Please try again.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="text-sm font-semibold text-red-600 hover:text-red-700 transition-colors">
                      Retry
                    </button>
                    <button className="shrink-0 p-2 rounded-xl hover:bg-white/20 transition-colors">
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
