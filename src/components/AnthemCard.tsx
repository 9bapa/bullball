'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Lock,
  Unlock,
  Copy,
  Check,
  Shield
} from 'lucide-react'

interface AnthemCardProps {
  type: 'encrypt' | 'decrypt'
  onEncrypt?: (seedPhrase: string) => void
  onDecrypt?: (lyrics: string) => void
}

export function AnthemCard({ type, onEncrypt, onDecrypt }: AnthemCardProps) {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleEncrypt = () => {
    const words = input.split(' ').filter(Boolean)
    if (words.length < 12 || words.length > 24) {
      alert('Seed phrase must be between 12 and 24 words')
      return
    }

    const shuffled = [...words].sort(() => Math.random() - 0.5)
    const verses = [
      shuffled.slice(0, 4).join(' '),
      shuffled.slice(4, 8).join(' '),
      shuffled.slice(8, 12).join(' '),
      shuffled.length > 12 ? shuffled.slice(12).join(' ') : ''
    ].filter(Boolean).join('\n\n')

    setOutput(verses)
    onEncrypt?.(input)
  }

  const handleDecrypt = () => {
    const allWords = input.split(/\s+/).sort()
    setOutput(allWords.join(' '))
    onDecrypt?.(input)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {type === 'encrypt' ? (
            <>
              <Lock className="w-5 h-5 text-primary" />
              Encrypt Your Seed Phrase
            </>
          ) : (
            <>
              <Unlock className="w-5 h-5 text-primary" />
              Decrypt Anthem Lyrics
            </>
          )}
        </CardTitle>
        <CardDescription>
          {type === 'encrypt'
            ? 'Convert your seed phrase into lyrics for BullRhun Anthem'
            : 'Paste encrypted lyrics to reveal the seed phrase'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            {type === 'encrypt' ? 'Your Seed Phrase' : 'Encrypted Lyrics'}
          </label>
          <Textarea
            placeholder={type === 'encrypt' ? 'Enter your 12-24 word seed phrase...' : 'Paste the encrypted lyrics here...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={4}
            className="resize-none font-mono text-sm"
          />
          {type === 'encrypt' && (
            <p className="text-xs text-muted-foreground mt-2">
              This will be shuffled and encrypted into verse format
            </p>
          )}
        </div>

        {output && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                {type === 'decrypt' && <Shield className="w-4 h-4 text-green-500" />}
                {type === 'encrypt' ? 'Encrypted Lyrics' : 'Decrypted Seed Phrase'}
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(output)}
                className="h-8"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            {type === 'decrypt' ? (
              <Input
                value={output}
                readOnly
                className="font-mono text-sm"
              />
            ) : (
              <Textarea
                value={output}
                readOnly
                rows={8}
                className="resize-none font-mono text-sm"
              />
            )}
            {type === 'decrypt' && (
              <p className="text-xs text-muted-foreground">
                Store this seed phrase securely. Never share it with anyone.
              </p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={type === 'encrypt' ? handleEncrypt : handleDecrypt}
          disabled={!input || (type === 'encrypt' && input.split(' ').filter(Boolean).length < 12)}
          className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
        >
          {type === 'encrypt' ? (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Encrypt Seed Phrase
            </>
          ) : (
            <>
              <Unlock className="w-4 h-4 mr-2" />
              Decrypt Lyrics
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
