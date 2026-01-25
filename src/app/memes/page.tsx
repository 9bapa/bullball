'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { useUserContext } from '@/context/userContext'
import { useToast } from '@/hooks/use-toast'
import {
  Sparkles,
  Upload,
  X,
  Share2,
  AlertCircle,
  Trash2,
  Heart,
  Eye
} from 'lucide-react'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'

interface Meme {
  id: string
  title: string
  description: string | null
  media_url: string
  media_type: 'image' | 'video'
  tags: string[]
  likes_count: number
  view_count: number
  created_at: string
  is_featured: boolean
}

export default function MemesPage() {
  const [memes, setMemes] = useState<Meme[]>([])
  const [loading, setLoading] = useState(true)

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [uploadFiles, setUploadFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const [selectedMeme, setSelectedMeme] = useState<Meme | null>(null)

  const { connected, publicKey, dbUser } = useUserContext()
  const { toast } = useToast()
  const canUpload = connected && dbUser?.role === 'super_admin'

  useEffect(() => {
    const loadMemes = async () => {
      try {
        const response = await fetch('/api/memes')
        if (response.ok) {
          const data = await response.json()
          setMemes(data)
        }
      } catch (error) {
        console.error('Failed to load memes:', error)
      } finally {
        setLoading(false)
      }
    }

    loadMemes()
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    setUploadFiles(prev => [...prev, ...selectedFiles])
  }

  const removeFile = (index: number) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (!uploadFiles.length || !publicKey || !dbUser) {
      return
    }

    const MAX_VIDEO_SIZE = 50 * 1024 * 1024
    const MAX_IMAGE_SIZE = 10 * 1024 * 1024

    for (const file of uploadFiles) {
      const isVideo = file.type.startsWith('video/')
      const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE
      if (file.size > maxSize) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
        const maxMB = (maxSize / (1024 * 1024)).toFixed(0)
        toast({
          title: 'File Too Large',
          description: `"${file.name}" (${sizeMB}MB) exceeds maximum size of ${maxMB}MB`,
          variant: 'destructive',
        })
        return
      }
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('wallet_address', publicKey)
      formData.append('role', dbUser.role)
      formData.append('title', 'BullRhun Meme')
      formData.append('description', '')
      formData.append('tags', 'BullRhun')
      formData.append('is_featured', 'false')

      uploadFiles.forEach((file, index) => {
        formData.append(`files[${index}]`, file)
      })

      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100)
          setUploadProgress(progress)
        }
      })

      xhr.addEventListener('load', () => {
        setUploadProgress(100)
      })

      xhr.open('POST', '/api/memes/upload')
      xhr.send(formData)

      const result = await new Promise((resolve, reject) => {
        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            try {
              const data = JSON.parse(xhr.responseText)
              resolve(data)
            } catch (e) {
              reject(e)
            }
          } else if (xhr.status === 413) {
            reject(new Error('File too large. Maximum size: 50MB for videos, 10MB for images'))
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`))
          }
        })
        xhr.addEventListener('error', () => reject(new Error('Upload failed')))
      }) as any

      if (result.memes) {
        setMemes(prev => [...result.memes, ...prev])
      }

      setUploadFiles([])
      setUploadProgress(0)
      setIsUploadModalOpen(false)
      toast({
        title: 'Upload Successful',
        description: `Successfully uploaded ${result.memes.length} meme${result.memes.length > 1 ? 's' : ''}`,
      })
    } catch (error) {
      console.error('Failed to upload memes:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload memes'
      toast({
        title: 'Upload Failed',
        description: errorMessage,
        variant: 'destructive',
      })
      setUploadProgress(0)
    } finally {
      setIsUploading(false)
    }
  }

  const resetUploadForm = () => {
    setUploadFiles([])
    setUploadProgress(0)
    setIsUploadModalOpen(false)
  }

  const handleShareToX = (meme: Meme) => {
    const text = encodeURIComponent(`Check out this BullRhun meme!`)
    const url = encodeURIComponent(meme.media_url)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank')
  }

  const handleDeleteMeme = async (meme: Meme) => {
    if (!dbUser) return

    try {
      console.log('Deleting meme:', { memeId: meme.id, role: dbUser.role })
      const response = await fetch('/api/memes/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: meme.id,
          role: dbUser.role
        })
      })
      console.log('Delete response:', { status: response.status, ok: response.ok })

      if (response.ok) {
        setMemes(prev => prev.filter(m => m.id !== meme.id))
        toast({
          title: 'Meme Deleted',
          description: 'The meme has been successfully deleted.',
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Delete Failed',
          description: error.error || 'Failed to delete meme',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Failed to delete meme:', error)
      toast({
        title: 'Delete Failed',
        description: 'An error occurred while deleting meme',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Sparkles className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">Loading memes...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-10 lg:py-16 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 w-48 h-48 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-full blur-3xl animate-float-slow" />
            <div className="absolute bottom-10 right-10 w-64 h-64 bg-gradient-to-br from-accent/20 via-accent/10 to-transparent rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '2s' }} />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl relative">
            <div className="text-center">
              <Badge className="mb-4 px-4 py-1.5 text-sm font-medium bg-primary/10 text-primary border-primary/20">
                <Sparkles className="w-4 h-4 mr-2" />
                BullRhun Memes
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                <span className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent animate-gradient-shift">
                  Meme Gallery
                </span>
              </h1>
              <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                The best BullRhun memes. Browse and share funniest moments.
              </p>

              {canUpload && (
                <Button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="mt-6 px-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Memes
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Masonry Gallery */}
        <section className="py-10 lg:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {memes.length === 0 ? (
              <div className="text-center py-20">
                <Sparkles className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-2">No memes found</h3>
                <p className="text-muted-foreground">
                  No memes have been added yet
                </p>
              </div>
            ) : (
              <div className="columns-2 sm:columns-2 lg:columns-3 xl:columns-4 gap-3 space-y-3">
                {memes.map((meme) => (
                  <div key={meme.id} className="break-inside-avoid group relative">
                    <div className="overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02] cursor-pointer">
                      {meme.media_type === 'video' ? (
                        <video
                          src={meme.media_url}
                          controls
                          preload="metadata"
                          className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <img
                          src={meme.media_url}
                          alt={meme.title}
                          className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                          onClick={() => setSelectedMeme(meme)}
                        />
                      )}
                      {meme.is_featured && (
                        <Badge className="absolute top-2 left-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0 text-[10px] px-2 py-0.5">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-end gap-2 p-3">
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleShareToX(meme)
                          }}
                          className="bg-white/90 hover:bg-white text-black h-8 w-8"
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                        {canUpload && (
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteMeme(meme)
                            }}
                            className="bg-red-500/90 hover:bg-red-500 text-white h-8 w-8"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Upload Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Memes</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* File Upload */}
            <div className="space-y-2">
              <div className="border-2 border-dashed border-primary/20 rounded-lg p-8 text-center hover:border-primary/40 transition-colors">
                <input
                  type="file"
                  id="meme-files"
                  multiple
                  accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label
                  htmlFor="meme-files"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="w-10 h-10 text-primary" />
                  <p className="text-sm font-medium">Click to select files</p>
                  <p className="text-xs text-muted-foreground">Images, GIFs, and Videos</p>
                </label>
              </div>

              {/* Selected Files Preview */}
              {uploadFiles.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {uploadFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      {file.type.startsWith('video/') ? (
                        <video
                          src={URL.createObjectURL(file)}
                          className="w-full aspect-square object-cover rounded-md"
                          muted
                        />
                      ) : (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full aspect-square object-cover rounded-md"
                        />
                      )}
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeFile(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                      <p className="text-xs text-center mt-1 truncate">{file.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Progress Bar */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Uploading...</span>
                  <span className="font-medium">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetUploadForm} disabled={isUploading}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!uploadFiles.length || isUploading}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Meme Detail Modal */}
      <Dialog open={!!selectedMeme} onOpenChange={(open) => !open && setSelectedMeme(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          {selectedMeme && (
            <>
              <div className="relative">
                {selectedMeme.media_type === 'video' ? (
                  <video
                    src={selectedMeme.media_url}
                    controls
                    autoPlay
                    className="w-full max-h-[70vh] object-contain bg-black"
                  />
                ) : (
                  <img
                    src={selectedMeme.media_url}
                    alt={selectedMeme.title}
                    className="w-full max-h-[70vh] object-contain bg-black"
                  />
                )}
                {selectedMeme.is_featured && (
                  <Badge className="absolute top-4 left-4 bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Featured
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedMeme(null)}
                  className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">{selectedMeme.title}</h2>
                    {selectedMeme.description && (
                      <p className="text-muted-foreground">{selectedMeme.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => handleShareToX(selectedMeme)}
                      className="bg-white/90 hover:bg-white text-black"
                    >
                      <Share2 className="w-5 h-5" />
                    </Button>
                    {canUpload && (
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => {
                          handleDeleteMeme(selectedMeme)
                          setSelectedMeme(null)
                        }}
                        className="bg-red-500/90 hover:bg-red-500 text-white"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    )}
                  </div>
                </div>

                {selectedMeme.tags && selectedMeme.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedMeme.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-4 h-4" />
                    <span>{selectedMeme.likes_count} likes</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    <span>{selectedMeme.view_count} views</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <X className="w-4 h-4 rotate-45" />
                    <span>{new Date(selectedMeme.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
                      <MobileBottomNav />
      
    </div>
  )
}
